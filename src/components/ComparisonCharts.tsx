"use client";

import { memo, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { SiteMetrics } from "@/types";

interface ComparisonChartsProps {
  siteA: SiteMetrics;
  siteB: SiteMetrics;
}

function ComparisonCharts({ siteA, siteB }: ComparisonChartsProps) {
  // ── Bar Chart: Response Time breakdown ──
  const barData = useMemo(
    () => [
      {
        name: "Total Time",
        "Site A": +(siteA.totalTime / 1000).toFixed(2),
        "Site B": +(siteB.totalTime / 1000).toFixed(2),
      },
      {
        name: "Server Time",
        "Site A": +(siteA.serverTime / 1000).toFixed(2),
        "Site B": +(siteB.serverTime / 1000).toFixed(2),
      },
      {
        name: "Parse Time",
        "Site A": +(siteA.parseTime / 1000).toFixed(2),
        "Site B": +(siteB.parseTime / 1000).toFixed(2),
      },
    ],
    [siteA.parseTime, siteA.serverTime, siteA.totalTime, siteB.parseTime, siteB.serverTime, siteB.totalTime]
  );

  // ── Radar Chart: SEO & structural metrics (normalised 0-100) ──
  const radarData = useMemo(() => {
    const maxWordCount = Math.max(siteA.wordCount, siteB.wordCount, 1);
    const maxImages = Math.max(siteA.imageCount, siteB.imageCount, 1);
    const maxH2 = Math.max(siteA.h2Count, siteB.h2Count, 1);
    const maxScripts = Math.max(siteA.scriptCount, siteB.scriptCount, 1);

    return [
      { metric: "SEO Score", A: siteA.seoScore, B: siteB.seoScore },
      {
        metric: "Word Count",
        A: Math.round((siteA.wordCount / maxWordCount) * 100),
        B: Math.round((siteB.wordCount / maxWordCount) * 100),
      },
      {
        metric: "H1 Valid",
        A: siteA.h1Count === 1 ? 100 : siteA.h1Count === 0 ? 0 : 40,
        B: siteB.h1Count === 1 ? 100 : siteB.h1Count === 0 ? 0 : 40,
      },
      {
        metric: "H2 Tags",
        A: Math.round((siteA.h2Count / maxH2) * 100),
        B: Math.round((siteB.h2Count / maxH2) * 100),
      },
      {
        metric: "Images",
        A: Math.round((siteA.imageCount / maxImages) * 100),
        B: Math.round((siteB.imageCount / maxImages) * 100),
      },
      {
        metric: "Script Lean",
        A: Math.round(((maxScripts - siteA.scriptCount) / maxScripts) * 100),
        B: Math.round(((maxScripts - siteB.scriptCount) / maxScripts) * 100),
      },
    ];
  }, [
    siteA.h1Count,
    siteA.h2Count,
    siteA.imageCount,
    siteA.scriptCount,
    siteA.seoScore,
    siteA.wordCount,
    siteB.h1Count,
    siteB.h2Count,
    siteB.imageCount,
    siteB.scriptCount,
    siteB.seoScore,
    siteB.wordCount,
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar chart */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <h3 className="text-[10px] uppercase tracking-widest font-mono font-medium text-zinc-400 dark:text-zinc-600 mb-4">
          Response Time Comparison
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData} barGap={4}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-zinc-200 dark:text-zinc-800"
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
              stroke="currentColor"
              className="text-zinc-400 dark:text-zinc-600"
            />
            <YAxis
              tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
              stroke="currentColor"
              className="text-zinc-400 dark:text-zinc-600"
              unit="s"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--tooltip-bg, #18181b)",
                border: "1px solid var(--tooltip-border, #27272a)",
                borderRadius: 8,
                fontSize: 12,
                fontFamily: "JetBrains Mono, monospace",
                color: "#a1a1aa",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
            />
            <Bar dataKey="Site A" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Site B" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar chart */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <h3 className="text-[10px] uppercase tracking-widest font-mono font-medium text-zinc-400 dark:text-zinc-600 mb-4">
          SEO & Structure Radar
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", fill: "#71717a" }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fontSize: 9, fill: "#71717a" }}
            />
            <Radar
              name="Site A"
              dataKey="A"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Radar
              name="Site B"
              dataKey="B"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default memo(ComparisonCharts);
