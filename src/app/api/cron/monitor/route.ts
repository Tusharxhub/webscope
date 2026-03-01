import { NextRequest, NextResponse } from "next/server";
import { runMonitorBatch } from "@/services/monitorService";
import { jsonApiError } from "@/lib/errorHandler";

export const runtime = "nodejs";
export const maxDuration = 60;

function isAuthorizedCronRequest(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return true;

  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return token === expected;
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return jsonApiError("UNAUTHORIZED", "Unauthorized cron request", 401);
  }

  try {
    const report = await runMonitorBatch(3);
    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error("CRON MONITOR ERROR:", error);
    return jsonApiError("UNKNOWN", "Monitor execution failed", 500);
  }
}
