export interface ScrapeRequest {
  url: string;
}

export interface ScrapeResult {
  title: string;
  headings: string[];
  meta: string | null;
}

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
  createdAt: string;
}

export interface ScrapeResponse {
  success: boolean;
  data?: {
    requestLog: RequestLogEntry;
    scrapedData: ScrapedDataEntry;
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
