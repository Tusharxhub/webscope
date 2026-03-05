import axios from "axios";
import * as cheerio from "cheerio";
import type { PageAnalysis } from "@/types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const REQUEST_TIMEOUT = 5000;
const MAX_PAGES = 10;

interface PageAnalysisWithLinks {
  analysis: PageAnalysis;
  discoveredInternalLinks: string[];
}

function normalizeUrl(rawUrl: string, baseUrl?: string): string | null {
  try {
    const url = baseUrl ? new URL(rawUrl, baseUrl) : new URL(rawUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    url.hash = "";

    const normalizedPath = url.pathname.replace(/\/+$/, "") || "/";
    url.pathname = normalizedPath;

    return url.toString();
  } catch {
    return null;
  }
}

function getHostname(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function isAllowedHref(href: string): boolean {
  const trimmed = href.trim().toLowerCase();
  return !(
    trimmed.startsWith("#") ||
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  );
}

async function analyzePage(pageUrl: string, siteHost: string): Promise<PageAnalysisWithLinks | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  const startedAt = Date.now();

  try {
    const response = await axios.get(pageUrl, {
      timeout: REQUEST_TIMEOUT,
      signal: controller.signal,
      maxRedirects: 5,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      validateStatus: () => true,
    });

    const responseTime = Date.now() - startedAt;
    const html = typeof response.data === "string" ? response.data : String(response.data ?? "");
    const htmlSize = Buffer.byteLength(html, "utf-8");
    const contentSizeKb = Number((htmlSize / 1024).toFixed(2));

    const $ = cheerio.load(html);

    const title = $("title").first().text().trim() || null;
    const metaDescription = $('meta[name="description"]').attr("content")?.trim() || null;
    const metaKeywords = $('meta[name="keywords"]').attr("content")?.trim() || null;
    const canonicalUrl = $('link[rel="canonical"]').attr("href")?.trim() || null;
    const robotsMeta = $('meta[name="robots"]').attr("content")?.trim() || null;

    const ogTitle = $('meta[property="og:title"]').attr("content")?.trim() || null;
    const ogDescription = $('meta[property="og:description"]').attr("content")?.trim() || null;
    const ogImage = $('meta[property="og:image"]').attr("content")?.trim() || null;
    const twitterTitle = $('meta[name="twitter:title"]').attr("content")?.trim() || null;
    const twitterDescription =
      $('meta[name="twitter:description"]').attr("content")?.trim() || null;

    const h1Count = $("h1").length;
    const h2Count = $("h2").length;
    const h3Count = $("h3").length;
    const h4Count = $("h4").length;
    const h5Count = $("h5").length;
    const h6Count = $("h6").length;
    const headingCount = h1Count + h2Count + h3Count + h4Count + h5Count + h6Count;

    const paragraphCount = $("p").length;
    const navElements = $("nav").length;
    const buttons = $("button").length;
    const forms = $("form").length;
    const inputs = $("input").length;
    const tables = $("table").length;
    const lists = $("ul, ol").length;
    const sections = $("section").length;
    const divCount = $("div").length;

    const imageNodes = $("img").toArray();
    const imageCount = imageNodes.length;
    const imagesWithoutAlt = imageNodes.filter((img) => {
      const alt = $(img).attr("alt");
      return !alt || alt.trim().length === 0;
    }).length;

    const videoCount = $("video").length;
    const iframeCount = $("iframe").length;

    const scriptNodes = $("script").toArray();
    const scriptCount = scriptNodes.length;
    const externalScripts = scriptNodes.filter((s) => Boolean($(s).attr("src"))).length;
    const inlineScripts = scriptCount - externalScripts;

    const discoveredInternalLinks = new Set<string>();
    let internalLinks = 0;
    let externalLinks = 0;
    let brokenLinks = 0;

    $("a[href]").each((_, node) => {
      const href = ($(node).attr("href") || "").trim();
      if (!href) {
        brokenLinks += 1;
        return;
      }

      if (!isAllowedHref(href)) {
        return;
      }

      const normalized = normalizeUrl(href, pageUrl);
      if (!normalized) {
        brokenLinks += 1;
        return;
      }

      const linkHost = getHostname(normalized);
      if (!linkHost) {
        brokenLinks += 1;
        return;
      }

      if (linkHost === siteHost) {
        internalLinks += 1;
        discoveredInternalLinks.add(normalized);
      } else {
        externalLinks += 1;
      }
    });

    // Remove non-content nodes before text extraction.
    $("script, style, noscript").remove();
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    const textLength = bodyText.length;
    const wordCount = bodyText.length > 0 ? bodyText.split(" ").length : 0;

    return {
      analysis: {
        pageUrl,
        title,
        metaDescription,
        metaKeywords,
        canonicalUrl,
        robotsMeta,
        h1Count,
        h2Count,
        h3Count,
        h4Count,
        h5Count,
        h6Count,
        wordCount,
        paragraphCount,
        headingCount,
        textLength,
        contentSizeKb,
        imageCount,
        imagesWithoutAlt,
        videoCount,
        iframeCount,
        scriptCount,
        inlineScripts,
        externalScripts,
        internalLinks,
        externalLinks,
        brokenLinks,
        ogTitle,
        ogDescription,
        ogImage,
        twitterTitle,
        twitterDescription,
        responseTime,
        htmlSize,
        requestCount: 1,
        navElements,
        buttons,
        forms,
        inputs,
        tables,
        lists,
        sections,
        divCount,
      },
      discoveredInternalLinks: Array.from(discoveredInternalLinks),
    };
  } catch (error) {
    console.error(`Page analysis failed for ${pageUrl}:`, error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function crawlWebsite(url: string): Promise<PageAnalysis[]> {
  const startUrl = normalizeUrl(url);
  if (!startUrl) {
    return [];
  }

  const baseHost = getHostname(startUrl);
  if (!baseHost) {
    return [];
  }

  const queue: string[] = [startUrl];
  const visited = new Set<string>();
  const analyses: PageAnalysis[] = [];

  while (queue.length > 0 && analyses.length < MAX_PAGES) {
    const currentUrl = queue.shift();
    if (!currentUrl || visited.has(currentUrl)) {
      continue;
    }

    visited.add(currentUrl);

    const result = await analyzePage(currentUrl, baseHost);
    if (!result) {
      continue;
    }

    analyses.push(result.analysis);

    for (const link of result.discoveredInternalLinks) {
      if (!visited.has(link) && !queue.includes(link) && queue.length + analyses.length < MAX_PAGES * 3) {
        queue.push(link);
      }
    }
  }

  return analyses;
}
