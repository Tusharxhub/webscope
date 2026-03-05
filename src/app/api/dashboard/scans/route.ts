import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

interface ScanWithPages {
  id: string;
  url: string;
  seoScore: number;
  responseTime: number;
  animalSpirit: string | null;
  createdAt: string;
  pageCount: number;
  pages: {
    id: string;
    pageUrl: string;
    title: string | null;
    metaDesc: string | null;
    h1Count: number;
    h2Count: number;
    wordCount: number;
    imageCount: number;
    scriptCount: number;
    internalLinks: number;
    externalLinks: number;
    responseTime: number;
  }[];
}

interface GroupedScans {
  date: string;
  scans: ScanWithPages[];
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch scans with their page metadata
    const scans = await prisma.scanHistory.findMany({
      where: { userId },
      include: {
        pageMetadata: {
          select: {
            id: true,
            pageUrl: true,
            title: true,
            metaDesc: true,
            h1Count: true,
            h2Count: true,
            wordCount: true,
            imageCount: true,
            scriptCount: true,
            internalLinks: true,
            externalLinks: true,
            responseTime: true,
          },
          orderBy: { pageUrl: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to last 50 scans
    });

    // Transform and group by date
    const scansByDate = new Map<string, ScanWithPages[]>();

    for (const scan of scans) {
      const dateKey = new Date(scan.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const scanData: ScanWithPages = {
        id: scan.id,
        url: scan.url,
        seoScore: scan.seoScore,
        responseTime: scan.responseTime,
        animalSpirit: scan.animalSpirit,
        createdAt: scan.createdAt.toISOString(),
        pageCount: scan.pageMetadata.length,
        pages: scan.pageMetadata,
      };

      if (!scansByDate.has(dateKey)) {
        scansByDate.set(dateKey, []);
      }
      scansByDate.get(dateKey)!.push(scanData);
    }

    // Convert to array format
    const grouped: GroupedScans[] = Array.from(scansByDate.entries()).map(([date, scans]) => ({
      date,
      scans,
    }));

    return NextResponse.json({
      success: true,
      data: grouped,
    });
  } catch (error) {
    console.error("Failed to fetch scans:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch scans" },
      { status: 500 }
    );
  }
}
