"use client";

import { RequestLogEntry } from "@/types";
import StatusBadge from "./StatusBadge";
import ResponseTimeBadge from "./ResponseTimeBadge";

interface LogsTableProps {
  logs: RequestLogEntry[];
  onRowClick: (log: RequestLogEntry) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function getRequestHash(id: string): string {
  return id.substring(0, 7);
}

/** Mini sparkline bar based on response time (max ~5000ms) */
function MiniSparkline({ ms }: { ms: number }) {
  const pct = Math.min((ms / 5000) * 100, 100);
  let color = "bg-emerald-500";
  if (ms > 3000) color = "bg-rose-500";
  else if (ms > 2500) color = "bg-amber-500";
  else if (ms > 1500) color = "bg-amber-400";
  return (
    <div className="w-12 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-300`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function LogsTable({ logs, onRowClick, onDelete }: LogsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="text-left py-2.5 px-3 text-[10px] font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-mono">
              Hash
            </th>
            <th className="text-left py-2.5 px-3 text-[10px] font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-mono">
              URL
            </th>
            <th className="text-left py-2.5 px-3 text-[10px] font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-mono">
              Status
            </th>
            <th className="text-left py-2.5 px-3 text-[10px] font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-mono">
              Method
            </th>
            <th className="text-left py-2.5 px-3 text-[10px] font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-mono">
              Time
            </th>
            <th className="text-left py-2.5 px-3 text-[10px] font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-mono">
              Date
            </th>
            <th className="py-2.5 px-3" />
          </tr>
        </thead>
        <tbody>
          {logs.map((log, idx) => (
            <tr
              key={log.id}
              onClick={() => onRowClick(log)}
              className="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-all duration-150 hover:-translate-y-[1px] animate-fade-in"
              style={{ animationDelay: `${idx * 25}ms` }}
            >
              <td className="py-2.5 px-3">
                <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-600">
                  #{getRequestHash(log.id)}
                </span>
              </td>
              <td className="py-2.5 px-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[220px]">
                    {getDomain(log.url)}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-600 truncate max-w-[220px]">
                    {log.url}
                  </span>
                </div>
              </td>
              <td className="py-2.5 px-3">
                <StatusBadge code={log.statusCode} />
              </td>
              <td className="py-2.5 px-3">
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-500 uppercase">
                  {log.method}
                </span>
              </td>
              <td className="py-2.5 px-3">
                <div className="flex items-center gap-2">
                  <ResponseTimeBadge ms={log.responseTime} />
                  <MiniSparkline ms={log.responseTime} />
                </div>
              </td>
              <td className="py-2.5 px-3 text-[11px] font-mono text-zinc-400 dark:text-zinc-600">
                {formatDate(log.createdAt)}
              </td>
              <td className="py-2.5 px-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(log.id);
                  }}
                  className="p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors duration-150"
                  title="Delete log"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
