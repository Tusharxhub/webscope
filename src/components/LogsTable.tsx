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

export default function LogsTable({ logs, onRowClick, onDelete }: LogsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-white/10">
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              URL
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Method
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Time
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Date
            </th>
            <th className="py-3 px-4" />
          </tr>
        </thead>
        <tbody>
          {logs.map((log, idx) => (
            <tr
              key={log.id}
              onClick={() => onRowClick(log)}
              className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/5 cursor-pointer transition-colors duration-200 animate-fadeIn"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <td className="py-3 px-4">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[250px]">
                    {getDomain(log.url)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[250px]">
                    {log.url}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4">
                <StatusBadge code={log.statusCode} />
              </td>
              <td className="py-3 px-4">
                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
                  {log.method}
                </span>
              </td>
              <td className="py-3 px-4">
                <ResponseTimeBadge ms={log.responseTime} />
              </td>
              <td className="py-3 px-4 text-xs text-gray-400 dark:text-gray-500">
                {formatDate(log.createdAt)}
              </td>
              <td className="py-3 px-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(log.id);
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors duration-200"
                  title="Delete log"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
