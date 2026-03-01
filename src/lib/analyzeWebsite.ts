import { checkRobotsTxt } from "@/lib/robotsChecker";
import { scrapeSite } from "@/lib/scraper";
import { analyzeSeo } from "@/lib/seoAnalyzer";
import { analyzePerformance, PerformanceBreakdown } from "@/lib/performanceAnalyzer";
import { generateAnimalSpirit, getFallbackAnimalSpirit, AnimalSpiritResult } from "@/lib/animalSpirit";
import { getErrorMessage, ErrorType, withTimeout } from "@/lib/errorHandler";
import { validateServerEnv } from "@/lib/env";

const SCRAPE_TIMEOUT_MS = 5000;
const AI_TIMEOUT_MS = 6000;
const MAX_CONCURRENT_ANALYSIS = 4;

let activeAnalyses = 0;
const analysisWaitQueue: Array<() => void> = [];

async function acquireSlot(): Promise<void> {
  if (activeAnalyses < MAX_CONCURRENT_ANALYSIS) {
    activeAnalyses += 1;
    return;
  }

  await new Promise<void>((resolve) => analysisWaitQueue.push(resolve));
  activeAnalyses += 1;
}

function releaseSlot(): void {
  activeAnalyses = Math.max(0, activeAnalyses - 1);
  const next = analysisWaitQueue.shift();
  if (next) next();
}

async function runLimited<T>(work: () => Promise<T>): Promise<T> {
  await acquireSlot();
  try {
    return await work();
  } finally {
    releaseSlot();
  }
}

export interface AnalysisResult {
  ok: boolean;
  url: string;
  statusCode: number;
  errorType?: ErrorType;
  message?: string;
  seoAnalysis?: ReturnType<typeof analyzeSeo>;
  performance?: PerformanceBreakdown;
  scraped?: Awaited<ReturnType<typeof scrapeSite>>;
  animalSpirit?: AnimalSpiritResult;
}

export async function analyzeWebsite(url: string): Promise<AnalysisResult> {
  validateServerEnv();

  try {
    const robotsCheck = await checkRobotsTxt(url);
    if (!robotsCheck.allowed) {
      return {
        ok: false,
        url,
        statusCode: 0,
        errorType: "DISALLOWED_BY_ROBOTS",
        message: robotsCheck.reason || "Scraping disallowed by robots.txt",
      };
    }

    const scraped = await runLimited(() =>
      withTimeout(
        scrapeSite(url),
        SCRAPE_TIMEOUT_MS,
        "Target website did not respond within scrape timeout"
      )
    );

    const seoAnalysis = analyzeSeo({
      title: scraped.title,
      meta: scraped.meta,
      h1Count: scraped.h1Count,
      h2Count: scraped.h2Count,
      bodyText: scraped.bodyText,
      totalImages: scraped.imageCount,
      imagesWithoutAlt: scraped.imagesWithoutAlt,
    });

    const performance = analyzePerformance(scraped);

    const fallbackAnimal = getFallbackAnimalSpirit({
      title: scraped.title || "Untitled page",
      seoScore: seoAnalysis.seoScore,
      wordCount: seoAnalysis.metrics.wordCount,
      totalTime: performance.totalTime,
      h1Count: scraped.h1Count,
      h2Count: scraped.h2Count,
    });

    let animalSpirit = fallbackAnimal;
    try {
      animalSpirit = await withTimeout(
        generateAnimalSpirit({
          title: scraped.title || "Untitled page",
          seoScore: seoAnalysis.seoScore,
          wordCount: seoAnalysis.metrics.wordCount,
          totalTime: performance.totalTime,
          h1Count: scraped.h1Count,
          h2Count: scraped.h2Count,
        }),
        AI_TIMEOUT_MS,
        "AI generation timed out"
      );
    } catch {
      animalSpirit = fallbackAnimal;
    }

    return {
      ok: true,
      url,
      statusCode: scraped.statusCode || 200,
      seoAnalysis,
      performance,
      scraped,
      animalSpirit,
    };
  } catch (error) {
    const message = getErrorMessage(error, "Website analysis failed");
    const lower = message.toLowerCase();

    let errorType: ErrorType = "UNKNOWN";
    if (lower.includes("timeout")) errorType = "TIMEOUT";
    else if (lower.includes("network") || lower.includes("fetch") || lower.includes("connect")) {
      errorType = "NETWORK";
    }

    return {
      ok: false,
      url,
      statusCode: 0,
      errorType,
      message,
    };
  }
}
