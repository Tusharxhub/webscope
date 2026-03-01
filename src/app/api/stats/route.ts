import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [totalRequests, successCount, allLogs] = await Promise.all([
      prisma.requestLog.count({ where: { userId } }),
      prisma.requestLog.count({ where: { userId, statusCode: { gte: 200, lt: 300 } } }),
      prisma.requestLog.findMany({ where: { userId }, select: { responseTime: true } }),
    ]);

    const avgResponseTime =
      allLogs.length > 0
        ? Math.round(allLogs.reduce((sum, l) => sum + l.responseTime, 0) / allLogs.length)
        : 0;

    const successRate = totalRequests > 0 ? Math.round((successCount / totalRequests) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: { totalRequests, avgResponseTime, successRate },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 });
  }
}
