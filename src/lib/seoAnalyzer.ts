import { SeoAnalysis, SeoChecks, SeoMetrics } from "@/types";

/**
 * Raw data extracted from the page via Puppeteer's page.evaluate().
 * This is the shape returned by the browser context.
 */
export interface PageExtraction {
  title: string;
  meta: string | null;
  h1Count: number;
  h2Count: number;
  bodyText: string | null;
  totalImages: number;
  imagesWithoutAlt: number;
}

// ── Metric calculation ──

function computeMetrics(data: PageExtraction): SeoMetrics {
  const bodyText = data.bodyText ?? "";
  const wordCount = bodyText
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return {
    titleLength: data.title.length,
    metaLength: data.meta?.length ?? 0,
    h1Count: data.h1Count,
    h2Count: data.h2Count,
    wordCount,
    missingAltCount: data.imagesWithoutAlt,
  };
}

// ── Check evaluation ──

function evaluateChecks(metrics: SeoMetrics): SeoChecks {
  return {
    titleExists: metrics.titleLength > 0,
    titleLengthValid: metrics.titleLength >= 30 && metrics.titleLength <= 60,
    metaExists: metrics.metaLength > 0,
    metaLengthValid: metrics.metaLength >= 120 && metrics.metaLength <= 160,
    singleH1: metrics.h1Count === 1,
    hasH2: metrics.h2Count >= 1,
    sufficientWordCount: metrics.wordCount > 300,
    imagesHaveAlt: metrics.missingAltCount === 0,
  };
}

// ── Score calculation ──

function calculateScore(checks: SeoChecks): number {
  let score = 0;

  if (checks.titleExists) score += 15;
  if (checks.titleLengthValid) score += 10;

  if (checks.metaExists) score += 15;
  if (checks.metaLengthValid) score += 10;

  if (checks.singleH1) score += 15;
  if (checks.hasH2) score += 10;

  if (checks.sufficientWordCount) score += 15;

  if (checks.imagesHaveAlt) score += 10;

  return score;
}

// ── Public API ──

/**
 * Analyse a scraped page and return a structured SEO report.
 *
 * ```ts
 * const analysis = analyzeSeo({
 *   title: "My Page",
 *   meta: "A description of my page that is long enough to be valid.",
 *   h1Count: 1,
 *   h2Count: 3,
 *   bodyText: "...",
 *   totalImages: 4,
 *   imagesWithoutAlt: 0,
 * });
 * console.log(analysis.seoScore); // 0–100
 * ```
 */
export function analyzeSeo(data: PageExtraction): SeoAnalysis {
  const metrics = computeMetrics(data);
  const checks = evaluateChecks(metrics);
  const seoScore = calculateScore(checks);

  return { seoScore, checks, metrics };
}
