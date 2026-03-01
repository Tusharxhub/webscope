interface AlertItemProps {
  title: string;
  description: string;
  severity?: "info" | "warning" | "critical";
}

const severityClass: Record<NonNullable<AlertItemProps["severity"]>, string> = {
  info: "border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/30",
  warning: "border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30",
  critical: "border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/30",
};

export default function AlertItem({ title, description, severity = "info" }: AlertItemProps) {
  return (
    <div className={`rounded-md border p-3 ${severityClass[severity]}`}>
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</p>
      <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400 mt-1">{description}</p>
    </div>
  );
}
