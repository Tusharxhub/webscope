import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonApiError } from "@/lib/errorHandler";
import { toCSV } from "@/lib/csvExporter";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    const rows = await prisma.pageAnalysis.findMany({ orderBy: { createdAt: "desc" } });

    if (rows.length === 0) {
      return new NextResponse("No page analysis data found", { status: 404 });
    }

    const headers = [
      "Page URL",
      "Title",
      "Meta Description",
      "H1",
      "H2",
      "Word Count",
      "Images",
      "Scripts",
      "Buttons",
      "Forms",
      "Response Time",
    ];

    const csv = toCSV(rows, headers, (row) => [
      row.pageUrl,
      row.title,
      row.metaDesc,
      row.h1,
      row.h2,
      row.wordCount,
      row.imageCount,
      row.scriptCount,
      row.buttons,
      row.forms,
      row.responseTime,
    ]);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="page-analysis.csv"',
      },
    });
  } catch (error) {
    console.error("Page analysis CSV export error:", error);
    return jsonApiError("UNKNOWN", "Failed to export CSV", 500);
  }
}
