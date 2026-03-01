import { ScrapeResponse } from "@/types";
import StatusBadge from "./StatusBadge";
import ResponseTimeBadge from "./ResponseTimeBadge";

interface ScrapeResultCardProps {
  result: ScrapeResponse;
}

export default function ScrapeResultCard({ result }: ScrapeResultCardProps) {
  if (!result.data) return null;

  const { requestLog, scrapedData } = result.data;
  const headings = scrapedData.content ? scrapedData.content.split(" | ") : [];

  return (
    <div className="w-full animate-fadeIn">
      <div className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200/60 dark:border-white/10 shadow-lg p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {scrapedData.title || "No title"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {requestLog.url}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <StatusBadge code={requestLog.statusCode} />
            <ResponseTimeBadge ms={requestLog.responseTime} />
          </div>
        </div>

        {/* Headings */}
        {headings.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              H2 Headings ({headings.length})
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {headings.map((heading, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-medium">
                    {i + 1}
                  </span>
                  <span className="truncate">{heading}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {headings.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic">
            No H2 headings found on this page.
          </p>
        )}
      </div>
    </div>
  );
}
