"use client";

import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
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

  // Socket.io real-time
  useEffect(() => {
    let socket: Socket | null = null;
    const connectSocket = async () => {
      try {
        await fetch("/api/socketio");
        socket = io({ path: "/api/socketio", addTrailingSlash: false });
        socket.on("new-log", (log: RequestLogEntry) => {
          setLogs((prev) => [log, ...prev.slice(0, 9)]);
          setStats((s) => ({ ...s, totalRequests: s.totalRequests + 1 }));
        });
      } catch { /* silent */ }
    };
    connectSocket();
    return () => { socket?.disconnect(); };
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 transition-colors duration-500">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Greeting */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back{session?.user?.name ? `, ${session.user.name}` : ""} 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enter a URL below to scrape and analyze any website.
          </p>
        </div>

        {/* Scraper input */}
        <Card className="p-6 sm:p-8 mb-6">
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-300 disabled:opacity-50"
            />
            <Button onClick={handleScrape} loading={loading} size="lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Scrape
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm animate-fadeIn">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Quick result preview */}
          {lastResult?.data && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 animate-fadeIn">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Scraped successfully
                </span>
              </div>
              <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">
                {lastResult.data.scrapedData.title}
              </p>
              {lastResult.data.scrapedData.headings.length > 0 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  Found {lastResult.data.scrapedData.headings.length} heading(s)
                </p>
              )}
              {lastResult.data.scrapedData.bodyText && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 line-clamp-2">
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
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Request History
            </h2>
            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg">
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
