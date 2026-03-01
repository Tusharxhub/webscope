"use client";

import { SiteMetrics } from "@/types";

interface ComparisonTableProps {
  siteA: SiteMetrics;
  siteB: SiteMetrics;
}

interface MetricRow {
  label: string;
  keyA: number;
  keyB: number;
  format?: (v: number) => string;
  higherIsBetter: boolean;
}

function formatMs(ms: number) {
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatKb(bytes: number) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export default function ComparisonTable({ siteA, siteB }: ComparisonTableProps) {
  const rows: MetricRow[] = [
    { label: "SEO Score", keyA: siteA.seoScore, keyB: siteB.seoScore, higherIsBetter: true },
    { label: "Total Time", keyA: siteA.totalTime, keyB: siteB.totalTime, format: formatMs, higherIsBetter: false },
    { label: "Server Time", keyA: siteA.serverTime, keyB: siteB.serverTime, format: formatMs, higherIsBetter: false },
    { label: "Word Count", keyA: siteA.wordCount, keyB: siteB.wordCount, higherIsBetter: true },
    { label: "H1 Count", keyA: siteA.h1Count, keyB: siteB.h1Count, higherIsBetter: true },
    { label: "H2 Count", keyA: siteA.h2Count, keyB: siteB.h2Count, higherIsBetter: true },
    { label: "Script Count", keyA: siteA.scriptCount, keyB: siteB.scriptCount, higherIsBetter: false },
    { label: "Image Count", keyA: siteA.imageCount, keyB: siteB.imageCount, higherIsBetter: true },
    { label: "Content Size", keyA: siteA.contentSize, keyB: siteB.contentSize, format: formatKb, higherIsBetter: true },
  ];

  function getWinner(a: number, b: number, higherIsBetter: boolean): "A" | "B" | "tie" {
    if (a === b) return "tie";
    if (higherIsBetter) return a > b ? "A" : "B";
    return a < b ? "A" : "B";
  }

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-4 gap-0 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-4 py-2.5 text-[10px] uppercase tracking-widest font-mono font-medium text-zinc-400 dark:text-zinc-600">
          Metric
        </div>
        <div className="px-4 py-2.5 text-[10px] uppercase tracking-widest font-mono font-medium text-zinc-400 dark:text-zinc-600 text-center">
          Site A
        </div>
        <div className="px-4 py-2.5 text-[10px] uppercase tracking-widest font-mono font-medium text-zinc-400 dark:text-zinc-600 text-center">
          Site B
        </div>
        <div className="px-4 py-2.5 text-[10px] uppercase tracking-widest font-mono font-medium text-zinc-400 dark:text-zinc-600 text-center">
          Winner
        </div>
      </div>

      {/* Rows */}
      {rows.map((row, i) => {
        const winner = getWinner(row.keyA, row.keyB, row.higherIsBetter);
        const formattedA = row.format ? row.format(row.keyA) : String(row.keyA);
        const formattedB = row.format ? row.format(row.keyB) : String(row.keyB);

        return (
          <div
            key={row.label}
            className={`grid grid-cols-4 gap-0 items-center transition-colors duration-150 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 ${
              i < rows.length - 1 ? "border-b border-zinc-100 dark:border-zinc-800/60" : ""
            }`}
          >
            <div className="px-4 py-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {row.label}
            </div>
            <div
              className={`px-4 py-3 text-sm font-mono text-center font-medium ${
                winner === "A"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {formattedA}
              {winner === "A" && (
                <span className="ml-1.5 text-[10px] text-emerald-500">▲</span>
              )}
            </div>
            <div
              className={`px-4 py-3 text-sm font-mono text-center font-medium ${
                winner === "B"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {formattedB}
              {winner === "B" && (
                <span className="ml-1.5 text-[10px] text-emerald-500">▲</span>
              )}
            </div>
            <div className="px-4 py-3 text-center">
              {winner === "tie" ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-[10px] font-mono font-medium text-zinc-400 dark:text-zinc-500">
                  Tie
                </span>
              ) : (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                    winner === "A"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                  }`}
                >
                  Site {winner}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
