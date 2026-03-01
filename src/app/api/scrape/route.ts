import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { urlSchema } from "@/lib/validators";
import { authOptions } from "@/lib/auth";
import { analyzeSeo, PageExtraction } from "@/lib/seoAnalyzer";
import { scrapeSite } from "@/lib/scraper";
import { checkRobotsTxt } from "@/lib/robotsChecker";
import { ScrapeResponse } from "@/types";

// Simple in-memory rate limiter per user
const lastRequest = new Map<string, number>();

// Max body text length stored in DB (characters)
const MAX_BODY_TEXT = 5000;

// Allow up to 60 s on Vercel Pro / 10 s on Hobby
export const maxDuration = 60;

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

    const userId = session.user.id;

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
    const scraped = await scrapeSite(url);

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

    // Truncate body text to prevent oversized DB writes
    const bodyText = scraped.bodyText
      ? scraped.bodyText.substring(0, MAX_BODY_TEXT)
      : null;

    // ── Persist to DB ──
    const requestLog = await prisma.requestLog.create({
      data: {
        url,
        method: "GET",
        statusCode: scraped.statusCode || 200,
        responseTime: scraped.responseTime,
        userId,
      },
    });

    const scrapedData = await prisma.scrapedData.create({
      data: {
        requestId: requestLog.id,
        title: scraped.title || "No title found",
        headings: scraped.headings,
        meta: scraped.meta,
        bodyText,
        seoScore: seoAnalysis.seoScore,
        wordCount: seoAnalysis.metrics.wordCount,
        h1Count: seoAnalysis.metrics.h1Count,
        h2Count: seoAnalysis.metrics.h2Count,
        metaLength: seoAnalysis.metrics.metaLength,
        titleLength: seoAnalysis.metrics.titleLength,
        missingAltCount: seoAnalysis.metrics.missingAltCount,
      },
    });

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
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
