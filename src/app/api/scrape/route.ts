import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { urlSchema } from "@/lib/validators";
import { authOptions } from "@/lib/auth";
import { analyzeSeo, PageExtraction } from "@/lib/seoAnalyzer";
import { scrapeSite } from "@/lib/scraper";
import { checkRobotsTxt } from "@/lib/robotsChecker";
import { generateAnimalSpirit, getFallbackAnimalSpirit } from "@/lib/animalSpirit";
import { ScrapeResponse } from "@/types";

// Simple in-memory rate limiter per user
const lastRequest = new Map<string, number>();

// Max body text length stored in DB (characters)
const MAX_BODY_TEXT = 5000;

// Allow up to 60 s on Vercel Pro / 10 s on Hobby
export const maxDuration = 60;
export const runtime = "nodejs";

type ErrorWithCode = {
  code?: string;
  message?: string;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Internal server error";
}

function getErrorCode(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as ErrorWithCode).code === "string"
  ) {
    return (error as ErrorWithCode).code as string;
  }
  return null;
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ScrapeResponse>> {
  try {
    // ── Auth ──
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Resolve a valid DB user id from session to avoid stale-token FK errors
    let userId = session.user.id;
    const userExists = await prisma.user.findUnique({ where: { id: userId } });

    if (!userExists) {
      const sessionEmail = session.user.email;
      if (sessionEmail) {
        const userByEmail = await prisma.user.findUnique({
          where: { email: sessionEmail },
          select: { id: true },
        });

        if (userByEmail) {
          userId = userByEmail.id;
        } else {
          return NextResponse.json(
            {
              success: false,
              errorType: "UNKNOWN" as const,
              error: "Session is no longer valid. Please sign in again.",
            },
            { status: 401 }
          );
        }
      } else {
        return NextResponse.json(
          {
            success: false,
            errorType: "UNKNOWN" as const,
            error: "Session is no longer valid. Please sign in again.",
          },
          { status: 401 }
        );
      }
    }

    // ── Rate limit: 1 request per 3 seconds per user ──
    const now = Date.now();
    const last = lastRequest.get(userId) || 0;
    if (now - last < 3000) {
      return NextResponse.json(
        { success: false, error: "Please wait a moment before scraping again" },
        { status: 429 }
      );
    }
    lastRequest.set(userId, now);

    // ── Validate body ──
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const parsed = urlSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Invalid URL";
      return NextResponse.json(
        { success: false, error: msg },
        { status: 400 }
      );
    }

    const { url } = parsed.data;

    // ── Ethical check: robots.txt ──
    const robotsCheck = await checkRobotsTxt(url);
    if (!robotsCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 0,
          errorType: "DISALLOWED_BY_ROBOTS" as const,
          error: robotsCheck.reason || "Scraping disallowed by robots.txt",
        },
        { status: 403 }
      );
    }

    // ── Scrape with Axios + Cheerio (lightweight, serverless-safe) ──
    let scraped;
    try {
      scraped = await scrapeSite(url);
    } catch (error) {
      console.error("SCRAPE NETWORK ERROR:", error);
      return NextResponse.json(
        {
          success: false,
          errorType: "NETWORK" as const,
          statusCode: 0,
          error:
            "Failed to fetch the target URL. The site may be unavailable, blocking requests, or taking too long to respond.",
        },
        { status: 502 }
      );
    }

    // ── SEO Analysis ──
    const pageExtraction: PageExtraction = {
      title: scraped.title,
      meta: scraped.meta,
      h1Count: scraped.h1Count,
      h2Count: scraped.h2Count,
      bodyText: scraped.bodyText,
      totalImages: scraped.imageCount,
      imagesWithoutAlt: scraped.imagesWithoutAlt,
    };
    const seoAnalysis = analyzeSeo(pageExtraction);

    let animalSpiritResult = getFallbackAnimalSpirit({
      title: scraped.title || "Untitled page",
      seoScore: seoAnalysis.seoScore,
      wordCount: seoAnalysis.metrics.wordCount,
      totalTime: scraped.responseTime,
      h1Count: scraped.h1Count,
      h2Count: scraped.h2Count,
    });

    try {
      animalSpiritResult = await generateAnimalSpirit({
        title: scraped.title || "Untitled page",
        seoScore: seoAnalysis.seoScore,
        wordCount: seoAnalysis.metrics.wordCount,
        totalTime: scraped.responseTime,
        h1Count: scraped.h1Count,
        h2Count: scraped.h2Count,
      });
    } catch (error) {
      console.error("SCRAPE ANIMAL SPIRIT ERROR:", error);
    }

    // Truncate body text to prevent oversized DB writes
    const bodyText = scraped.bodyText
      ? scraped.bodyText.substring(0, MAX_BODY_TEXT)
      : null;

    // ── Persist to DB ──
    let requestLog;
    let scrapedData: {
      id: string;
      requestId: string;
      title: string;
      headings: string[];
      meta: string | null;
      bodyText: string | null;
      animalType: string | null;
      animalSpirit: string | null;
      seoScore: number | null;
      wordCount: number | null;
      h1Count: number | null;
      h2Count: number | null;
      metaLength: number | null;
      titleLength: number | null;
      missingAltCount: number | null;
      createdAt: Date;
    };
    try {
      requestLog = await prisma.requestLog.create({
        data: {
          url,
          method: "GET",
          statusCode: scraped.statusCode || 200,
          responseTime: scraped.responseTime,
          userId,
        },
      });

      const basePayload = {
        requestId: requestLog.id,
        title: scraped.title || "No title found",
        headings: scraped.headings,
        meta: scraped.meta,
        bodyText,
      };

      try {
        const fullScrapedData = await prisma.scrapedData.create({
          data: {
            ...basePayload,
            animalType: animalSpiritResult.animal,
            animalSpirit: `${animalSpiritResult.personality}. ${animalSpiritResult.insight}`,
            seoScore: seoAnalysis.seoScore,
            wordCount: seoAnalysis.metrics.wordCount,
            h1Count: seoAnalysis.metrics.h1Count,
            h2Count: seoAnalysis.metrics.h2Count,
            metaLength: seoAnalysis.metrics.metaLength,
            titleLength: seoAnalysis.metrics.titleLength,
            missingAltCount: seoAnalysis.metrics.missingAltCount,
          },
        });

        scrapedData = {
          ...fullScrapedData,
          animalType: fullScrapedData.animalType ?? null,
          animalSpirit: fullScrapedData.animalSpirit ?? null,
          seoScore: fullScrapedData.seoScore ?? null,
          wordCount: fullScrapedData.wordCount ?? null,
          h1Count: fullScrapedData.h1Count ?? null,
          h2Count: fullScrapedData.h2Count ?? null,
          metaLength: fullScrapedData.metaLength ?? null,
          titleLength: fullScrapedData.titleLength ?? null,
          missingAltCount: fullScrapedData.missingAltCount ?? null,
        };
      } catch (createError) {
        const createCode = getErrorCode(createError);

        if (["P2021", "P2022"].includes(createCode || "")) {
          console.warn(
            "SCRAPE LEGACY SCHEMA FALLBACK: saving without AI/extended metric fields"
          );

          const legacyScrapedData = await prisma.scrapedData.create({
            data: basePayload,
            select: {
              id: true,
              requestId: true,
              title: true,
              headings: true,
              meta: true,
              bodyText: true,
              createdAt: true,
            },
          });

          scrapedData = {
            ...legacyScrapedData,
            animalType: null,
            animalSpirit: null,
            seoScore: null,
            wordCount: null,
            h1Count: null,
            h2Count: null,
            metaLength: null,
            titleLength: null,
            missingAltCount: null,
          };
        } else {
          throw createError;
        }
      }
    } catch (error) {
      console.error("SCRAPE DATABASE ERROR:", error);
      const code = getErrorCode(error);

      if (["P1000", "P1001", "P1002", "P1017"].includes(code || "")) {
        return NextResponse.json(
          {
            success: false,
            errorType: "UNKNOWN" as const,
            error:
              "Database connection failed. Check DATABASE_URL and database availability.",
          },
          { status: 503 }
        );
      }

      if (["P2021", "P2022"].includes(code || "")) {
        return NextResponse.json(
          {
            success: false,
            errorType: "UNKNOWN" as const,
            error:
              "Database schema is out of sync. Run Prisma migrations (or db push) on the production database.",
          },
          { status: 503 }
        );
      }

      if (code === "P2003") {
        return NextResponse.json(
          {
            success: false,
            errorType: "UNKNOWN" as const,
            error: "Session is no longer valid. Please sign in again.",
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          errorType: "UNKNOWN" as const,
          error: getErrorMessage(error),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        requestLog: {
          ...requestLog,
          createdAt: requestLog.createdAt.toISOString(),
        },
        scrapedData: {
          ...scrapedData,
          createdAt: scrapedData.createdAt.toISOString(),
        },
        seoAnalysis,
      },
    });
  } catch (error: unknown) {
    console.error("SCRAPE ERROR:", error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
