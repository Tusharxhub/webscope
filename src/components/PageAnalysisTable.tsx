"use client";

import { useMemo, useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export interface PageAnalysisRow {
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
}

interface PageAnalysisTableProps {
  data: PageAnalysisRow[];
}

type SortField = keyof PageAnalysisRow;
type SortDirection = "asc" | "desc";

const ROWS_PER_PAGE = 10;
const LOW_WORD_THRESHOLD = 300;

export function PageAnalysisTable({ data }: PageAnalysisTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("pageUrl");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState<"csv" | "pdf" | "json" | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rows = query
      ? data.filter((row) => {
          return (
            row.pageUrl.toLowerCase().includes(query) ||
            (row.title || "").toLowerCase().includes(query) ||
            (row.metaDesc || "").toLowerCase().includes(query)
          );
        })
      : data;

    return [...rows].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === bValue) {
        return 0;
      }

      if (aValue === null || aValue === undefined) {
        return sortDirection === "asc" ? 1 : -1;
      }

      if (bValue === null || bValue === undefined) {
        return sortDirection === "asc" ? -1 : 1;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [data, search, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const exportFile = async (kind: "csv" | "pdf" | "json") => {
    setIsExporting(kind);
    window.location.href = `/api/export/page-analysis/${kind}`;
    setTimeout(() => setIsExporting(null), 1000);
  };

  const sortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUpDownIcon className="h-4 w-4 text-zinc-400" />;
    }

    return sortDirection === "asc" ? (
      <ChevronUpIcon className="h-4 w-4 text-indigo-500" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 text-indigo-500" />
    );
  };

  const renderHeader = (field: SortField, label: string) => (
    <th
      onClick={() => handleSort(field)}
      className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      <div className="flex items-center justify-between gap-2">
        <span>{label}</span>
        {sortIcon(field)}
      </div>
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between dark:border-zinc-700 dark:bg-zinc-900">
        <div className="relative w-full md:max-w-md">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search URL, title, meta description"
            className="w-full rounded-md border border-zinc-300 bg-white py-2 pl-10 pr-3 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-indigo-800"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportFile("csv")}
            disabled={isExporting !== null || data.length === 0}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExporting === "csv" ? "Exporting..." : "Export CSV"}
          </button>
          <button
            onClick={() => exportFile("pdf")}
            disabled={isExporting !== null || data.length === 0}
            className="rounded-md bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExporting === "pdf" ? "Exporting..." : "Export PDF"}
          </button>
          <button
            onClick={() => exportFile("json")}
            disabled={isExporting !== null || data.length === 0}
            className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExporting === "json" ? "Exporting..." : "Export JSON"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <table className="min-w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/80">
            <tr>
              {renderHeader("pageUrl", "Page URL")}
              {renderHeader("title", "Title")}
              {renderHeader("metaDesc", "Meta Description")}
              {renderHeader("h1", "H1")}
              {renderHeader("h2", "H2")}
              {renderHeader("wordCount", "Word Count")}
              {renderHeader("imageCount", "Images")}
              {renderHeader("scriptCount", "Scripts")}
              {renderHeader("buttons", "Buttons")}
              {renderHeader("forms", "Forms")}
              {renderHeader("responseTime", "Response Time")}
            </tr>
          </thead>
          <tbody>
            {pagedRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400">
                  No analyzed pages found.
                </td>
              </tr>
            ) : (
              pagedRows.map((row) => {
                const missingMeta = !row.metaDesc || row.metaDesc.trim().length === 0;
                const multipleH1 = row.h1 > 1;
                const hasMissingAlt = row.imagesWithoutAlt > 0;
                const lowWordCount = row.wordCount < LOW_WORD_THRESHOLD;

                const rowIssue = missingMeta || multipleH1 || hasMissingAlt || lowWordCount;

                return (
                  <tr
                    key={row.id}
                    className={`border-b border-zinc-100 text-zinc-700 dark:border-zinc-800 dark:text-zinc-200 ${
                      rowIssue ? "bg-amber-50/40 dark:bg-amber-950/10" : ""
                    }`}
                  >
                    <td className="max-w-[240px] truncate px-4 py-3 font-medium" title={row.pageUrl}>
                      <a href={row.pageUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline dark:text-indigo-400">
                        {row.pageUrl}
                      </a>
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3" title={row.title || ""}>{row.title || "-"}</td>
                    <td
                      className={`max-w-[260px] truncate px-4 py-3 ${missingMeta ? "text-rose-600 dark:text-rose-400" : ""}`}
                      title={row.metaDesc || "Missing meta description"}
                    >
                      {row.metaDesc || "Missing meta description"}
                    </td>
                    <td className={`px-4 py-3 text-right ${multipleH1 ? "text-rose-600 dark:text-rose-400" : ""}`}>{row.h1}</td>
                    <td className="px-4 py-3 text-right">{row.h2}</td>
                    <td className={`px-4 py-3 text-right ${lowWordCount ? "text-amber-600 dark:text-amber-400" : ""}`}>{row.wordCount}</td>
                    <td className="px-4 py-3 text-right">
                      {row.imageCount}
                      {hasMissingAlt ? (
                        <span className="ml-1 text-xs text-rose-600 dark:text-rose-400">({row.imagesWithoutAlt} no-alt)</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right">{row.scriptCount}</td>
                    <td className="px-4 py-3 text-right">{row.buttons}</td>
                    <td className="px-4 py-3 text-right">{row.forms}</td>
                    <td className="px-4 py-3 text-right">{row.responseTime} ms</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-300">
          Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}-{Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} of {filtered.length}
        </p>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded border border-zinc-300 px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Prev
          </button>
          <span className="text-zinc-500 dark:text-zinc-400">
            Page {currentPage}/{totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded border border-zinc-300 px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
