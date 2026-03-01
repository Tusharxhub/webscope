import { SeoChecks } from "@/types";

interface SeoChecklistProps {
  checks: SeoChecks;
}

const CHECK_LABELS: Record<keyof SeoChecks, { label: string; points: number }> = {
  titleExists:         { label: "Title tag exists",                points: 15 },
  titleLengthValid:    { label: "Title length 30–60 characters",   points: 10 },
  metaExists:          { label: "Meta description exists",         points: 15 },
  metaLengthValid:     { label: "Meta length 120–160 characters",  points: 10 },
  singleH1:           { label: "Exactly one H1 tag",              points: 15 },
  hasH2:              { label: "At least one H2 tag",             points: 10 },
  sufficientWordCount: { label: "Word count > 300",                points: 15 },
  imagesHaveAlt:       { label: "All images have alt text",        points: 10 },
};

export default function SeoChecklist({ checks }: SeoChecklistProps) {
  const entries = Object.entries(CHECK_LABELS) as [keyof SeoChecks, { label: string; points: number }][];

  return (
    <div className="space-y-2">
      {entries.map(([key, { label, points }]) => {
        const passed = checks[key];
        return (
          <div
            key={key}
            className={`flex items-center justify-between gap-3 px-3 py-2 rounded-md border transition-colors duration-200 ${
              passed
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60"
                : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {passed ? (
                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className={`text-sm truncate ${
                passed
                  ? "text-emerald-800 dark:text-emerald-300"
                  : "text-rose-800 dark:text-rose-300"
              }`}>
                {label}
              </span>
            </div>
            <span className={`text-[10px] font-mono font-medium flex-shrink-0 px-1.5 py-0.5 rounded ${
              passed
                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40"
                : "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/40"
            }`}>
              {passed ? `+${points}` : "+0"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
