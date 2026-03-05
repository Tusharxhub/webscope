"use client";

import { useState } from "react";
import type { ScanWithPages } from "@/types";
import Card from "./Card";
import Button from "./Button";
import PageUIDetails from "./PageUIDetails";

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
          onClick={() => window.open(`/api/export/scan/${scan.id}/json`, "_blank")}
          className="text-xs"
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          JSON
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
          <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-3 uppercase tracking-widest flex items-center justify-between">
            <span>Page UI Structure Analysis</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-mono border border-zinc-200 dark:border-zinc-700">
              {scan.pages.length} page{scan.pages.length !== 1 ? "s" : ""}
            </span>
          </h4>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 py-2 px-2 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 rounded-t-md">
            <div className="col-span-4 text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
              Page URL
            </div>
            <div className="col-span-3 text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
              Title
            </div>
            <div className="col-span-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest text-center">
              H1
            </div>
            <div className="col-span-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest text-center">
              Images
            </div>
            <div className="col-span-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest text-center">
              Buttons
            </div>
            <div className="col-span-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest text-center">
              Scripts
            </div>
            <div className="col-span-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest text-right">
              Time
            </div>
          </div>

          {/* Page Rows with Expandable Details */}
          <div className="border border-t-0 border-zinc-200 dark:border-zinc-700 rounded-b-md overflow-hidden">
            {scan.pages.map((page) => (
              <PageUIDetails key={page.id} page={page} />
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-md p-2.5 border border-zinc-200 dark:border-zinc-700 text-center">
              <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono uppercase tracking-widest mb-1">
                Avg. Words
              </p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {Math.round(scan.pages.reduce((sum, p) => sum + p.wordCount, 0) / scan.pages.length).toLocaleString()}
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-md p-2.5 border border-zinc-200 dark:border-zinc-700 text-center">
              <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono uppercase tracking-widest mb-1">
                Total Forms
              </p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {scan.pages.reduce((sum, p) => sum + p.formCount, 0)}
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-md p-2.5 border border-zinc-200 dark:border-zinc-700 text-center">
              <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono uppercase tracking-widest mb-1">
                Total Scripts
              </p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {scan.pages.reduce((sum, p) => sum + p.scriptCount, 0)}
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-md p-2.5 border border-zinc-200 dark:border-zinc-700 text-center">
              <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono uppercase tracking-widest mb-1">
                Avg. Load Time
              </p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {Math.round(scan.pages.reduce((sum, p) => sum + p.responseTime, 0) / scan.pages.length)}ms
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
