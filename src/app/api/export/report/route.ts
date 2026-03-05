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
            doc.fontSize(24).text('Website Analysis Report', { align: 'center' });
            doc.moveDown(1);

            const latestUrl = metadataLogs[0]?.url || "Unknown URL";
            doc.fontSize(14).text(`Root URL: ${latestUrl}`, { align: 'center' });
            doc.moveDown(2);

            // Section: Overview
            doc.fontSize(18).text('Website Overview').moveDown(0.5);
            doc.fontSize(12).text(`Total Pages Analyzed: ${metadataLogs.length}`);

            const avgResponseTime = metadataLogs.reduce((acc: number, log: { responseTime: number }) => acc + log.responseTime, 0) / metadataLogs.length;
            doc.text(`Average Response Time: ${Math.round(avgResponseTime)} ms`);

            const totalWords = metadataLogs.reduce((acc: number, log: { wordCount: number }) => acc + log.wordCount, 0);
            doc.text(`Total Words: ${totalWords}`);
            doc.moveDown(2);

            // Section: Page Metadata Details
            doc.fontSize(18).text('Page Metadata').moveDown(1);

            metadataLogs.forEach((log: { title: string | null, pageUrl: string, metaDesc: string | null, h1Count: number, h2Count: number, wordCount: number, responseTime: number, imageCount: number, scriptCount: number }, index: number) => {
                doc.fontSize(14).fillColor('#0055bc').text(`Page ${index + 1}: ${log.title || 'Untitled'}`);
                doc.fontSize(10).fillColor('black').moveDown(0.2);

                doc.text(`URL: ${log.pageUrl}`);
                doc.text(`Meta Description: ${log.metaDesc || 'N/A'}`);
                doc.text(`H1 Count: ${log.h1Count}  |  H2 Count: ${log.h2Count}`);
                doc.text(`Word Count: ${log.wordCount}  |  Response Time: ${log.responseTime}ms`);
                doc.text(`Images: ${log.imageCount}  |  Scripts: ${log.scriptCount}`);

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
