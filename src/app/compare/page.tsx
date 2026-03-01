"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import Button from "@/components/Button";
import ComparisonOverview from "@/components/ComparisonOverview";
import ComparisonTable from "@/components/ComparisonTable";
import ComparisonCharts from "@/components/ComparisonCharts";
import VerdictBanner from "@/components/VerdictBanner";
import { CompareResponse } from "@/types";

export default function ComparePage() {
  const [urlA, setUrlA] = useState("");
  const [urlB, setUrlB] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CompareResponse | null>(null);

  const handleCompare = async () => {
    setError("");
    setResult(null);

    if (!urlA.trim() || !urlB.trim()) {
      setError("Please enter both URLs");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urlA: urlA.trim(), urlB: urlB.trim() }),
      });

      const data: CompareResponse = await res.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Comparison failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) handleCompare();
  };

  return (
    <div className="min-h-screen bg-grid relative">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Website Comparison
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1 font-mono">
            Compare two websites side-by-side — SEO, performance, and structure.
          </p>
        </div>

        {/* URL Inputs */}
        <Card className="p-4 sm:p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-mono font-medium text-zinc-400 dark:text-zinc-600 mb-1.5">
                Site A
              </label>
              <input
                type="url"
                value={urlA}
                onChange={(e) => setUrlA(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://example.com"
                disabled={loading}
                className="w-full px-3 py-2.5 sm:py-2 rounded-md bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors duration-150 disabled:opacity-40"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-mono font-medium text-zinc-400 dark:text-zinc-600 mb-1.5">
                Site B
              </label>
              <input
                type="url"
                value={urlB}
                onChange={(e) => setUrlB(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://competitor.com"
                disabled={loading}
                className="w-full px-3 py-2.5 sm:py-2 rounded-md bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors duration-150 disabled:opacity-40"
              />
            </div>
          </div>

          <Button onClick={handleCompare} loading={loading} size="md" className="w-full sm:w-auto">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            {loading ? "Comparing…" : "Compare"}
          </Button>

          {error && (
            <div className="mt-3 p-2.5 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-mono animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="text-rose-500">✕</span>
                {error}
              </div>
            </div>
          )}
        </Card>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800" />
              ))}
            </div>
            <div className="h-64 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="h-72 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800" />
              <div className="h-72 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800" />
            </div>
          </div>
        )}

        {/* Results */}
        {result?.data && !loading && (
          <div className="space-y-6 animate-fade-in">
            {/* URL labels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 truncate">
                  <span className="font-medium">A:</span> {result.data.siteA.url}
                </span>
                <span className="ml-auto inline-flex items-center px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                  {result.data.siteA.seoScore}/100
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60">
                <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                <span className="text-xs font-mono text-indigo-700 dark:text-indigo-400 truncate">
                  <span className="font-medium">B:</span> {result.data.siteB.url}
                </span>
                <span className="ml-auto inline-flex items-center px-1.5 py-0.5 rounded border border-indigo-300 dark:border-indigo-700 text-[10px] font-mono font-medium text-indigo-600 dark:text-indigo-400">
                  {result.data.siteB.seoScore}/100
                </span>
              </div>
            </div>

            {/* Verdict Banner */}
            <VerdictBanner
              comparison={result.data.comparison}
              urlA={result.data.siteA.url}
              urlB={result.data.siteB.url}
            />

            {/* Overview Cards */}
            <ComparisonOverview
              siteA={result.data.siteA}
              siteB={result.data.siteB}
              comparison={result.data.comparison}
            />

            {/* Detailed Table */}
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Detailed Comparison
              </h2>
              <ComparisonTable siteA={result.data.siteA} siteB={result.data.siteB} />
            </div>

            {/* Charts */}
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Visual Comparison
              </h2>
              <ComparisonCharts siteA={result.data.siteA} siteB={result.data.siteB} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
