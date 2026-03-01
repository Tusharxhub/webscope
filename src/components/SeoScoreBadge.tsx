"use client";

interface SeoScoreBadgeProps {
  score: number;
  size?: number;
}

function getScoreColor(score: number) {
  if (score >= 80) return { ring: "ring-emerald-500/30", text: "text-emerald-500", bg: "bg-emerald-500", label: "Excellent" };
  if (score >= 50) return { ring: "ring-amber-500/30", text: "text-amber-500", bg: "bg-amber-500", label: "Needs Work" };
  return { ring: "ring-rose-500/30", text: "text-rose-500", bg: "bg-rose-500", label: "Poor" };
}

export default function SeoScoreBadge({ score, size }: SeoScoreBadgeProps) {
  const { ring, text, bg, label } = getScoreColor(score);
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Circular progress */}
      <div
        className={`relative rounded-full ring-4 ${ring} flex items-center justify-center ${
          size ? "" : "w-28 h-28 sm:w-32 sm:h-32"
        }`}
        style={size ? { width: size, height: size } : undefined}
      >
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48" cy="48" r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            className="text-zinc-200 dark:text-zinc-800"
          />
          <circle
            cx="48" cy="48" r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            className={text}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
              transition: "stroke-dashoffset 0.8s ease-out",
            }}
          />
        </svg>
        <div className="text-center z-10">
          <span className={`${size ? "text-lg" : "text-2xl sm:text-3xl"} font-bold font-mono ${text}`}>
            {score}
          </span>
          <span className={`${size ? "text-[8px]" : "text-xs"} text-zinc-400 dark:text-zinc-600 font-mono`}>/100</span>
        </div>
      </div>

      {/* Label */}
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${bg}`} />
        <span className={`text-xs font-medium font-mono ${text}`}>{label}</span>
      </div>
    </div>
  );
}
