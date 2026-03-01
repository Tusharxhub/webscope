"use client";

import { ComparisonVerdict } from "@/types";

interface VerdictBannerProps {
  comparison: ComparisonVerdict;
  urlA: string;
  urlB: string;
}

const VERDICT_LABELS: { key: keyof ComparisonVerdict; icon: string; label: string }[] = [
  { key: "faster", icon: "⚡", label: "Faster" },
  { key: "betterSEO", icon: "🔍", label: "Better SEO" },
  { key: "largerContent", icon: "📄", label: "More Content" },
  { key: "cleanerStructure", icon: "🏗", label: "Cleaner Structure" },
];

export default function VerdictBanner({ comparison, urlA, urlB }: VerdictBannerProps) {
  function hostname(url: string) {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {VERDICT_LABELS.map(({ key, icon, label }) => {
        const winner = comparison[key];
        const winnerUrl = winner === "A" ? urlA : urlB;

        return (
          <div
            key={key}
            className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-center transition-colors duration-200 hover:border-zinc-300 dark:hover:border-zinc-700"
          >
            <span className="text-lg">{icon}</span>
            <p className="text-[10px] uppercase tracking-widest font-mono font-medium text-zinc-400 dark:text-zinc-600 mt-1.5 mb-1">
              {label}
            </p>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                winner === "A"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                  : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
              }`}
            >
              {hostname(winnerUrl)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
