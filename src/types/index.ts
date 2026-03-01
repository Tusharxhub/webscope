export interface ScrapeRequest {
  url: string;
}

export interface ScrapeResult {
  title: string;
  headings: string[];
  meta: string | null;
  bodyText: string | null;
}

// ── SEO Analysis ──

export interface SeoChecks {
  titleExists: boolean;
  titleLengthValid: boolean;
  metaExists: boolean;
  metaLengthValid: boolean;
  singleH1: boolean;
  hasH2: boolean;
  sufficientWordCount: boolean;
  imagesHaveAlt: boolean;
}

export interface SeoMetrics {
  titleLength: number;
  metaLength: number;
  h1Count: number;
  h2Count: number;
  wordCount: number;
  missingAltCount: number;
}

export interface SeoAnalysis {
  seoScore: number;
  checks: SeoChecks;
  metrics: SeoMetrics;
}

export interface AnimalSpiritData {
  animal: string;
  personality: string;
  insight: string;
}

// ── Data Entries ──

export interface RequestLogEntry {
  id: string;
  url: string;
  method: string;
  statusCode: number;
  responseTime: number;
  userId: string;
  createdAt: string;
  scrapedData?: ScrapedDataEntry[];
}

export interface ScrapedDataEntry {
  id: string;
  requestId: string;
  title: string;
  headings: string[];
  meta: string | null;
  bodyText: string | null;
  animalSpirit: string | null;
  animalType: string | null;
  seoScore: number | null;
  wordCount: number | null;
  h1Count: number | null;
  h2Count: number | null;
  metaLength: number | null;
  titleLength: number | null;
  missingAltCount: number | null;
  createdAt: string;
}

export type ScrapeErrorType = "DISALLOWED_BY_ROBOTS" | "NETWORK" | "VALIDATION" | "UNKNOWN";

export interface ScrapeResponse {
  success: boolean;
  data?: {
    requestLog: RequestLogEntry;
    scrapedData: ScrapedDataEntry;
    seoAnalysis?: SeoAnalysis;
  };
  error?: string;
  /** Machine-readable error category (present when success is false). */
  errorType?: ScrapeErrorType;
  /** HTTP status code from the target site (0 if request was blocked before fetch). */
  statusCode?: number;
}

export interface StatsData {
  totalRequests: number;
  avgResponseTime: number;
  successRate: number;
}

export interface PaginatedLogs {
  logs: RequestLogEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Comparison ──

export interface SiteMetrics {
  url: string;
  seoScore: number;
  totalTime: number;
  serverTime: number;
  parseTime: number;
  wordCount: number;
  h1Count: number;
  h2Count: number;
  contentSize: number;
  scriptCount: number;
  imageCount: number;
}

export interface ComparisonVerdict {
  faster: "A" | "B";
  betterSEO: "A" | "B";
  largerContent: "A" | "B";
  cleanerStructure: "A" | "B";
}

export interface ComparisonResult {
  siteA: SiteMetrics;
  siteB: SiteMetrics;
  comparison: ComparisonVerdict;
}

export interface CompareResponse {
  success: boolean;
  data?: ComparisonResult;
  error?: string;
}

export interface ComparisonHistoryEntry {
  id: string;
  urlA: string;
  urlB: string;
  createdAt: string;
}
