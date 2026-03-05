"use client";

import React, { useState } from "react";
import { MagnifyingGlassIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

interface AnalysisFormProps {
    onAnalysisComplete: () => void;
}

export function AnalysisForm({ onAnalysisComplete }: AnalysisFormProps) {
    const [url, setUrl] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAnalyzing(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch("/api/metadata", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(`Successfully analyzed ${data.data.pagesAnalyzed} pages from ${data.data.rootUrl}`);
                setUrl("");
                onAnalysisComplete();
            } else {
                if (response.status === 429) {
                    const waitTime = data.retryAfterSeconds ?? 10;
                    setError(`Rate limit active. Please wait ${waitTime}s and try again.`);
                } else {
                    setError(data.message || "Failed to analyze website");
                }
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Analyze Website Metadata
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Enter a website URL to crawl and analyze its pages. Up to 10 pages will be analyzed.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            required
                            disabled={isAnalyzing}
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-colors disabled:opacity-50"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isAnalyzing || !url}
                        className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm min-w-[140px]"
                    >
                        {isAnalyzing ? (
                            <>
                                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            "Analyze Site"
                        )}
                    </button>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                        <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
                    </div>
                )}
            </form>

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                <ul className="list-disc list-inside space-y-1">
                    <li>Crawls internal links only (same domain)</li>
                    <li>Maximum 10 pages per analysis</li>
                    <li>5 second timeout per page</li>
                    <li>Rate limited to one analysis per 10 seconds</li>
                </ul>
            </div>
        </div>
    );
}
