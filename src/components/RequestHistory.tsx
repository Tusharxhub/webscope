import { RequestLogEntry } from "@/types";
import StatusBadge from "./StatusBadge";
import ResponseTimeBadge from "./ResponseTimeBadge";

interface RequestHistoryProps {
  logs: RequestLogEntry[];
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export default function RequestHistory({ logs }: RequestHistoryProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="text-4xl mb-3">📡</div>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          No requests yet. Start scraping to see history here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
      {logs.map((log, index) => (
        <div
          key={log.id}
          className="relative pl-6 animate-fadeIn"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Timeline line */}
          {index < logs.length - 1 && (
            <div className="absolute left-[9px] top-8 bottom-0 w-px bg-gray-200 dark:bg-white/10" />
          )}

          {/* Timeline dot */}
          <div
            className={`absolute left-0 top-2.5 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
              log.statusCode >= 200 && log.statusCode < 300
                ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/20"
                : log.statusCode >= 400
                ? "border-rose-400 bg-rose-50 dark:bg-rose-500/20"
                : "border-gray-300 bg-gray-50 dark:border-white/20 dark:bg-white/5"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                log.statusCode >= 200 && log.statusCode < 300
                  ? "bg-emerald-500"
                  : log.statusCode >= 400
                  ? "bg-rose-500"
                  : "bg-gray-400"
              }`}
            />
          </div>

          {/* Content */}
          <div className="rounded-xl bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-3 hover:bg-white/80 dark:hover:bg-white/10 transition-colors duration-200">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                {getDomain(log.url)}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                {timeAgo(log.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge code={log.statusCode} />
              <ResponseTimeBadge ms={log.responseTime} />
              <span className="text-xs text-gray-400 dark:text-gray-500 uppercase">
                {log.method}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
