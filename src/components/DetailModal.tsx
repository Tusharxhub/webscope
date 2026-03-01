"use client";

import { RequestLogEntry } from "@/types";
import StatusBadge from "./StatusBadge";
import ResponseTimeBadge from "./ResponseTimeBadge";

interface DetailModalProps {
  log: RequestLogEntry | null;
  onClose: () => void;
}

export default function DetailModal({ log, onClose }: DetailModalProps) {
  if (!log) return null;

  const scraped = log.scrapedData?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 animate-fadeIn max-h-[85vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Request Details
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 truncate">{log.url}</p>

        {/* Badges */}
        <div className="flex gap-2 mb-6">
          <StatusBadge code={log.statusCode} />
          <ResponseTimeBadge ms={log.responseTime} />
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 uppercase">
            {log.method}
          </span>
        </div>

        {/* Scraped data */}
        {scraped && (
          <div className="space-y-4">
            {/* Page title */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Page Title
              </label>
              <p className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/5">
                {scraped.title || "—"}
              </p>
            </div>

            {/* Meta description */}
            {scraped.meta && (
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Meta Description
                </label>
                <p className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/5">
                  {scraped.meta}
                </p>
              </div>
            )}

            {/* Headings */}
            {scraped.headings && scraped.headings.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  H2 Headings ({scraped.headings.length})
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {scraped.headings.map((h: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-medium">
                        {i + 1}
                      </span>
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!scraped && (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic">
            No scraped content available for this request.
          </p>
        )}

        {/* Timestamp */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Scraped at {new Date(log.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
