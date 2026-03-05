import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";
import { jsonApiError } from "@/lib/errorHandler";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return jsonApiError("UNAUTHORIZED", "Unauthorized", 401);
        }

        // Fetch data for the report
        const metadataLogs = await prisma.pageMetadata.findMany({
            orderBy: { createdAt: "desc" },
        });

        if (!metadataLogs || metadataLogs.length === 0) {
            return new NextResponse("No data available to export", { status: 404 });
        }

        // Fetch latest scraped data for SEO Score and Animal Spirit
        const latestUrl = metadataLogs[0]?.siteUrl || "";
        const latestScrapedData = await prisma.scrapedData.findFirst({
            where: {
                request: {
                    url: {
                        contains: new URL(latestUrl).hostname,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            include: {
                request: true,
            },
        });

        // Create a PDF document
        const doc = new PDFDocument({ margin: 50 });

        // Create a buffer stream
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));

        return new Promise<NextResponse>((resolve, reject) => {
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(
                    new NextResponse(pdfData, {
                        status: 200,
                        headers: {
                            "Content-Type": "application/pdf",
                            "Content-Disposition": 'attachment; filename="website-report.pdf"',
                        },
                    })
                );
            });

            doc.on('error', reject);

            // --- Build PDF Content ---

            // Header
            doc.fontSize(26).fillColor('#1e3a5f').text('WebScope Pro', { align: 'center' });
            doc.fontSize(18).fillColor('#4b5563').text('Website Analysis Report', { align: 'center' });
            doc.moveDown(1);

            doc.fontSize(12).fillColor('#6b7280').text(`Generated: ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}`, { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(14).fillColor('#1e3a5f').text(`Root URL: ${latestUrl}`, { align: 'center' });
            doc.moveDown(2);

            // Divider
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#e5e7eb');
            doc.moveDown(1);

            // Section: Website Overview
            doc.fontSize(18).fillColor('#1e3a5f').text('Website Overview');
            doc.moveDown(0.5);

            const avgResponseTime = metadataLogs.reduce((acc: number, log: { responseTime: number }) => acc + log.responseTime, 0) / metadataLogs.length;
            const totalWords = metadataLogs.reduce((acc: number, log: { wordCount: number }) => acc + log.wordCount, 0);
            const totalImages = metadataLogs.reduce((acc: number, log: { imageCount: number }) => acc + log.imageCount, 0);
            const pagesWithMissingMeta = metadataLogs.filter((log: { metaDesc: string | null }) => !log.metaDesc).length;

            doc.fontSize(11).fillColor('#374151');
            doc.text(`Total Pages Analyzed: ${metadataLogs.length}`);
            doc.text(`Average Response Time: ${Math.round(avgResponseTime)} ms`);
            doc.text(`Total Word Count: ${totalWords.toLocaleString()}`);
            doc.text(`Total Images: ${totalImages}`);
            doc.text(`Pages Missing Meta Description: ${pagesWithMissingMeta}`);
            doc.moveDown(2);

            // Section: SEO Score (if available)
            if (latestScrapedData?.seoScore !== null && latestScrapedData?.seoScore !== undefined) {
                doc.fontSize(18).fillColor('#1e3a5f').text('SEO Score');
                doc.moveDown(0.5);

                const seoScore = latestScrapedData.seoScore;
                const scoreColor = seoScore >= 80 ? '#10b981' : seoScore >= 50 ? '#f59e0b' : '#ef4444';

                doc.fontSize(36).fillColor(scoreColor).text(`${seoScore}`, { continued: true });
                doc.fontSize(14).fillColor('#6b7280').text(' / 100');
                doc.moveDown(0.5);

                doc.fontSize(11).fillColor('#374151');
                if (latestScrapedData.h1Count !== null) doc.text(`H1 Tags: ${latestScrapedData.h1Count}`);
                if (latestScrapedData.h2Count !== null) doc.text(`H2 Tags: ${latestScrapedData.h2Count}`);
                if (latestScrapedData.titleLength !== null) doc.text(`Title Length: ${latestScrapedData.titleLength} characters`);
                if (latestScrapedData.metaLength !== null) doc.text(`Meta Description Length: ${latestScrapedData.metaLength} characters`);
                if (latestScrapedData.missingAltCount !== null) doc.text(`Images Missing Alt Text: ${latestScrapedData.missingAltCount}`);
                doc.moveDown(2);
            }

            // Section: Animal Spirit (if available)
            if (latestScrapedData?.animalSpirit && latestScrapedData?.animalType) {
                doc.fontSize(18).fillColor('#1e3a5f').text('Animal Spirit Analysis');
                doc.moveDown(0.5);

                doc.fontSize(14).fillColor('#7c3aed').text(`🦁 ${latestScrapedData.animalType}`);
                doc.moveDown(0.3);

                doc.fontSize(11).fillColor('#374151');
                const spiritText = latestScrapedData.animalSpirit;
                // Wrap long text
                if (spiritText.length > 400) {
                    doc.text(spiritText.substring(0, 400) + '...');
                } else {
                    doc.text(spiritText);
                }
                doc.moveDown(2);
            }

            // Section: Performance Metrics
            doc.fontSize(18).fillColor('#1e3a5f').text('Performance Metrics');
            doc.moveDown(0.5);

            doc.fontSize(11).fillColor('#374151');

            // Find fastest and slowest pages
            let fastestTime = metadataLogs[0]?.responseTime ?? 0;
            let slowestTime = metadataLogs[0]?.responseTime ?? 0;

            for (const log of metadataLogs) {
                if (log.responseTime < fastestTime) fastestTime = log.responseTime;
                if (log.responseTime > slowestTime) slowestTime = log.responseTime;
            }

            doc.text(`Fastest Page: ${Math.round(fastestTime)} ms`);
            doc.text(`Slowest Page: ${Math.round(slowestTime)} ms`);
            doc.text(`Average Response Time: ${Math.round(avgResponseTime)} ms`);

            if (latestScrapedData && latestScrapedData.contentSize) {
                doc.text(`Content Size: ${(latestScrapedData.contentSize / 1024).toFixed(2)} KB`);
            }
            if (latestScrapedData && latestScrapedData.scriptCount !== null) {
                doc.text(`Script Count: ${latestScrapedData.scriptCount}`);
            }
            if (latestScrapedData && latestScrapedData.imageCount !== null) {
                doc.text(`Image Count: ${latestScrapedData.imageCount}`);
            }

            doc.moveDown(2);

            // Page Break before detailed metadata
            doc.addPage();

            // Section: Page Metadata Details
            doc.fontSize(18).fillColor('#1e3a5f').text('Page-wise Metadata');
            doc.moveDown(1);

            metadataLogs.forEach((log: { title: string | null, pageUrl: string, metaDesc: string | null, h1Count: number, h2Count: number, wordCount: number, responseTime: number, imageCount: number, scriptCount: number }, index: number) => {
                // Page header
                doc.fontSize(12).fillColor('#2563eb').text(`Page ${index + 1}: ${log.title || 'Untitled'}`, {
                    underline: true,
                });
                doc.fontSize(10).fillColor('#374151').moveDown(0.2);

                doc.text(`URL: ${log.pageUrl}`);

                // Highlight missing meta description
                if (!log.metaDesc || log.metaDesc.trim() === '') {
                    doc.fillColor('#ef4444').text(`Meta Description: ⚠️ Missing`);
                    doc.fillColor('#374151');
                } else {
                    const metaTruncated = log.metaDesc.length > 100
                        ? log.metaDesc.substring(0, 100) + '...'
                        : log.metaDesc;
                    doc.text(`Meta Description: ${metaTruncated}`);
                }

                doc.text(`H1: ${log.h1Count}  |  H2: ${log.h2Count}  |  Words: ${log.wordCount}`);
                doc.text(`Response: ${log.responseTime}ms  |  Images: ${log.imageCount}  |  Scripts: ${log.scriptCount}`);

                doc.moveDown(1);

                // Add a page break if nearing bottom
                if (doc.y > 700 && index < metadataLogs.length - 1) {
                    doc.addPage();
                }
            });

            doc.end();
        });

    } catch (error) {
        console.error("PDF Export error", error);
        return jsonApiError("UNKNOWN", "Failed to generate PDF report", 500);
    }
}
