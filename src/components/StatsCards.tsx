import { StatsData } from "@/types";

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

export default function StatsCards({ stats, loading }: StatsCardsProps) {
  const cards = [
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
      accent: stats.successRate >= 80
        ? "border-l-emerald-500"
        : stats.successRate >= 50
        ? "border-l-amber-500"
        : "border-l-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 border-l-2 ${card.accent} p-4 transition-colors duration-200`}
        >
          {loading ? (
            <div className="space-y-3">
              <div className="h-3 skeleton-shimmer rounded w-24" />
              <div className="h-7 skeleton-shimmer rounded w-16" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wider font-medium">{card.label}</span>
                <span className={`text-xs font-mono ${card.trend.color}`}>
                  {card.trend.arrow} {card.trend.label}
                </span>
              </div>
              <p className={`text-xl font-semibold font-mono text-zinc-900 dark:text-zinc-100 ${
                card.label === "Avg Response Time" && card.value > 2500 ? "amber-glow rounded px-1 -mx-1" : ""
              }`}>
                {card.display}
              </p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
