"use client";

import type { GroupedScans } from "@/types";
import ScanCard from "./ScanCard";
import Card from "./Card";
import SkeletonLoader from "./SkeletonLoader";

interface ScanTimelineProps {
  groupedScans: GroupedScans[];
  loading: boolean;
}

export default function ScanTimeline({ groupedScans, loading }: ScanTimelineProps) {
  if (loading) {
    return (
      <Card className="p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Analysis History
        </h2>
        <SkeletonLoader />
      </Card>
    );
  }

  if (groupedScans.length === 0) {
    return (
      <Card className="p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Analysis History
        </h2>
        <div className="text-center py-8">
          <div className="text-zinc-300 dark:text-zinc-700 mb-3">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-500 font-mono">
            No website analyses yet
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-600 font-mono mt-1">
            Start by scraping a website above
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Analysis History
      </h2>

      <div className="space-y-6">
        {groupedScans.map((group) => (
          <div key={group.date} className="animate-fade-in">
            {/* Date header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-500" />
              <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">
                {group.date}
              </h3>
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
              <span className="text-[10px] text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-mono border border-zinc-200 dark:border-zinc-700">
                {group.scans.length} scan{group.scans.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Scans for this date */}
            <div className="ml-5 border-l-2 border-zinc-200 dark:border-zinc-700 pl-4 space-y-4">
              {group.scans.map((scan) => (
                <ScanCard key={scan.id} scan={scan} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
