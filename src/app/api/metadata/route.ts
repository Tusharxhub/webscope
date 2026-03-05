import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeSitePages, PageMetadata } from "@/lib/pageMetadataAnalyzer";
import { jsonApiError } from "@/lib/errorHandler";
import { urlSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Rate limiter (1 analysis per 10 seconds per user)
const lastAnalysis = new Map<string, number>();
const ANALYSIS_COOLDOWN_MS = 10000;

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return jsonApiError("UNAUTHORIZED", "Unauthorized", 401);
        }

        // Rate limiting
        const now = Date.now();
        const last = lastAnalysis.get(session.user.id) || 0;
        if (now - last < ANALYSIS_COOLDOWN_MS) {
            const remainingMs = ANALYSIS_COOLDOWN_MS - (now - last);
            const retryAfterSeconds = Math.ceil(remainingMs / 1000);

            return NextResponse.json(
                {
                    success: false,
                    errorType: "VALIDATION",
                    message: `Please wait ${retryAfterSeconds}s before starting a new analysis.`,
                    retryAfterSeconds,
                },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(retryAfterSeconds),
                    },
                }
            );
        }
        lastAnalysis.set(session.user.id, now);

        // Parse and validate URL
        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return jsonApiError("VALIDATION", "Invalid JSON body", 400);
        }

        const parsed = urlSchema.safeParse(body);
        if (!parsed.success) {
            const msg = parsed.error.issues[0]?.message || "Invalid URL";
            return jsonApiError("VALIDATION", msg, 400);
        }

        const { url: startUrl } = parsed.data;

        // Analyze website pages
        const pages = await analyzeSitePages(startUrl);

        if (pages.length === 0) {
            return jsonApiError("NETWORK", "Could not analyze any pages from this URL", 502);
        }

        // Save to database
        const savedRecords = await prisma.$transaction(
            pages.map((page: PageMetadata) =>
                prisma.pageMetadata.create({
                    data: {
                        siteUrl: startUrl,
                        pageUrl: page.url,
                        title: page.title,
                        metaDesc: page.metaDescription,
                        metaKeywords: page.metaKeywords,
                        canonicalTag: page.canonicalTag,
                        ogTitle: page.ogTitle,
                        ogDescription: page.ogDescription,
                        h1Count: page.h1Count,
                        h2Count: page.h2Count,
                        wordCount: page.wordCount,
                        imageCount: page.imageCount,
                        scriptCount: page.scriptCount,
                        responseTime: page.responseTime,
                    },
                })
            )
        );

        return NextResponse.json({
            success: true,
            data: {
                pagesAnalyzed: savedRecords.length,
                rootUrl: startUrl,
                pages: pages.map((page: PageMetadata) => ({
                    url: page.url,
                    title: page.title,
                    metaDescription: page.metaDescription,
                    metaKeywords: page.metaKeywords,
                    canonicalTag: page.canonicalTag,
                    ogTitle: page.ogTitle,
                    ogDescription: page.ogDescription,
                    h1Count: page.h1Count,
                    h2Count: page.h2Count,
                    wordCount: page.wordCount,
                    imageCount: page.imageCount,
                    scriptCount: page.scriptCount,
                    responseTime: page.responseTime,
                })),
            },
        });
    } catch (error) {
        console.error("Metadata analysis error:", error);
        return jsonApiError("UNKNOWN", "Failed to analyze website metadata", 500);
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return jsonApiError("UNAUTHORIZED", "Unauthorized", 401);
        }

        const metadataLogs = await prisma.pageMetadata.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({
            success: true,
            data: metadataLogs,
        });
    } catch (error) {
        console.error("Fetch metadata error:", error);
        return jsonApiError("UNKNOWN", "Failed to fetch metadata", 500);
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return jsonApiError("UNAUTHORIZED", "Unauthorized", 401);
        }

        const { searchParams } = new URL(req.url);
        const rootUrl = searchParams.get("url");

        if (rootUrl) {
            // Delete metadata for a specific root URL
            await prisma.pageMetadata.deleteMany({
                where: { siteUrl: rootUrl },
            });
        } else {
            // Delete all metadata (admin action)
            await prisma.pageMetadata.deleteMany({});
        }

        return NextResponse.json({
            success: true,
            message: rootUrl
                ? `Deleted metadata for ${rootUrl}`
                : "Deleted all metadata",
        });
    } catch (error) {
        console.error("Delete metadata error:", error);
        return jsonApiError("UNKNOWN", "Failed to delete metadata", 500);
    }
}
