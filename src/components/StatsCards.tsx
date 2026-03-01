import { memo, useMemo } from "react";
import { StatsData } from "@/types";
import StatsCard from "@/components/dashboard/StatsCard";

interface StatsCardsProps {
  stats: StatsData;
  loading?: boolean;
}

function getTrend(value: number, type: "requests" | "time" | "rate"): { arrow: string; label: string; color: string } {
  // Simulated trend — replace with real historical comparison if available
  if (type === "requests") return { arrow: "↑", label: "active", color: "text-emerald-500" };
  if (type === "time") {
    if (value > 2500) return { arrow: "↑", label: "slow", color: "text-amber-500" };
    return { arrow: "↓", label: "fast", color: "text-emerald-500" };
  }
  if (value >= 80) return { arrow: "↑", label: "healthy", color: "text-emerald-500" };
  return { arrow: "↓", label: "degraded", color: "text-rose-500" };
}

function StatsCards({ stats, loading }: StatsCardsProps) {
  const cards = useMemo(
    () => [
      {
        label: "Total Requests",
        value: stats.totalRequests,
        display: stats.totalRequests.toLocaleString(),
        trend: getTrend(stats.totalRequests, "requests"),
        accent: "border-l-indigo-500",
      },
      {
        label: "Avg Response Time",
        value: stats.avgResponseTime,
        display: `${stats.avgResponseTime}ms`,
        trend: getTrend(stats.avgResponseTime, "time"),
        accent: stats.avgResponseTime > 2500 ? "border-l-amber-500" : "border-l-blue-500",
      },
      {
        label: "Success Rate",
        value: stats.successRate,
        display: `${stats.successRate}%`,
        trend: getTrend(stats.successRate, "rate"),
        accent:
          stats.successRate >= 80
            ? "border-l-emerald-500"
            : stats.successRate >= 50
            ? "border-l-amber-500"
            : "border-l-rose-500",
      },
    ],
    [stats.avgResponseTime, stats.successRate, stats.totalRequests]
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {cards.map((card) => (
        <StatsCard
          key={card.label}
          label={card.label}
          display={card.display}
          accentClass={card.accent}
          trendText={`${card.trend.arrow} ${card.trend.label}`}
          trendColorClass={card.trend.color}
          loading={loading}
          highlight={card.label === "Avg Response Time" && card.value > 2500}
        />
      ))}
    </div>
  );
}

export default memo(StatsCards);
