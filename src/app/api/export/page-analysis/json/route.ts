import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonApiError } from "@/lib/errorHandler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    const rows = await prisma.pageAnalysis.findMany({
      orderBy: { createdAt: "desc" },
    });

    const payload = {
      success: true,
      generatedAt: new Date().toISOString(),
      count: rows.length,
      data: rows,
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="page-analysis.json"',
      },
    });
  } catch (error) {
    console.error("Page analysis JSON export error:", error);
    return jsonApiError("UNKNOWN", "Failed to export JSON", 500);
  }
}
