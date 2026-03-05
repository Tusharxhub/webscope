"use client";

import { useState } from "react";
import { ArrowPathIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

interface PageAnalysisFormProps {
  onComplete: () => Promise<void>;
}

export function PageAnalysisForm({ onComplete }: PageAnalysisFormProps) {
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/page-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        setErrorMessage(data?.message || "Failed to run page analysis");
        return;
      }

      setStatusMessage(`Analyzed ${data.data.pagesAnalyzed} pages for ${data.data.siteUrl}`);
      await onComplete();
    } catch {
      setErrorMessage("Network error while running page analysis");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Run Page-Wise UI Metadata Analysis</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Crawls up to 10 internal pages with a 5s timeout and extracts metadata, SEO tags, and UI structure.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative w-full md:flex-1">
          <GlobeAltIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <input
            type="url"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com"
            className="w-full rounded-md border border-zinc-300 bg-white py-2.5 pl-10 pr-3 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-indigo-800"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-w-[170px] items-center justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
              Analyzing
            </>
          ) : (
            "Analyze Website"
          )}
        </button>
      </form>

      {statusMessage ? (
        <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
          {statusMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
