import { ScrapeResponse } from "@/types";
import StatusBadge from "./StatusBadge";
import ResponseTimeBadge from "./ResponseTimeBadge";

interface ScrapeResultCardProps {
  result: ScrapeResponse;
}

export default function ScrapeResultCard({ result }: ScrapeResultCardProps) {
  if (!result.data) return null;

  const { requestLog, scrapedData } = result.data;
  const headings: string[] = scrapedData.headings ?? [];

  return (
    <div className="w-full animate-fade-in">
      <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {scrapedData.title || "No title"}
            </h3>
            <p className="text-xs font-mono text-zinc-400 dark:text-zinc-600 truncate mt-0.5">
              {requestLog.url}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge code={requestLog.statusCode} />
            <ResponseTimeBadge ms={requestLog.responseTime} />
          </div>
        </div>

        {/* Headings */}
        {headings.length > 0 && (
          <div>
            <h4 className="text-[10px] font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-mono mb-2">
              H2 Headings ({headings.length})
            </h4>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {headings.map((heading, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 flex items-center justify-center text-[10px] font-mono">
                    {i + 1}
                  </span>
                  <span className="truncate">{heading}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {headings.length === 0 && (
          <p className="text-xs text-zinc-400 dark:text-zinc-600 font-mono">
            No headings found on this page.
          </p>
        )}

        {/* Body Text Preview */}
        {scrapedData.bodyText && (
          <div>
            <h4 className="text-[10px] font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-mono mb-2">
              Body Text Preview
            </h4>
            <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 rounded-md p-2.5 border border-zinc-200 dark:border-zinc-700/60 max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {scrapedData.bodyText.length > 1000
                ? scrapedData.bodyText.substring(0, 1000) + "\u2026"
                : scrapedData.bodyText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
