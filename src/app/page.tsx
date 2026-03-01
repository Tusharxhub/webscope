"use client";

import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import ThemeToggle from "@/components/ThemeToggle";
import LoadingSpinner from "@/components/LoadingSpinner";
import SkeletonLoader from "@/components/SkeletonLoader";
import ScrapeResultCard from "@/components/ScrapeResultCard";
import RequestHistory from "@/components/RequestHistory";
import { ScrapeResponse, RequestLogEntry } from "@/types";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScrapeResponse | null>(null);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState<RequestLogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  // Fetch initial logs
  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch {
      // silent
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Socket.io real-time
  useEffect(() => {
    let socket: Socket | null = null;
    const connectSocket = async () => {
      await fetch("/api/socketio");
      socket = io({ path: "/api/socketio", addTrailingSlash: false });
      socket.on("new-log", (log: RequestLogEntry) => {
        setLogs((prev) => [log, ...prev.slice(0, 49)]);
      });
    };
    connectSocket();
    return () => {
      socket?.disconnect();
    };
  }, []);

  const isValidUrl = (str: string) => {
    try {
      const u = new URL(str);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleScrape = async () => {
    setError("");
    setResult(null);

    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    if (!isValidUrl(url.trim())) {
      setError("Please enter a valid URL starting with http:// or https://");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data: ScrapeResponse = await res.json();

      if (data.success) {
        setResult(data);
        // Prepend to local logs
        if (data.data) {
          setLogs((prev) => [data.data!.requestLog, ...prev.slice(0, 49)]);
        }
      } else {
        setError(data.error || "Something went wrong");
        if (data.data) {
          setLogs((prev) => [data.data!.requestLog, ...prev.slice(0, 49)]);
        }
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleScrape();
    }
  };

  return (
    <>
      <ThemeToggle />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 transition-colors duration-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          {/* Hero */}
          <header className="text-center mb-12 sm:mb-16 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              WebScope
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight">
              Analyze Any Website
              <br />
              <span className="bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent">
                in Seconds
              </span>
            </h1>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Enter a URL to scrape its title and headings. All requests are logged in real time.
            </p>
          </header>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Left: Scraper card */}
            <div className="lg:col-span-3 space-y-6">
              {/* Input card */}
              <div className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200/60 dark:border-white/10 shadow-xl p-6 sm:p-8">
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
                  <button
                    onClick={handleScrape}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                  >
                    {loading ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Scrape
                      </>
                    )}
                  </button>
                </div>

                {/* Error */}
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
              </div>

              {/* Results */}
              {loading && !result && (
                <div className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200/60 dark:border-white/10 shadow-lg p-6">
                  <SkeletonLoader />
                </div>
              )}

              {result && <ScrapeResultCard result={result} />}
            </div>

            {/* Right: History panel */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200/60 dark:border-white/10 shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Request History
                  </h2>
                  <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg">
                    {logs.length} logs
                  </span>
                </div>

                {logsLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-100 dark:bg-white/5 rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <RequestHistory logs={logs} />
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center mt-16 text-sm text-gray-400 dark:text-gray-500">
            Built with Next.js, Prisma & Neon PostgreSQL
          </footer>
        </div>
      </div>
    </>
  );
}
