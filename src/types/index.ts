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
  contentSize: number | null;
  scriptCount: number | null;
  imageCount: number | null;
  createdAt: string;
}

export type ScrapeErrorType =
  | "DISALLOWED_BY_ROBOTS"
  | "NETWORK"
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "TIMEOUT"
  | "DATABASE"
  | "UNKNOWN";

export interface ScrapeResponse {
  success: boolean;
  data?: {
    requestLog: RequestLogEntry;
    scrapedData: ScrapedDataEntry;
    seoAnalysis?: SeoAnalysis;
  };
  error?: string;
  message?: string;
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
  message?: string;
  errorType?: string;
}

export interface ComparisonHistoryEntry {
  id: string;
  urlA: string;
  urlB: string;
  createdAt: string;
}

export interface PageAnalysis {
  pageUrl: string;
  title: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  canonicalUrl: string | null;
  robotsMeta: string | null;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  h4Count: number;
  h5Count: number;
  h6Count: number;
  wordCount: number;
  paragraphCount: number;
  headingCount: number;
  textLength: number;
  contentSizeKb: number;
  imageCount: number;
  imagesWithoutAlt: number;
  videoCount: number;
  iframeCount: number;
  scriptCount: number;
  inlineScripts: number;
  externalScripts: number;
  internalLinks: number;
  externalLinks: number;
  brokenLinks: number;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  responseTime: number;
  htmlSize: number;
  requestCount: number;
  navElements: number;
  buttons: number;
  forms: number;
  inputs: number;
  tables: number;
  lists: number;
  sections: number;
  divCount: number;
}

export interface PageAnalysisRecord {
  id: string;
  siteUrl: string;
  pageUrl: string;
  title: string | null;
  metaDesc: string | null;
  metaKeywords: string | null;
  h1: number;
  h2: number;
  h3: number;
  wordCount: number;
  paragraphCount: number;
  imageCount: number;
  imagesWithoutAlt: number;
  scriptCount: number;
  internalLinks: number;
  externalLinks: number;
  buttons: number;
  forms: number;
  inputs: number;
  responseTime: number;
  htmlSize: number;
  createdAt: string;
}

// ── Scan History ──

export interface ScanPage {
  id: string;
  pageUrl: string;
  title: string | null;
  metaDesc: string | null;
  metaKeywords: string | null;
  canonicalTag: string | null;
  robotsMeta: string | null;
  // Headings
  h1Count: number;
  h2Count: number;
  h3Count: number;
  h4Count: number;
  h5Count: number;
  h6Count: number;
  headingCount: number;
  // Content
  wordCount: number;
  paragraphCount: number;
  sectionCount: number;
  divCount: number;
  textLength: number;
  contentSizeKb: number;
  // Media
  imageCount: number;
  imagesWithoutAlt: number;
  videoCount: number;
  iframeCount: number;
  // Interactive Elements
  buttonCount: number;
  formCount: number;
  inputCount: number;
  selectCount: number;
  textareaCount: number;
  navElements: number;
  tableCount: number;
  listCount: number;
  // Links
  internalLinks: number;
  externalLinks: number;
  brokenLinks: number;
  // Scripts
  scriptCount: number;
  inlineScripts: number;
  externalScripts: number;
  // Performance
  responseTime: number;
  htmlSize: number;
}

export interface ScanWithPages {
  id: string;
  url: string;
  seoScore: number;
  responseTime: number;
  animalSpirit: string | null;
  createdAt: string;
  pageCount: number;
  pages: ScanPage[];
}

export interface GroupedScans {
  date: string;
  scans: ScanWithPages[];
}

export * from "./analysis";
export * from "./api";
