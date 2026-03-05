"use client";

import { useState } from "react";
import type { ScanPage } from "@/types";

interface PageUIDetailsProps {
  page: ScanPage;
}

export default function PageUIDetails({ page }: PageUIDetailsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-zinc-100 dark:border-zinc-800">
      {/* Collapsed Row */}
      <div
        className="grid grid-cols-12 gap-2 py-2 px-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="col-span-4 text-xs text-zinc-700 dark:text-zinc-300 font-mono truncate flex items-center gap-2">
          <svg
            className={`w-3 h-3 transition-transform duration-200 flex-shrink-0 ${expanded ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <a
            href={page.pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {page.pageUrl}
          </a>
        </div>
        <div className="col-span-3 text-xs text-zinc-600 dark:text-zinc-400 truncate">
          {page.title || "No title"}
        </div>
        <div className="col-span-1 text-xs text-zinc-600 dark:text-zinc-400 text-center">
          {page.h1Count}
        </div>
        <div className="col-span-1 text-xs text-zinc-600 dark:text-zinc-400 text-center">
          {page.imageCount}
        </div>
        <div className="col-span-1 text-xs text-zinc-600 dark:text-zinc-400 text-center">
          {page.buttonCount}
        </div>
        <div className="col-span-1 text-xs text-zinc-600 dark:text-zinc-400 text-center">
          {page.scriptCount}
        </div>
        <div className="col-span-1 text-xs text-zinc-600 dark:text-zinc-400 text-right">
          {page.responseTime}ms
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-2 pb-4 pt-2 bg-zinc-50 dark:bg-zinc-900/50 animate-fade-in">
          <div className="ml-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Headings */}
            <div className="bg-white dark:bg-zinc-800 rounded-md p-3 border border-zinc-200 dark:border-zinc-700">
              <h5 className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-2">
                Headings
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">H1:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.h1Count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">H2:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.h2Count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">H3:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.h3Count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">H4:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.h4Count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">H5:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.h5Count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">H6:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.h6Count}</span>
                </div>
                <div className="flex justify-between col-span-2 pt-1 border-t border-zinc-200 dark:border-zinc-700">
                  <span className="text-zinc-600 dark:text-zinc-400">Total:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.headingCount}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-zinc-800 rounded-md p-3 border border-zinc-200 dark:border-zinc-700">
              <h5 className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-2">
                Content
              </h5>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Words:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.wordCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Paragraphs:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.paragraphCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Sections:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.sectionCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Divs:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.divCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Text Length:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.textLength.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Size:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.contentSizeKb.toFixed(2)} KB</span>
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="bg-white dark:bg-zinc-800 rounded-md p-3 border border-zinc-200 dark:border-zinc-700">
              <h5 className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-2">
                Media
              </h5>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Images:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.imageCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Missing Alt:</span>
                  <span className={`font-semibold ${page.imagesWithoutAlt > 0 ? "text-amber-600 dark:text-amber-500" : "text-emerald-600 dark:text-emerald-500"}`}>
                    {page.imagesWithoutAlt}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Videos:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.videoCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Iframes:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.iframeCount}</span>
                </div>
              </div>
            </div>

            {/* Interactive Elements */}
            <div className="bg-white dark:bg-zinc-800 rounded-md p-3 border border-zinc-200 dark:border-zinc-700">
              <h5 className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-2">
                Interactive
              </h5>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Buttons:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.buttonCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Forms:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.formCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Inputs:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.inputCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Nav Elements:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.navElements}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Tables:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.tableCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Lists:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.listCount}</span>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="bg-white dark:bg-zinc-800 rounded-md p-3 border border-zinc-200 dark:border-zinc-700">
              <h5 className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-2">
                Links
              </h5>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Internal:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.internalLinks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">External:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.externalLinks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Broken:</span>
                  <span className={`font-semibold ${page.brokenLinks > 0 ? "text-rose-600 dark:text-rose-500" : "text-emerald-600 dark:text-emerald-500"}`}>
                    {page.brokenLinks}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-zinc-200 dark:border-zinc-700">
                  <span className="text-zinc-600 dark:text-zinc-400">Total:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {page.internalLinks + page.externalLinks}
                  </span>
                </div>
              </div>
            </div>

            {/* Scripts & Performance */}
            <div className="bg-white dark:bg-zinc-800 rounded-md p-3 border border-zinc-200 dark:border-zinc-700">
              <h5 className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-2">
                Scripts & Performance
              </h5>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Scripts:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.scriptCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Inline:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.inlineScripts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">External:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.externalScripts}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-zinc-200 dark:border-zinc-700">
                  <span className="text-zinc-600 dark:text-zinc-400">Response:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.responseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">HTML Size:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {(page.htmlSize / 1024).toFixed(2)} KB
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Meta Tags */}
          {(page.metaDesc || page.canonicalTag || page.metaKeywords) && (
            <div className="ml-5 mt-4 bg-white dark:bg-zinc-800 rounded-md p-3 border border-zinc-200 dark:border-zinc-700">
              <h5 className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-2">
                Meta Tags
              </h5>
              <div className="space-y-2 text-xs">
                {page.metaDesc && (
                  <div>
                    <span className="text-zinc-600 dark:text-zinc-400 font-medium">Description:</span>
                    <p className="text-zinc-700 dark:text-zinc-300 mt-0.5 font-mono text-[11px]">
                      {page.metaDesc}
                    </p>
                  </div>
                )}
                {page.canonicalTag && (
                  <div>
                    <span className="text-zinc-600 dark:text-zinc-400 font-medium">Canonical:</span>
                    <p className="text-zinc-700 dark:text-zinc-300 mt-0.5 font-mono text-[11px] truncate">
                      {page.canonicalTag}
                    </p>
                  </div>
                )}
                {page.metaKeywords && (
                  <div>
                    <span className="text-zinc-600 dark:text-zinc-400 font-medium">Keywords:</span>
                    <p className="text-zinc-700 dark:text-zinc-300 mt-0.5 font-mono text-[11px]">
                      {page.metaKeywords}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
