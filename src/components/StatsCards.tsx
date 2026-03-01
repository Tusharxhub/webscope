import { StatsData } from "@/types";

interface StatsCardsProps {
  stats: StatsData;
  loading?: boolean;
}

export default function StatsCards({ stats, loading }: StatsCardsProps) {
  const cards = [
    {
      label: "Total Requests",
      value: stats.totalRequests,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: "text-indigo-500 bg-indigo-100 dark:bg-indigo-500/20",
    },
    {
      label: "Avg Response Time",
      value: `${stats.avgResponseTime}ms`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: stats.avgResponseTime > 2000
        ? "text-amber-500 bg-amber-100 dark:bg-amber-500/20"
        : "text-blue-500 bg-blue-100 dark:bg-blue-500/20",
    },
    {
      label: "Success Rate",
      value: `${stats.successRate}%`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: stats.successRate >= 80
        ? "text-emerald-500 bg-emerald-100 dark:bg-emerald-500/20"
        : stats.successRate >= 50
        ? "text-amber-500 bg-amber-100 dark:bg-amber-500/20"
        : "text-rose-500 bg-rose-100 dark:bg-rose-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200/60 dark:border-white/10 shadow-lg p-5 transition-all duration-300 hover:shadow-xl"
        >
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-24" />
              <div className="h-8 bg-gray-200 dark:bg-white/10 rounded w-16" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-xl ${card.color}`}>{card.icon}</div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{card.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
