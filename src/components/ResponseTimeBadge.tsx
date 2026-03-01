interface ResponseTimeBadgeProps {
  ms: number;
}

export default function ResponseTimeBadge({ ms }: ResponseTimeBadgeProps) {
  let color = "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400";

  if (ms > 3000) {
    color = "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400";
  } else if (ms > 1500) {
    color = "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {ms}ms
    </span>
  );
}
