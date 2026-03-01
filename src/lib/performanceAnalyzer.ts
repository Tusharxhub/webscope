import { ScrapedPage } from "@/lib/scraper";

export interface PerformanceBreakdown {
  totalTime: number;
  serverTime: number;
  parseTime: number;
  contentSize: number;
  scriptCount: number;
  imageCount: number;
}

export function analyzePerformance(scraped: ScrapedPage): PerformanceBreakdown {
  return {
    totalTime: scraped.responseTime,
    serverTime: scraped.responseTime,
    parseTime: 0,
    contentSize: scraped.contentSize,
    scriptCount: scraped.scriptCount,
    imageCount: scraped.imageCount,
  };
}
