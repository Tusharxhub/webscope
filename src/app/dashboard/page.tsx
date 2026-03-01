"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import Card from "@/components/Card";
import StatsCards from "@/components/StatsCards";
import LogsTable from "@/components/LogsTable";
import DetailModal from "@/components/DetailModal";
import Pagination from "@/components/Pagination";
import EmptyState from "@/components/EmptyState";
import SkeletonLoader from "@/components/SkeletonLoader";
import { ScrapeResponse, RequestLogEntry, StatsData } from "@/types";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastResult, setLastResult] = useState<ScrapeResponse | null>(null);

  const [logs, setLogs] = useState<RequestLogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [stats, setStats] = useState<StatsData>({ totalRequests: 0, avgResponseTime: 0, successRate: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const [selectedLog, setSelectedLog] = useState<RequestLogEntry | null>(null);

  // Fetch logs
  const fetchLogs = useCallback(async (p: number) => {
    try {
      const res = await fetch(`/api/logs?page=${p}&pageSize=10`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data.logs);
        setTotalPages(data.data.totalPages);
      }
    } catch { /* silent */ } finally {
      setLogsLoading(false);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch { /* silent */ } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(page); }, [fetchLogs, page]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Poll for real-time updates (Vercel doesn't support WebSockets)
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    pollRef.current = setInterval(() => {
      fetchLogs(page);
      fetchStats();
    }, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchLogs, fetchStats, page]);

  const handleScrape = async () => {
    setError("");
    setLastResult(null);

    if (!url.trim()) { setError("Please enter a URL"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data: ScrapeResponse = await res.json();

      if (data.success) {
        setLastResult(data);
        fetchLogs(1);
        fetchStats();
        setPage(1);
      } else {
        setError(data.error || "Something went wrong");
        if (data.data) { fetchLogs(1); fetchStats(); setPage(1); }
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/logs/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchLogs(page);
        fetchStats();
      }
    } catch { /* silent */ }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) handleScrape();
  };

  return (
    <div className="min-h-screen bg-grid relative">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Greeting */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            {session?.user?.name ? `${session.user.name}'s workspace` : "Dashboard"}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1 font-mono">
            Scrape, inspect, and monitor HTTP requests.
          </p>
        </div>

        {/* Scraper input */}
        <Card className="p-4 sm:p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com"
              disabled={loading}
              className="flex-1 min-w-0 px-3 py-2.5 sm:py-2 rounded-md bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors duration-150 disabled:opacity-40"
            />
            <Button onClick={handleScrape} loading={loading} size="md" className="w-full sm:w-auto">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Scrape
            </Button>
          </div>

          {error && (
            <div className="mt-3 p-2.5 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-mono animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="text-rose-500">✕</span>
                {error}
              </div>
            </div>
          )}

          {/* Quick result preview */}
          {lastResult?.data && (
            <div className="mt-3 p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 animate-fade-in">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 font-mono">
                  Scraped successfully
                </span>
              </div>
              <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">
                {lastResult.data.scrapedData.title}
              </p>
              {lastResult.data.scrapedData.headings.length > 0 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1 font-mono">
                  {lastResult.data.scrapedData.headings.length} heading(s) found
                </p>
              )}
              {lastResult.data.scrapedData.bodyText && (
                <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1 line-clamp-2 font-mono">
                  {lastResult.data.scrapedData.bodyText.substring(0, 200)}…
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Stats */}
        <div className="mb-6">
          <StatsCards stats={stats} loading={statsLoading} />
        </div>

        {/* Logs table */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="truncate">Request History</span>
            </h2>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-mono border border-zinc-200 dark:border-zinc-700 whitespace-nowrap flex-shrink-0">
              {stats.totalRequests} total
            </span>
          </div>

          {logsLoading ? (
            <SkeletonLoader />
          ) : logs.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <LogsTable
                logs={logs}
                onRowClick={(log) => setSelectedLog(log)}
                onDelete={handleDelete}
              />
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </Card>
      </div>

      {/* Detail Modal */}
      <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
}
