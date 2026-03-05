import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import PDFDocument from "pdfkit";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonApiError } from "@/lib/errorHandler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    const rows = await prisma.pageAnalysis.findMany({ orderBy: { createdAt: "desc" } });
    if (rows.length === 0) {
      return new NextResponse("No page analysis data found", { status: 404 });
    }

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const buffers: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => buffers.push(chunk));

    return await new Promise<NextResponse>((resolve, reject) => {
      doc.on("end", () => {
        resolve(
          new NextResponse(Buffer.concat(buffers), {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": 'attachment; filename="page-analysis.pdf"',
            },
          })
        );
      });
      doc.on("error", reject);

      doc.fontSize(22).fillColor("#0f172a").text("WebScope Pro - Page Analysis Report", {
        align: "center",
      });
      doc.moveDown(0.5);
      doc
        .fontSize(11)
        .fillColor("#475569")
        .text(`Generated: ${new Date().toISOString()}`, { align: "center" });

      doc.moveDown(1.5);
      const avgResponse = Math.round(
        rows.reduce((acc, row) => acc + row.responseTime, 0) / Math.max(1, rows.length)
      );
      const totalWords = rows.reduce((acc, row) => acc + row.wordCount, 0);
      const missingMeta = rows.filter((r) => !r.metaDesc || r.metaDesc.trim().length === 0).length;

      doc.fontSize(14).fillColor("#111827").text("Summary");
      doc.fontSize(11).fillColor("#334155");
      doc.text(`Pages analyzed: ${rows.length}`);
      doc.text(`Average response time: ${avgResponse} ms`);
      doc.text(`Total words: ${totalWords}`);
      doc.text(`Pages missing meta description: ${missingMeta}`);

      doc.moveDown(1);
      doc.fontSize(14).fillColor("#111827").text("Page Details");
      doc.moveDown(0.5);

      rows.forEach((row, idx) => {
        if (doc.y > 730) {
          doc.addPage();
        }

        doc.fontSize(11).fillColor("#1d4ed8").text(`${idx + 1}. ${row.title || "Untitled"}`);
        doc.fontSize(9).fillColor("#334155");
        doc.text(`URL: ${row.pageUrl}`);
        doc.text(`Meta: ${row.metaDesc || "Missing"}`);
        doc.text(
          `H1: ${row.h1} | H2: ${row.h2} | Words: ${row.wordCount} | Images: ${row.imageCount} | Scripts: ${row.scriptCount}`
        );
        doc.text(
          `Buttons: ${row.buttons} | Forms: ${row.forms} | Inputs: ${row.inputs} | Response: ${row.responseTime}ms`
        );
        doc.moveDown(0.6);
      });

      doc.end();
    });
  } catch (error) {
    console.error("Page analysis PDF export error:", error);
    return jsonApiError("UNKNOWN", "Failed to export PDF", 500);
  }
}
