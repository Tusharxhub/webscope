import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageAnalysisClient } from "@/components/PageAnalysisClient";
import type { PageAnalysisRow } from "@/components/PageAnalysisTable";

export const metadata = {
  title: "Page Analysis | WebScope Pro",
  description: "Complete page-wise UI metadata analyzer dashboard",
};

export default async function PageAnalysisPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/page-analysis");
  }

  const rows = await prisma.pageAnalysis.findMany({
    orderBy: { createdAt: "desc" },
  });

  const initialRows: PageAnalysisRow[] = rows.map((row) => ({
    id: row.id,
    pageUrl: row.pageUrl,
    title: row.title,
    metaDesc: row.metaDesc,
    h1: row.h1,
    h2: row.h2,
    wordCount: row.wordCount,
    imageCount: row.imageCount,
    imagesWithoutAlt: row.imagesWithoutAlt,
    scriptCount: row.scriptCount,
    buttons: row.buttons,
    forms: row.forms,
    responseTime: row.responseTime,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          Complete Page-Wise UI Metadata Analyzer
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Crawl internal pages, extract metadata and UI structure, and surface SEO/content issues in one dashboard.
        </p>
      </div>

      <PageAnalysisClient initialRows={initialRows} />
    </div>
  );
}
