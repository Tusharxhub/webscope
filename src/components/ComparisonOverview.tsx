"use client";

import { SiteMetrics, ComparisonVerdict } from "@/types";

interface ComparisonOverviewProps {
  siteA: SiteMetrics;
  siteB: SiteMetrics;
  comparison: ComparisonVerdict;
}

interface OverviewCard {
  label: string;
  valueA: string;
  valueB: string;
  winner: "A" | "B";
  unit?: string;
}

export default function ComparisonOverview({ siteA, siteB, comparison }: ComparisonOverviewProps) {
  const cards: OverviewCard[] = [
    {
      label: "SEO Score",
      valueA: String(siteA.seoScore),
      valueB: String(siteB.seoScore),
      winner: comparison.betterSEO,
      unit: "/100",
    },
    {
      label: "Total Time",
      valueA: `${(siteA.totalTime / 1000).toFixed(2)}`,
      valueB: `${(siteB.totalTime / 1000).toFixed(2)}`,
      winner: comparison.faster,
      unit: "s",
    },
    {
      label: "Content Size",
      valueA: `${(siteA.contentSize / 1024).toFixed(0)}`,
      valueB: `${(siteB.contentSize / 1024).toFixed(0)}`,
      winner: comparison.largerContent,
      unit: "KB",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-colors duration-200"
        >
          <p className="text-[10px] uppercase tracking-widest font-mono font-medium text-zinc-400 dark:text-zinc-600 mb-3">
            {card.label}
          </p>
          <div className="flex items-end justify-between gap-3">
            {/* Site A */}
            <div className="flex-1">
              <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 mb-1">Site A</p>
              <p
                className={`text-xl font-bold font-mono ${
                  card.winner === "A"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {card.valueA}
                <span className="text-xs font-normal text-zinc-400 dark:text-zinc-600 ml-0.5">
                  {card.unit}
                </span>
              </p>
            </div>
            {/* VS */}
            <div className="flex-shrink-0 pb-1">
              <span className="text-[10px] font-mono text-zinc-300 dark:text-zinc-700">vs</span>
            </div>
            {/* Site B */}
            <div className="flex-1 text-right">
              <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 mb-1">Site B</p>
              <p
                className={`text-xl font-bold font-mono ${
                  card.winner === "B"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {card.valueB}
                <span className="text-xs font-normal text-zinc-400 dark:text-zinc-600 ml-0.5">
                  {card.unit}
                </span>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
