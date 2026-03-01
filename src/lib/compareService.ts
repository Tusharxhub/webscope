import { analyzeSeo, PageExtraction } from "@/lib/seoAnalyzer";
import { scrapeSite } from "@/lib/scraper";
import { SiteMetrics, ComparisonVerdict } from "@/types";

/**
 * Convert a scraped page into SiteMetrics with SEO analysis.
 */
function toSiteMetrics(
  scraped: Awaited<ReturnType<typeof scrapeSite>>
): SiteMetrics {
  const pageExtraction: PageExtraction = {
    title: scraped.title,
    meta: scraped.meta,
    h1Count: scraped.h1Count,
    h2Count: scraped.h2Count,
    bodyText: scraped.bodyText,
    totalImages: scraped.imageCount,
    imagesWithoutAlt: scraped.imagesWithoutAlt,
  };
  const seo = analyzeSeo(pageExtraction);

  return {
    url: scraped.url,
    seoScore: seo.seoScore,
    totalTime: scraped.responseTime,
    serverTime: scraped.responseTime,
    parseTime: 0,
    wordCount: seo.metrics.wordCount,
    h1Count: scraped.h1Count,
    h2Count: scraped.h2Count,
    contentSize: scraped.contentSize,
    scriptCount: scraped.scriptCount,
    imageCount: scraped.imageCount,
  };
}

/**
 * Scrape two URLs in parallel using Axios + Cheerio and return both metrics.
 * Lightweight — no Puppeteer/Chromium binary needed.
 */
export async function scrapeBothSites(
  urlA: string,
  urlB: string
): Promise<{ siteA: SiteMetrics; siteB: SiteMetrics }> {
  const [rawA, rawB] = await Promise.all([
    scrapeSite(urlA),
    scrapeSite(urlB),
  ]);

  return {
    siteA: toSiteMetrics(rawA),
    siteB: toSiteMetrics(rawB),
  };
}

/**
 * Derive comparison verdicts from two SiteMetrics.
 */
export function deriveVerdicts(a: SiteMetrics, b: SiteMetrics): ComparisonVerdict {
  const faster = a.totalTime <= b.totalTime ? "A" : "B";
  const betterSEO = a.seoScore >= b.seoScore ? "A" : "B";
  const largerContent = a.contentSize >= b.contentSize ? "A" : "B";

  // "cleaner" = fewer scripts + all headings valid (single H1)
  const structureA = (a.h1Count === 1 ? 10 : 0) + Math.max(0, 10 - a.scriptCount);
  const structureB = (b.h1Count === 1 ? 10 : 0) + Math.max(0, 10 - b.scriptCount);
  const cleanerStructure = structureA >= structureB ? "A" : "B";

  return { faster, betterSEO, largerContent, cleanerStructure };
}
