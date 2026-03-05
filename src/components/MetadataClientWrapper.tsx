"use client";

import React, { useState, useCallback } from "react";
import { AnalysisForm } from "./AnalysisForm";
import { MetadataTable, MetadataRow } from "./MetadataTable";

interface MetadataClientWrapperProps {
    initialData: MetadataRow[];
}

export function MetadataClientWrapper({ initialData }: MetadataClientWrapperProps) {
    const [data, setData] = useState<MetadataRow[]>(initialData);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshData = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const response = await fetch("/api/metadata");
            const result = await response.json();

            if (result.success && result.data) {
                const mapped: MetadataRow[] = result.data.map((log: {
                    id: string;
                    pageUrl: string;
                    title: string | null;
                    metaDesc: string | null;
                    h1Count: number;
                    h2Count: number;
                    wordCount: number;
                    responseTime: number;
                    imageCount: number;
                    scriptCount: number;
                }) => ({
                    id: log.id,
                    pageUrl: log.pageUrl,
                    title: log.title,
                    metaDesc: log.metaDesc,
                    h1Count: log.h1Count,
                    h2Count: log.h2Count,
                    wordCount: log.wordCount,
                    responseTime: log.responseTime,
                    imageCount: log.imageCount,
                    scriptCount: log.scriptCount,
                }));
                setData(mapped);
            }
        } catch (error) {
            console.error("Failed to refresh data:", error);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    return (
        <div className="space-y-6">
            <AnalysisForm onAnalysisComplete={refreshData} />

            {isRefreshing && (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Refreshing data...
                </div>
            )}

            <MetadataTable data={data} />
        </div>
    );
}
