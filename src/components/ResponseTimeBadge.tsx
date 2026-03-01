interface ResponseTimeBadgeProps {
  ms: number;
}

export default function ResponseTimeBadge({ ms }: ResponseTimeBadgeProps) {
  let color = "text-emerald-600 dark:text-emerald-400";
  let glow = "";

  if (ms > 3000) {
    color = "text-rose-600 dark:text-rose-400";
  } else if (ms > 2500) {
    color = "text-amber-600 dark:text-amber-400";
    glow = "amber-glow rounded px-1";
  } else if (ms > 1500) {
    color = "text-amber-600 dark:text-amber-400";
  }

  return (
    <span className={`inline-flex items-center text-xs font-mono font-medium tabular-nums ${color} ${glow}`}>
      {ms.toLocaleString()}ms
    </span>
  );
}
