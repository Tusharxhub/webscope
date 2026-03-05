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

    // Generate CSV content
    const headers = [
      "Page URL",
      "Title",
      "Meta Description",
      "H1", "H2", "H3", "H4", "H5", "H6",
      "Word Count",
      "Paragraphs",
      "Sections",
      "Images",
      "Images Without Alt",
      "Videos",
      "Buttons",
      "Forms",
      "Inputs",
      "Internal Links",
      "External Links",
      "Broken Links",
      "Scripts",
      "Inline Scripts",
      "External Scripts",
      "Response Time (ms)",
      "HTML Size (KB)",
    ];

    const rows = scan.pageMetadata.map((page) => [
      page.pageUrl,
      page.title || "",
      page.metaDesc || "",
      page.h1Count.toString(),
      page.h2Count.toString(),
      page.h3Count.toString(),
      page.h4Count.toString(),
      page.h5Count.toString(),
      page.h6Count.toString(),
      page.wordCount.toString(),
      page.paragraphCount.toString(),
      page.sectionCount.toString(),
      page.imageCount.toString(),
      page.imagesWithoutAlt.toString(),
      page.videoCount.toString(),
      page.buttonCount.toString(),
      page.formCount.toString(),
      page.inputCount.toString(),
      page.internalLinks.toString(),
      page.externalLinks.toString(),
      page.brokenLinks.toString(),
      page.scriptCount.toString(),
      page.inlineScripts.toString(),
      page.externalScripts.toString(),
      page.responseTime.toString(),
      (page.htmlSize / 1024).toFixed(2),
    ]);

    // Escape CSV values
    const escapeCSV = (value: string) => {
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    // Return CSV file
    const filename = `scan-${scan.url.replace(/[^a-z0-9]/gi, "-")}-${new Date(scan.createdAt).toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("CSV export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
