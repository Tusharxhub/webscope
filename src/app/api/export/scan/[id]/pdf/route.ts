import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const scanId = params.id;

    // Fetch scan with page metadata
    const scan = await prisma.scanHistory.findFirst({
      where: {
        id: scanId,
        userId: session.user.id,
      },
      include: {
        pageMetadata: {
          orderBy: { pageUrl: "asc" },
        },
      },
    });

    if (!scan) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    // Generate HTML report
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scan Report - ${scan.url}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #1f2937; line-height: 1.6; }
    .header { margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
    .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; color: #111827; }
    .header .meta { font-size: 14px; color: #6b7280; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .summary-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }
    .summary-card .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 4px; font-weight: 600; }
    .summary-card .value { font-size: 24px; font-weight: 700; color: #111827; }
    .table-container { margin-bottom: 40px; }
    .table-container h2 { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #111827; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    thead { background: #f9fafb; }
    th { text-align: left; padding: 12px 8px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; }
    td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; color: #4b5563; }
    tr:hover { background: #f9fafb; }
    .url-cell { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #4f46e5; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center; }
    @media print {
      body { padding: 20px; }
      .header { page-break-after: avoid; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Website Analysis Report</h1>
    <div class="meta">
      <div><strong>URL:</strong> ${scan.url}</div>
      <div><strong>Date:</strong> ${new Date(scan.createdAt).toLocaleString()}</div>
      <div><strong>Pages Analyzed:</strong> ${scan.pageMetadata.length}</div>
    </div>
  </div>

  <div class="summary">
    <div class="summary-card">
      <div class="label">SEO Score</div>
      <div class="value">${scan.seoScore}</div>
    </div>
    <div class="summary-card">
      <div class="label">Response Time</div>
      <div class="value">${scan.responseTime}ms</div>
    </div>
    <div class="summary-card">
      <div class="label">Status Code</div>
      <div class="value">${scan.statusCode}</div>
    </div>
    ${scan.animalSpirit ? `
    <div class="summary-card">
      <div class="label">Animal Spirit</div>
      <div class="value" style="font-size: 18px; text-transform: capitalize;">${scan.animalSpirit}</div>
    </div>
    ` : ""}
  </div>

  <div class="table-container">
    <h2>Page Analysis Details</h2>
    <table>
      <thead>
        <tr>
          <th>Page URL</th>
          <th>Title</th>
          <th>H1</th>
          <th>H2</th>
          <th>Words</th>
          <th>Images</th>
          <th>Scripts</th>
          <th>Int. Links</th>
          <th>Ext. Links</th>
          <th>Time (ms)</th>
        </tr>
      </thead>
      <tbody>
        ${scan.pageMetadata
          .map(
            (page) => `
          <tr>
            <td class="url-cell" title="${page.pageUrl}">${page.pageUrl}</td>
            <td>${page.title || "No title"}</td>
            <td>${page.h1Count}</td>
            <td>${page.h2Count}</td>
            <td>${page.wordCount.toLocaleString()}</td>
            <td>${page.imageCount}</td>
            <td>${page.scriptCount}</td>
            <td>${page.internalLinks}</td>
            <td>${page.externalLinks}</td>
            <td>${page.responseTime}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  </div>

  <div class="footer">
    Generated by WebScope • ${new Date().toLocaleString()}
  </div>

  <script>
    // Auto-print dialog on load
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
    `.trim();

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
