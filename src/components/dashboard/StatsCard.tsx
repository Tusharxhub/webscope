import MetricBadge from "@/components/dashboard/MetricBadge";

interface StatsCardProps {
  label: string;
  display: string;
  accentClass: string;
  trendText: string;
  trendColorClass: string;
  loading?: boolean;
  highlight?: boolean;
}

export default function StatsCard({
  label,
  display,
  accentClass,
  trendText,
  trendColorClass,
  loading,
  highlight = false,
}: StatsCardProps) {
  return (
    <div
      className={`rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 border-l-2 ${accentClass} p-4 transition-colors duration-200`}
    >
      {loading ? (
        <div className="space-y-3">
          <div className="h-3 skeleton-shimmer rounded w-24" />
          <div className="h-7 skeleton-shimmer rounded w-16" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wider font-medium">{label}</span>
            <MetricBadge text={trendText} colorClass={trendColorClass} />
          </div>
          <p
            className={`text-xl font-semibold font-mono text-zinc-900 dark:text-zinc-100 ${
              highlight ? "amber-glow rounded px-1 -mx-1" : ""
            }`}
          >
            {display}
          </p>
        </>
      )}
    </div>
  );
}
