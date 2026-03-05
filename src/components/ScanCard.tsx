"use client";

import { useState } from "react";
import type { ScanWithPages } from "@/types";
import Card from "./Card";
import Button from "./Button";

function getAnimalEmoji(animal?: string | null): string {
  if (!animal) return "🧠";

  const normalized = animal.toLowerCase();
  if (normalized.includes("hawk") || normalized.includes("eagle") || normalized.includes("falcon")) return "🦅";
  if (normalized.includes("wolf")) return "🐺";
  if (normalized.includes("otter")) return "🦦";
  if (normalized.includes("tortoise") || normalized.includes("turtle")) return "🐢";
  if (normalized.includes("lion")) return "🦁";
  if (normalized.includes("owl")) return "🦉";
  if (normalized.includes("fox")) return "🦊";
  if (normalized.includes("cheetah") || normalized.includes("leopard")) return "🐆";

  return "🧠";
}

interface ScanCardProps {
  scan: ScanWithPages;
}

export default function ScanCard({ scan }: ScanCardProps) {
  const [expanded, setExpanded] = useState(false);

  const scanDate = new Date(scan.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="p-4 mb-4 hover:shadow-md transition-shadow duration-150">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg leading-none">{getAnimalEmoji(scan.animalSpirit)}</span>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {scan.url}
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 font-mono">
            {scanDate} • {scan.pageCount} page{scan.pageCount !== 1 ? "s" : ""} analyzed
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-md p-2.5 border border-zinc-200 dark:border-zinc-700">
          <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono uppercase tracking-widest mb-1">
            SEO Score
          </p>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {scan.seoScore}
          </p>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-md p-2.5 border border-zinc-200 dark:border-zinc-700">
          <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono uppercase tracking-widest mb-1">
            Response Time
          </p>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {scan.responseTime}ms
          </p>
        </div>

        {scan.animalSpirit && (
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-md p-2.5 border border-zinc-200 dark:border-zinc-700 col-span-2 sm:col-span-1">
            <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono uppercase tracking-widest mb-1">
              Spirit
            </p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 capitalize">
              {scan.animalSpirit}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setExpanded(!expanded)}
          className="text-xs"
        >
          {expanded ? "Hide Pages" : "View Pages"}
          <svg
            className={`w-3 h-3 ml-1 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => window.open(`/api/export/scan/${scan.id}/csv`, "_blank")}
          className="text-xs"
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          CSV
        </Button>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => window.open(`/api/export/scan/${scan.id}/pdf`, "_blank")}
          className="text-xs"
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          PDF
        </Button>
      </div>

      {/* Expandable page list */}
      {expanded && scan.pages.length > 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 animate-fade-in">
          <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-3 uppercase tracking-widest">
            Pages Analyzed
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="text-left py-2 px-2 text-zinc-500 dark:text-zinc-500 font-mono font-medium">
                    Page URL
                  </th>
                  <th className="text-left py-2 px-2 text-zinc-500 dark:text-zinc-500 font-mono font-medium">
                    Title
                  </th>
                  <th className="text-center py-2 px-2 text-zinc-500 dark:text-zinc-500 font-mono font-medium">
                    H1
                  </th>
                  <th className="text-center py-2 px-2 text-zinc-500 dark:text-zinc-500 font-mono font-medium">
                    H2
                  </th>
                  <th className="text-right py-2 px-2 text-zinc-500 dark:text-zinc-500 font-mono font-medium">
                    Words
                  </th>
                  <th className="text-right py-2 px-2 text-zinc-500 dark:text-zinc-500 font-mono font-medium">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {scan.pages.map((page) => (
                  <tr
                    key={page.id}
                    className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="py-2 px-2 text-zinc-700 dark:text-zinc-300 font-mono truncate max-w-xs">
                      <a
                        href={page.pageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        {page.pageUrl}
                      </a>
                    </td>
                    <td className="py-2 px-2 text-zinc-600 dark:text-zinc-400 truncate max-w-xs">
                      {page.title || "No title"}
                    </td>
                    <td className="py-2 px-2 text-zinc-600 dark:text-zinc-400 text-center">
                      {page.h1Count}
                    </td>
                    <td className="py-2 px-2 text-zinc-600 dark:text-zinc-400 text-center">
                      {page.h2Count}
                    </td>
                    <td className="py-2 px-2 text-zinc-600 dark:text-zinc-400 text-right">
                      {page.wordCount.toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-zinc-600 dark:text-zinc-400 text-right">
                      {page.responseTime}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Additional metrics */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {scan.pages.length > 0 && (
              <>
                <div className="text-center">
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono uppercase tracking-widest">
                    Avg. Images
                  </p>
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
                    {Math.round(scan.pages.reduce((sum, p) => sum + p.imageCount, 0) / scan.pages.length)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono uppercase tracking-widest">
                    Avg. Scripts
                  </p>
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
                    {Math.round(scan.pages.reduce((sum, p) => sum + p.scriptCount, 0) / scan.pages.length)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono uppercase tracking-widest">
                    Int. Links
                  </p>
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
                    {scan.pages.reduce((sum, p) => sum + p.internalLinks, 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono uppercase tracking-widest">
                    Ext. Links
                  </p>
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
                    {scan.pages.reduce((sum, p) => sum + p.externalLinks, 0)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
