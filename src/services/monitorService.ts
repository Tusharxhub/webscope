import { prisma } from "@/lib/prisma";
import { analyzeWebsite } from "@/lib/analyzeWebsite";

const DEFAULT_BATCH_SIZE = 3;
const MAX_MONITOR_URLS = 24;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export interface MonitorRunResult {
  totalUrls: number;
  succeeded: number;
  failed: number;
  disallowed: number;
  results: Array<{
    url: string;
    ok: boolean;
    statusCode: number;
    errorType?: string;
    message?: string;
  }>;
}

export async function runMonitorBatch(batchSize = DEFAULT_BATCH_SIZE): Promise<MonitorRunResult> {
  const recentLogs = await prisma.requestLog.findMany({
    select: { url: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const uniqueUrls = Array.from(new Set(recentLogs.map((log) => log.url))).slice(0, MAX_MONITOR_URLS);

  const aggregated: MonitorRunResult = {
    totalUrls: uniqueUrls.length,
    succeeded: 0,
    failed: 0,
    disallowed: 0,
    results: [],
  };

  for (const group of chunk(uniqueUrls, batchSize)) {
    const batch = await Promise.all(group.map((url) => analyzeWebsite(url)));

    for (const entry of batch) {
      if (entry.ok) aggregated.succeeded += 1;
      else if (entry.errorType === "DISALLOWED_BY_ROBOTS") aggregated.disallowed += 1;
      else aggregated.failed += 1;

      aggregated.results.push({
        url: entry.url,
        ok: entry.ok,
        statusCode: entry.statusCode,
        errorType: entry.errorType,
        message: entry.message,
      });
    }
  }

  return aggregated;
}
