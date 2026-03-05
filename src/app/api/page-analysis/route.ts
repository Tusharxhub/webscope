import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonApiError } from "@/lib/errorHandler";
import { urlSchema } from "@/lib/validators";
import { crawlWebsite } from "@/lib/pageCrawler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonApiError("VALIDATION", "Invalid JSON body", 400);
    }

    const parsed = urlSchema.safeParse(body);
    if (!parsed.success) {
      return jsonApiError("VALIDATION", parsed.error.issues[0]?.message || "Invalid URL", 400);
    }

    const siteUrl = parsed.data.url;
    const pages = await crawlWebsite(siteUrl);

    if (pages.length === 0) {
      return jsonApiError("NETWORK", "No pages were analyzed for this URL", 502);
    }

    const created = await prisma.$transaction(
      pages.map((page) =>
        prisma.pageAnalysis.create({
          data: {
            siteUrl,
            pageUrl: page.pageUrl,
            title: page.title,
            metaDesc: page.metaDescription,
            metaKeywords: page.metaKeywords,
            h1: page.h1Count,
            h2: page.h2Count,
            h3: page.h3Count,
            wordCount: page.wordCount,
            paragraphCount: page.paragraphCount,
            imageCount: page.imageCount,
            imagesWithoutAlt: page.imagesWithoutAlt,
            scriptCount: page.scriptCount,
            internalLinks: page.internalLinks,
            externalLinks: page.externalLinks,
            buttons: page.buttons,
            forms: page.forms,
            inputs: page.inputs,
            responseTime: page.responseTime,
            htmlSize: page.htmlSize,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      data: {
        siteUrl,
        pagesAnalyzed: created.length,
        pages,
      },
    });
  } catch (error) {
    console.error("Page analysis POST error:", error);
    return jsonApiError("UNKNOWN", "Failed to analyze pages", 500);
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    const rows = await prisma.pageAnalysis.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("Page analysis GET error:", error);
    return jsonApiError("UNKNOWN", "Failed to fetch analysis", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const siteUrl = searchParams.get("siteUrl") || searchParams.get("url");

    if (!siteUrl) {
      return jsonApiError("VALIDATION", "siteUrl query parameter is required", 400);
    }

    const deleted = await prisma.pageAnalysis.deleteMany({
      where: { siteUrl },
    });

    return NextResponse.json({
      success: true,
      data: { deletedCount: deleted.count, siteUrl },
    });
  } catch (error) {
    console.error("Page analysis DELETE error:", error);
    return jsonApiError("UNKNOWN", "Failed to delete analysis", 500);
  }
}
