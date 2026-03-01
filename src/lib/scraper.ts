import axios from "axios";
import * as cheerio from "cheerio";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/** Maximum time (ms) to wait for a single HTTP request. */
const REQUEST_TIMEOUT = 5000;

// ── Types ──

export interface ScrapedPage {
  url: string;
  statusCode: number;
  responseTime: number;
  title: string;
  headings: string[];
  meta: string | null;
  bodyText: string | null;
  h1Count: number;
  h2Count: number;
  scriptCount: number;
  imageCount: number;
  imagesWithoutAlt: number;
  contentSize: number;
}

// ── Public API ──

/**
 * Fetch and parse a URL using Axios + Cheerio.
 * Lightweight, works perfectly in Vercel serverless — no Puppeteer needed.
 * Includes AbortController timeout protection.
 */
export async function scrapeSite(url: string): Promise<ScrapedPage> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  const startTime = Date.now();

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      timeout: REQUEST_TIMEOUT,
      signal: controller.signal,
      maxRedirects: 5,
      // Accept any status — we'll report it rather than throw
      validateStatus: () => true,
    });

    const responseTime = Date.now() - startTime;
    const html: string = typeof response.data === "string" ? response.data : String(response.data);
    const $ = cheerio.load(html);

    // Title
    const title = $("title").first().text().trim();

    // Meta description
    const meta = $('meta[name="description"]').attr("content")?.trim() || null;

    // Headings
    const h1Elements = $("h1").toArray();
    const h2Elements = $("h2").toArray();
    const headings = [
      ...h1Elements.map((el) => `[H1] ${$(el).text().trim()}`),
      ...h2Elements.map((el) => `[H2] ${$(el).text().trim()}`),
    ].filter((h) => h.replace(/\[H[12]\]\s*/, "").length > 0);

    // Body text (strip scripts/styles first, then get text)
    $("script, style, noscript").remove();
    const bodyText = $("body").text().replace(/\s+/g, " ").trim() || null;

    // Script count (from original HTML before removal)
    const $original = cheerio.load(html);
    const scriptCount = $original("script").length;

    // Images
    const images = $("img").toArray();
    const imageCount = images.length;
    const imagesWithoutAlt = images.filter((img) => {
      const alt = $(img).attr("alt");
      return alt === undefined || alt.trim() === "";
    }).length;

    // Content size in bytes
    const contentSize = Buffer.byteLength(html, "utf-8");

    return {
      url,
      statusCode: response.status,
      responseTime,
      title,
      headings,
      meta,
      bodyText,
      h1Count: h1Elements.length,
      h2Count: h2Elements.length,
      scriptCount,
      imageCount,
      imagesWithoutAlt,
      contentSize,
    };
  } finally {
    clearTimeout(timeout);
  }
}
