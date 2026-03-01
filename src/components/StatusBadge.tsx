interface StatusBadgeProps {
  code: number;
}

export default function StatusBadge({ code }: StatusBadgeProps) {
  let color = "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300";

  if (code >= 200 && code < 300) {
    color = "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400";
  } else if (code >= 300 && code < 400) {
    color = "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400";
  } else if (code >= 400 && code < 500) {
    color = "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
  } else if (code >= 500) {
    color = "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {code || "N/A"}
    </span>
  );
}
