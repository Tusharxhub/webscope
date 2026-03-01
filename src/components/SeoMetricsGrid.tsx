import { SeoMetrics } from "@/types";

interface SeoMetricsGridProps {
  metrics: SeoMetrics;
}

const METRIC_CONFIG: {
  key: keyof SeoMetrics;
  label: string;
  format?: (v: number) => string;
  icon: JSX.Element;
}[] = [
  {
    key: "wordCount",
    label: "Word Count",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    key: "h1Count",
    label: "H1 Tags",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
  },
  {
    key: "h2Count",
    label: "H2 Tags",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
  },
  {
    key: "titleLength",
    label: "Title Length",
    format: (v) => `${v} chars`,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    key: "metaLength",
    label: "Meta Length",
    format: (v) => `${v} chars`,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "missingAltCount",
    label: "Missing Alt",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function SeoMetricsGrid({ metrics }: SeoMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {METRIC_CONFIG.map(({ key, label, format, icon }) => {
        const value = metrics[key];
        const isWarning = key === "missingAltCount" && value > 0;

        return (
          <div
            key={key}
            className={`flex flex-col gap-1.5 p-3 rounded-lg border transition-colors duration-200 ${
              isWarning
                ? "border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30"
                : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className={isWarning ? "text-amber-500" : "text-gray-400 dark:text-gray-500"}>
                {icon}
              </span>
              <span className="text-[11px] uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400">
                {label}
              </span>
            </div>
            <span className={`font-mono text-xl font-semibold ${
              isWarning
                ? "text-amber-600 dark:text-amber-400"
                : "text-gray-900 dark:text-gray-100"
            }`}>
              {format ? format(value) : value.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
