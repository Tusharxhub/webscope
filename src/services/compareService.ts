import { analyzeWebsite } from "@/lib/analyzeWebsite";
import { SiteMetrics, ComparisonVerdict } from "@/types";

function toSiteMetrics(analysis: Awaited<ReturnType<typeof analyzeWebsite>>): SiteMetrics {
  if (!analysis.ok || !analysis.scraped || !analysis.seoAnalysis || !analysis.performance) {
    throw new Error(analysis.message || "Failed to analyze website for comparison");
  }

  return {
    url: analysis.url,
    seoScore: analysis.seoAnalysis.seoScore,
    totalTime: analysis.performance.totalTime,
    serverTime: analysis.performance.serverTime,
    parseTime: analysis.performance.parseTime,
    wordCount: analysis.seoAnalysis.metrics.wordCount,
    h1Count: analysis.scraped.h1Count,
    h2Count: analysis.scraped.h2Count,
    contentSize: analysis.performance.contentSize,
    scriptCount: analysis.performance.scriptCount,
    imageCount: analysis.performance.imageCount,
  };
}

export async function compareWebsites(urlA: string, urlB: string): Promise<{ siteA: SiteMetrics; siteB: SiteMetrics }> {
  const [analysisA, analysisB] = await Promise.all([
    analyzeWebsite(urlA),
    analyzeWebsite(urlB),
  ]);

  return {
    siteA: toSiteMetrics(analysisA),
    siteB: toSiteMetrics(analysisB),
  };
}

export function deriveVerdicts(a: SiteMetrics, b: SiteMetrics): ComparisonVerdict {
  const faster = a.totalTime <= b.totalTime ? "A" : "B";
  const betterSEO = a.seoScore >= b.seoScore ? "A" : "B";
  const largerContent = a.contentSize >= b.contentSize ? "A" : "B";

  const structureA = (a.h1Count === 1 ? 10 : 0) + Math.max(0, 10 - a.scriptCount);
  const structureB = (b.h1Count === 1 ? 10 : 0) + Math.max(0, 10 - b.scriptCount);
  const cleanerStructure = structureA >= structureB ? "A" : "B";

  return { faster, betterSEO, largerContent, cleanerStructure };
}
