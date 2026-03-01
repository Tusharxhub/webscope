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
  seoScore: number | null;
  wordCount: number | null;
  h1Count: number | null;
  h2Count: number | null;
  metaLength: number | null;
  titleLength: number | null;
  missingAltCount: number | null;
  createdAt: string;
}

export interface ScrapeResponse {
  success: boolean;
  data?: {
    requestLog: RequestLogEntry;
    scrapedData: ScrapedDataEntry;
    seoAnalysis?: SeoAnalysis;
  };
  error?: string;
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
