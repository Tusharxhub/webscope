"use client";

import { useCallback, useState } from "react";
import { PageAnalysisForm } from "@/components/PageAnalysisForm";
import { PageAnalysisRow, PageAnalysisTable } from "@/components/PageAnalysisTable";

interface PageAnalysisClientProps {
  initialRows: PageAnalysisRow[];
}

export function PageAnalysisClient({ initialRows }: PageAnalysisClientProps) {
  const [rows, setRows] = useState<PageAnalysisRow[]>(initialRows);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/page-analysis");
      const data = await response.json();

      if (!response.ok || !data?.success) {
        return;
      }

      const mapped: PageAnalysisRow[] = data.data.map((row: {
        id: string;
        pageUrl: string;
        title: string | null;
        metaDesc: string | null;
        h1: number;
        h2: number;
        wordCount: number;
        imageCount: number;
        imagesWithoutAlt: number;
        scriptCount: number;
        buttons: number;
        forms: number;
        responseTime: number;
      }) => ({
        id: row.id,
        pageUrl: row.pageUrl,
        title: row.title,
        metaDesc: row.metaDesc,
        h1: row.h1,
        h2: row.h2,
        wordCount: row.wordCount,
        imageCount: row.imageCount,
        imagesWithoutAlt: row.imagesWithoutAlt,
        scriptCount: row.scriptCount,
        buttons: row.buttons,
        forms: row.forms,
        responseTime: row.responseTime,
      }));

      setRows(mapped);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return (
    <div className="space-y-5">
      <PageAnalysisForm onComplete={refresh} />
      {isRefreshing ? <p className="text-sm text-zinc-500 dark:text-zinc-400">Refreshing results...</p> : null}
      <PageAnalysisTable data={rows} />
    </div>
  );
}
