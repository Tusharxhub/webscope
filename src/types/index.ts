export interface ScrapeRequest {
  url: string;
}

export interface ScrapeResult {
  title: string;
  headings: string[];
}

export interface RequestLogEntry {
  id: string;
  url: string;
  method: string;
  statusCode: number;
  responseTime: number;
  createdAt: string;
}

export interface ScrapedDataEntry {
  id: string;
  requestId: string;
  title: string;
  content: string | null;
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
