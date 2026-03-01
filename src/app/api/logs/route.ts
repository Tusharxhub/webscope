import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "10")));

    const [logs, total] = await Promise.all([
      prisma.requestLog.findMany({
        where: { userId },
        include: { scrapedData: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.requestLog.count({ where: { userId } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        logs: logs.map((log) => ({
          ...log,
          createdAt: log.createdAt.toISOString(),
          scrapedData: log.scrapedData.map((sd) => ({
            ...sd,
            createdAt: sd.createdAt.toISOString(),
          })),
        })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Logs fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch logs" }, { status: 500 });
  }
}
