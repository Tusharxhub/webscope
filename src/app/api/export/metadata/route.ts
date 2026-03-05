import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonApiError } from "@/lib/errorHandler";
import { toCSV } from "@/lib/csvExporter";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        console.log("Export metadata requested at:", req.url);
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return jsonApiError("UNAUTHORIZED", "Unauthorized", 401);
        }

        // Fetch all page metadata
        const metadataLogs = await prisma.pageMetadata.findMany({
            orderBy: { createdAt: "desc" },
        });

        if (!metadataLogs || metadataLogs.length === 0) {
            return new NextResponse("No data available to export", { status: 404 });
        }

        // CSV Headers
        const headers = [
            "Root URL",
            "Page URL",
            "Title",
            "Meta Description",
            "H1 Count",
            "H2 Count",
            "Word Count",
            "Response Time",
            "Image Count",
            "Script Count",
            "Created At",
        ];

        const csvContent = toCSV(
            metadataLogs,
            headers,
            (row) => [
                row.url,
                row.pageUrl,
                row.title,
                row.metaDesc,
                row.h1Count,
                row.h2Count,
                row.wordCount,
                row.responseTime,
                row.imageCount,
                row.scriptCount,
                new Date(row.createdAt).toISOString(),
            ]
        );

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": 'attachment; filename="page-metadata.csv"',
            },
        });
    } catch (error) {
        console.error("CSV Export error", error);
        return jsonApiError("UNKNOWN", "Failed to generate CSV", 500);
    }
}

