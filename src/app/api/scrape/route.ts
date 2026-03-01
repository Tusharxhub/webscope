import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { urlSchema } from "@/lib/validators";
import { authOptions } from "@/lib/auth";
import { analyzeWebsite } from "@/lib/analyzeWebsite";
import { ScrapeResponse } from "@/types";
import { classifyPrismaError, jsonApiError } from "@/lib/errorHandler";

// Simple in-memory rate limiter per user
const lastRequest = new Map<string, number>();

// Max body text length stored in DB (characters)
const MAX_BODY_TEXT = 5000;

// Allow up to 60 s on Vercel Pro / 10 s on Hobby
export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(
  req: NextRequest
): Promise<NextResponse<ScrapeResponse>> {
  try {
    // ── Auth ──
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonApiError("UNAUTHORIZED", "Unauthorized", 401);
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
          return jsonApiError("UNAUTHORIZED", "Session is no longer valid. Please sign in again.", 401);
        }
      } else {
        return jsonApiError("UNAUTHORIZED", "Session is no longer valid. Please sign in again.", 401);
      }
    }

    // ── Rate limit: 1 request per 3 seconds per user ──
    const now = Date.now();
    const last = lastRequest.get(userId) || 0;
    if (now - last < 3000) {
      return jsonApiError("VALIDATION", "Please wait a moment before scraping again", 429);
    }
    lastRequest.set(userId, now);

    // ── Validate body ──
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonApiError("VALIDATION", "Invalid JSON body", 400);
    }

    const parsed = urlSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Invalid URL";
      return jsonApiError("VALIDATION", msg, 400);
    }

    const { url } = parsed.data;

    const analysis = await analyzeWebsite(url);
    if (!analysis.ok || !analysis.scraped || !analysis.seoAnalysis || !analysis.performance || !analysis.animalSpirit) {
      const status =
        analysis.errorType === "DISALLOWED_BY_ROBOTS"
          ? 403
          : analysis.errorType === "TIMEOUT" || analysis.errorType === "NETWORK"
          ? 502
          : 500;

      return NextResponse.json(
        {
          success: false,
          errorType: analysis.errorType || "UNKNOWN",
          message: analysis.message || "Failed to analyze website",
          error: analysis.message || "Failed to analyze website",
          statusCode: analysis.statusCode,
        },
        { status }
      );
    }

    const scraped = analysis.scraped;
    const seoAnalysis = analysis.seoAnalysis;
    const animalSpiritResult = analysis.animalSpirit;

    // Truncate body text to prevent oversized DB writes
    const bodyText = scraped.bodyText
      ? scraped.bodyText.substring(0, MAX_BODY_TEXT)
      : null;

    // ── Persist to DB ──
    let requestLog: {
      id: string;
      url: string;
      method: string;
      statusCode: number;
      responseTime: number;
      userId: string;
      createdAt: Date;
    };
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
      const basePayload = {
        title: scraped.title || "No title found",
        headings: scraped.headings,
        meta: scraped.meta,
        bodyText,
      };

      try {
        const txResult = await prisma.$transaction(async (tx) => {
          const createdRequestLog = await tx.requestLog.create({
            data: {
              url,
              method: "GET",
              statusCode: scraped.statusCode || 200,
              responseTime: scraped.responseTime,
              userId,
            },
            select: {
              id: true,
              url: true,
              method: true,
              statusCode: true,
              responseTime: true,
              userId: true,
              createdAt: true,
            },
          });

          const fullScrapedData = await tx.scrapedData.create({
            data: {
              requestId: createdRequestLog.id,
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

          return { createdRequestLog, fullScrapedData };
        });

        requestLog = txResult.createdRequestLog;
        const fullScrapedData = txResult.fullScrapedData;

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
        const createInfo = classifyPrismaError(createError);

        if (createInfo.type === "DATABASE" && createInfo.status === 503) {
          console.warn(
            "SCRAPE LEGACY SCHEMA FALLBACK: saving without AI/extended metric fields"
          );

          const legacyTx = await prisma.$transaction(async (tx) => {
            const createdRequestLog = await tx.requestLog.create({
              data: {
                url,
                method: "GET",
                statusCode: scraped.statusCode || 200,
                responseTime: scraped.responseTime,
                userId,
              },
              select: {
                id: true,
                url: true,
                method: true,
                statusCode: true,
                responseTime: true,
                userId: true,
                createdAt: true,
              },
            });

            const legacyScrapedData = await tx.scrapedData.create({
              data: {
                requestId: createdRequestLog.id,
                ...basePayload,
              },
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

            return { createdRequestLog, legacyScrapedData };
          });

          requestLog = legacyTx.createdRequestLog;
          const legacyScrapedData = legacyTx.legacyScrapedData;

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
      const prismaError = classifyPrismaError(error);
      return jsonApiError(prismaError.type, prismaError.message, prismaError.status);
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
    const prismaError = classifyPrismaError(error);
    return jsonApiError(prismaError.type, prismaError.message, prismaError.status);
  }
}
