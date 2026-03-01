"use client";

import { RequestLogEntry } from "@/types";
import StatusBadge from "./StatusBadge";
import ResponseTimeBadge from "./ResponseTimeBadge";
import SeoScoreBadge from "./SeoScoreBadge";

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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-4 sm:p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            Request Details
          </h3>
          <p className="text-xs font-mono text-zinc-400 dark:text-zinc-600 truncate">{log.url}</p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-5 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <StatusBadge code={log.statusCode} />
          <ResponseTimeBadge ms={log.responseTime} />
          <span className="inline-flex items-center px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-[10px] font-mono font-medium text-zinc-500 dark:text-zinc-500 uppercase">
            {log.method}
          </span>
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 sm:ml-auto">
            #{log.id.substring(0, 7)}
          </span>
        </div>

        {/* Scraped data */}
        {scraped && (
          <div className="space-y-4">
            {/* Page title */}
            <div>
              <label className="block text-[10px] font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-mono mb-1">
                Page Title
              </label>
              <p className="text-sm text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 rounded-md p-2.5 border border-zinc-200 dark:border-zinc-700/60">
                {scraped.title || "—"}
              </p>
            </div>

            {/* Meta description */}
            {scraped.meta && (
              <div>
                <label className="block text-[10px] font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-mono mb-1">
                  Meta Description
                </label>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 rounded-md p-2.5 border border-zinc-200 dark:border-zinc-700/60">
                  {scraped.meta}
                </p>
              </div>
            )}

            {/* Headings */}
            {scraped.headings && scraped.headings.length > 0 && (
              <div>
                <label className="block text-[10px] font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-mono mb-2">
                  Headings ({scraped.headings.length})
                </label>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {scraped.headings.map((h: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 flex items-center justify-center text-[10px] font-mono">
                        {i + 1}
                      </span>
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Body Text Preview */}
            {scraped.bodyText && (
              <div>
                <label className="block text-[10px] font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-mono mb-1">
                  Body Text Preview
                </label>
                <div className="text-xs font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 rounded-md p-2.5 border border-zinc-200 dark:border-zinc-700/60 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {scraped.bodyText.length > 2000
                    ? scraped.bodyText.substring(0, 2000) + "…"
                    : scraped.bodyText}
                </div>
              </div>
            )}

            {/* SEO Score */}
            {scraped.seoScore != null && (
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <label className="block text-[10px] font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-mono mb-3">
                  SEO Score
                </label>
                <div className="flex items-center gap-4">
                  <SeoScoreBadge score={scraped.seoScore} size={72} />
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs font-mono">
                    {scraped.wordCount != null && (
                      <div className="text-zinc-500 dark:text-zinc-400">
                        Words: <span className="text-zinc-800 dark:text-zinc-200 font-medium">{scraped.wordCount.toLocaleString()}</span>
                      </div>
                    )}
                    {scraped.h1Count != null && (
                      <div className="text-zinc-500 dark:text-zinc-400">
                        H1: <span className="text-zinc-800 dark:text-zinc-200 font-medium">{scraped.h1Count}</span>
                      </div>
                    )}
                    {scraped.h2Count != null && (
                      <div className="text-zinc-500 dark:text-zinc-400">
                        H2: <span className="text-zinc-800 dark:text-zinc-200 font-medium">{scraped.h2Count}</span>
                      </div>
                    )}
                    {scraped.titleLength != null && (
                      <div className="text-zinc-500 dark:text-zinc-400">
                        Title: <span className="text-zinc-800 dark:text-zinc-200 font-medium">{scraped.titleLength} chars</span>
                      </div>
                    )}
                    {scraped.metaLength != null && (
                      <div className="text-zinc-500 dark:text-zinc-400">
                        Meta: <span className="text-zinc-800 dark:text-zinc-200 font-medium">{scraped.metaLength} chars</span>
                      </div>
                    )}
                    {scraped.missingAltCount != null && (
                      <div className={scraped.missingAltCount > 0 ? "text-amber-500" : "text-zinc-500 dark:text-zinc-400"}>
                        No Alt: <span className={`font-medium ${scraped.missingAltCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-zinc-800 dark:text-zinc-200"}`}>{scraped.missingAltCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!scraped && (
          <p className="text-xs text-zinc-400 dark:text-zinc-600 font-mono">
            No scraped content available for this request.
          </p>
        )}

        {/* Timestamp */}
        <div className="mt-5 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-mono">
            Scraped at {new Date(log.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
