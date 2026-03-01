import type { PerformanceBreakdown } from "@/lib/performanceAnalyzer";
import type { AnimalSpiritResult } from "@/lib/animalSpirit";

export interface AnalysisSeoSummary {
  seoScore: number;
  metrics: {
    titleLength: number;
    metaLength: number;
    h1Count: number;
    h2Count: number;
    wordCount: number;
    missingAltCount: number;
  };
}

export interface AnalysisResult {
  ok: boolean;
  url: string;
  statusCode: number;
  errorType?: string;
  message?: string;
  seoAnalysis?: AnalysisSeoSummary;
  performance?: PerformanceBreakdown;
  animalSpirit?: AnimalSpiritResult;
}
