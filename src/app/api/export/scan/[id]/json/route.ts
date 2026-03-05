import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const scanId = params.id;

    // Fetch scan with page metadata
    const scan = await prisma.scanHistory.findFirst({
      where: {
        id: scanId,
        userId: session.user.id,
      },
      include: {
        pageMetadata: {
          orderBy: { pageUrl: "asc" },
        },
      },
    });

    if (!scan) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    // Generate JSON export
    const exportData = {
      scan: {
        id: scan.id,
        url: scan.url,
        seoScore: scan.seoScore,
        performanceScore: scan.performanceScore,
        responseTime: scan.responseTime,
        animalSpirit: scan.animalSpirit,
        statusCode: scan.statusCode,
        scannedAt: scan.createdAt.toISOString(),
      },
      pages: scan.pageMetadata.map((page) => ({
        pageUrl: page.pageUrl,
        title: page.title,
        metadata: {
          description: page.metaDesc,
          keywords: page.metaKeywords,
          canonical: page.canonicalTag,
          robots: page.robotsMeta,
        },
        headings: {
          h1: page.h1Count,
          h2: page.h2Count,
          h3: page.h3Count,
          h4: page.h4Count,
          h5: page.h5Count,
          h6: page.h6Count,
          total: page.headingCount,
        },
        content: {
          wordCount: page.wordCount,
          paragraphCount: page.paragraphCount,
          sectionCount: page.sectionCount,
          divCount: page.divCount,
          textLength: page.textLength,
          contentSizeKb: page.contentSizeKb,
        },
        media: {
          images: page.imageCount,
          imagesWithoutAlt: page.imagesWithoutAlt,
          videos: page.videoCount,
          iframes: page.iframeCount,
        },
        interactive: {
          buttons: page.buttonCount,
          forms: page.formCount,
          inputs: page.inputCount,
          selects: page.selectCount,
          textareas: page.textareaCount,
          navElements: page.navElements,
          tables: page.tableCount,
          lists: page.listCount,
        },
        links: {
          internal: page.internalLinks,
          external: page.externalLinks,
          broken: page.brokenLinks,
          total: page.internalLinks + page.externalLinks,
        },
        scripts: {
          total: page.scriptCount,
          inline: page.inlineScripts,
          external: page.externalScripts,
        },
        performance: {
          responseTime: page.responseTime,
          htmlSize: page.htmlSize,
          htmlSizeKb: (page.htmlSize / 1024).toFixed(2),
        },
      })),
      summary: {
        totalPages: scan.pageMetadata.length,
        avgResponseTime: Math.round(
          scan.pageMetadata.reduce((sum, p) => sum + p.responseTime, 0) /
            scan.pageMetadata.length || 0
        ),
        totalWords: scan.pageMetadata.reduce((sum, p) => sum + p.wordCount, 0),
        totalImages: scan.pageMetadata.reduce((sum, p) => sum + p.imageCount, 0),
        totalScripts: scan.pageMetadata.reduce((sum, p) => sum + p.scriptCount, 0),
        totalForms: scan.pageMetadata.reduce((sum, p) => sum + p.formCount, 0),
        totalLinks: scan.pageMetadata.reduce(
          (sum, p) => sum + p.internalLinks + p.externalLinks,
          0
        ),
      },
      exportedAt: new Date().toISOString(),
    };

    const filename = `scan-${scan.url.replace(/[^a-z0-9]/gi, "-")}-${new Date(scan.createdAt).toISOString().split("T")[0]}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("JSON export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
