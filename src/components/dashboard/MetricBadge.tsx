interface MetricBadgeProps {
  text: string;
  colorClass?: string;
}

export default function MetricBadge({ text, colorClass = "text-zinc-500 dark:text-zinc-500" }: MetricBadgeProps) {
  return <span className={`text-xs font-mono ${colorClass}`}>{text}</span>;
}
