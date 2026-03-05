import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { MetadataTable, MetadataRow } from "@/components/MetadataTable";

export const metadata = {
    title: "Website Metadata | WebScope Pro",
    description: "View and export scraped website metadata",
};

export default async function MetadataPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/api/auth/signin?callbackUrl=/metadata");
    }

    // Fetch PageMetadata
    const metadataLogs = await prisma.pageMetadata.findMany({
        orderBy: { createdAt: "desc" },
    });

    const tableData: MetadataRow[] = metadataLogs.map((log: {
        id: string; pageUrl: string; title: string | null; metaDesc: string | null; h1Count: number; h2Count: number; wordCount: number; responseTime: number; imageCount: number; scriptCount: number;
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

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-2">
                    Page-wise Metadata Dashboard
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Analyze crawled metadata across your site&apos;s pages. Export full reports to CSV or PDF.
                </p>
            </div>

            <MetadataTable data={tableData} />
        </div>
    );
}
