import StatusChip from "@/components/dashboard/StatusChip";

interface StatusBadgeProps {
  code: number;
}

export default function StatusBadge({ code }: StatusBadgeProps) {
  let color = "text-zinc-400 border-zinc-300 dark:border-zinc-700";

  if (code >= 200 && code < 300) {
    color = "text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40";
  } else if (code >= 300 && code < 400) {
    color = "text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40";
  } else if (code >= 400 && code < 500) {
    color = "text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40";
  } else if (code >= 500) {
    color = "text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40";
  }

  return <StatusChip value={`[ ${code || "N/A"} ]`} className={color} />;
}
