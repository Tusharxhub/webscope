"use client";

import React, { useState, useMemo } from "react";
import {
    ChevronDownIcon,
    ChevronUpIcon,
    ChevronUpDownIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon
} from "@heroicons/react/24/outline";

export interface MetadataRow {
    id: string;
    siteUrl: string;
    pageUrl: string;
    title: string | null;
    metaDesc: string | null;
    metaKeywords: string | null;
    canonicalTag: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    h1Count: number;
    h2Count: number;
    wordCount: number;
    responseTime: number;
    imageCount: number;
    scriptCount: number;
    // Optionally add more fields for future extensibility
}

interface MetadataTableProps {
    data: MetadataRow[];
}

type SortField = keyof MetadataRow;
type SortOrder = "asc" | "desc";

export function MetadataTable({ data }: MetadataTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState<SortField>("pageUrl");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const rowsPerPage = 10;

    const [isExportingCsv, setIsExportingCsv] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    const handleExportCsv = () => {
        setIsExportingCsv(true);
        window.location.href = "/api/export/metadata";
        setTimeout(() => setIsExportingCsv(false), 1000);
    };

    const handleExportPdf = () => {
        setIsExportingPdf(true);
        window.location.href = "/api/export/report";
        setTimeout(() => setIsExportingPdf(false), 1000);
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const filteredAndSortedData = useMemo(() => {
        return data
            .filter((row) => {
                const matchesSearch =
                    row.pageUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    row.siteUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (row.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                    (row.metaDesc?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                    (row.metaKeywords?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                    (row.ogTitle?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                    (row.ogDescription?.toLowerCase() || "").includes(searchTerm.toLowerCase());
                return matchesSearch;
            })
            .sort((a, b) => {
                const aVal = a[sortField];
                const bVal = b[sortField];

                if (aVal === bVal) return 0;
                if (aVal === null || aVal === undefined) return sortOrder === "asc" ? 1 : -1;
                if (bVal === null || bVal === undefined) return sortOrder === "asc" ? -1 : 1;

                if (typeof aVal === "string" && typeof bVal === "string") {
                    return sortOrder === "asc"
                        ? aVal.localeCompare(bVal)
                        : bVal.localeCompare(aVal);
                }

                if (typeof aVal === "number" && typeof bVal === "number") {
                    return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
                }

                return 0;
            });
    }, [data, searchTerm, sortField, sortOrder]);

    const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);
    const paginatedData = filteredAndSortedData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ChevronUpDownIcon className="w-4 h-4 ml-1 opacity-50" />;
        return sortOrder === "asc" ? (
            <ChevronUpIcon className="w-4 h-4 ml-1" />
        ) : (
            <ChevronDownIcon className="w-4 h-4 ml-1" />
        );
    };

    const renderSortableHeader = (field: SortField, label: string) => (
        <th
            className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center justify-between">
                <span>{label}</span>
                <SortIcon field={field} />
            </div>
        </th>
    );

    return (
        <div className="w-full space-y-4">
            {/* Top Bar: Search and Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">

                {/* Search Input */}
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-colors"
                        placeholder="Search URLs, titles, or descriptions..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={handleExportCsv}
                        disabled={isExportingCsv || data.length === 0}
                        className="flex-1 md:flex-none justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
                    >
                        {isExportingCsv ? "Exporting..." : "Download CSV"}
                    </button>

                    <button
                        onClick={handleExportPdf}
                        disabled={isExportingPdf || data.length === 0}
                        className="flex-1 md:flex-none justify-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
                    >
                        {isExportingPdf ? "Exporting..." : "Download PDF"}
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800/80 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-3 py-3 w-10">Details</th>
                            {renderSortableHeader("siteUrl", "Site URL")}
                            {renderSortableHeader("pageUrl", "Page URL")}
                            {renderSortableHeader("title", "Title")}
                            {renderSortableHeader("metaDesc", "Meta Description")}
                            {renderSortableHeader("h1Count", "H1")}
                            {renderSortableHeader("h2Count", "H2")}
                            {renderSortableHeader("wordCount", "Words")}
                            {renderSortableHeader("responseTime", "Response (ms)")}
                            {renderSortableHeader("imageCount", "Images")}
                            {renderSortableHeader("scriptCount", "Scripts")}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
                        {paginatedData.length === 0 ? (
                            <tr className="bg-white dark:bg-gray-900">
                                <td colSpan={11} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                    No pages found matching your search.
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row) => {
                                const isMissingMeta = !row.metaDesc || row.metaDesc.trim() === "";
                                const isExpanded = expandedRowId === row.id;

                                return (
                                    <React.Fragment key={row.id}>
                                        <tr className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-3 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setExpandedRowId(isExpanded ? null : row.id)}
                                                    className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    aria-label={isExpanded ? "Collapse row details" : "Expand row details"}
                                                >
                                                    {isExpanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 truncate max-w-[200px]" title={row.siteUrl}>
                                                {row.siteUrl}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white truncate max-w-[220px]" title={row.pageUrl}>
                                                <a href={row.pageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                                                    {row.pageUrl}
                                                </a>
                                            </td>
                                            <td className="px-4 py-3 truncate max-w-[220px]" title={row.title || ""}>
                                                {row.title || "-"}
                                            </td>
                                            <td
                                                className={`px-4 py-3 truncate max-w-[250px] ${isMissingMeta
                                                    ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-medium"
                                                    : ""
                                                    }`}
                                                title={row.metaDesc || "Missing meta description"}
                                            >
                                                {row.metaDesc || "Missing"}
                                            </td>
                                            <td className="px-4 py-3 text-right">{row.h1Count}</td>
                                            <td className="px-4 py-3 text-right">{row.h2Count}</td>
                                            <td className="px-4 py-3 text-right">{row.wordCount}</td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={row.responseTime > 1000 ? "text-yellow-600 dark:text-yellow-400" : ""}>
                                                    {row.responseTime}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">{row.imageCount}</td>
                                            <td className="px-4 py-3 text-right">{row.scriptCount}</td>
                                        </tr>

                                        {isExpanded && (
                                            <tr className="bg-gray-50 dark:bg-gray-800/40">
                                                <td colSpan={11} className="px-4 py-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                        <div className="rounded border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900">
                                                            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Meta Keywords</p>
                                                            <p className="text-gray-800 dark:text-gray-100 break-words">{row.metaKeywords || "-"}</p>
                                                        </div>
                                                        <div className="rounded border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900">
                                                            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Canonical Tag</p>
                                                            <p className="text-gray-800 dark:text-gray-100 break-words">{row.canonicalTag || "-"}</p>
                                                        </div>
                                                        <div className="rounded border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900">
                                                            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">OpenGraph Title</p>
                                                            <p className="text-gray-800 dark:text-gray-100 break-words">{row.ogTitle || "-"}</p>
                                                        </div>
                                                        <div className="rounded border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900">
                                                            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">OpenGraph Description</p>
                                                            <p className="text-gray-800 dark:text-gray-100 break-words">{row.ogDescription || "-"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to{" "}
                                <span className="font-medium">
                                    {Math.min(currentPage * rowsPerPage, filteredAndSortedData.length)}
                                </span>{" "}
                                of <span className="font-medium">{filteredAndSortedData.length}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                                >
                                    Previous
                                </button>

                                {/* Simple page numbers */}
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1
                                            ? "z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400"
                                            : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
