import axios from "axios";
import * as cheerio from "cheerio";

export interface PageMetadata {
    url: string;
    title: string | null;
    metaDescription: string | null;
    metaKeywords: string | null;
    h1Count: number;
    h2Count: number;
    wordCount: number;
    canonicalTag: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    imageCount: number;
    scriptCount: number;
    responseTime: number;
}

export interface AnalyzeSitePagesResult {
    pages: PageMetadata[];
}

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const MAX_PAGES = 10;
const REQUEST_TIMEOUT = 5000;

function getBaseDomain(url: string): string | null {
    try {
        return new URL(url).hostname;
    } catch {
        return null;
    }
}

export async function analyzeSitePages(startUrl: string): Promise<PageMetadata[]> {
    const visited = new Set<string>();
    const pages: PageMetadata[] = [];
    const queue: string[] = [startUrl];

    const baseDomain = getBaseDomain(startUrl);
    if (!baseDomain) return [];

    while (queue.length > 0 && pages.length < MAX_PAGES) {
        const currentUrl = queue.shift()!;

        // Normalize url slightly
        const normalizedUrl = currentUrl.replace(/\/$/, "");

        if (visited.has(normalizedUrl)) continue;
        visited.add(normalizedUrl);

        try {
            const startTime = Date.now();
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

            let response;
            try {
                response = await axios.get(normalizedUrl, {
                    headers: {
                        "User-Agent": USER_AGENT,
                        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    },
                    timeout: REQUEST_TIMEOUT,
                    signal: controller.signal,
                    maxRedirects: 3,
                    validateStatus: (status) => status < 400,
                });
            } finally {
                clearTimeout(timeout);
            }

            const responseTime = Date.now() - startTime;
            const html = typeof response.data === "string" ? response.data : String(response.data);
            const $ = cheerio.load(html);

            // Extract basic metadata
            const title = $("title").first().text().trim() || null;
            const metaDescription = $('meta[name="description"]').attr("content")?.trim() || null;
            const metaKeywords = $('meta[name="keywords"]').attr("content")?.trim() || null;

            const canonicalTag = $('link[rel="canonical"]').attr("href")?.trim() || null;
            const ogTitle = $('meta[property="og:title"]').attr("content")?.trim() || null;
            const ogDescription = $('meta[property="og:description"]').attr("content")?.trim() || null;

            // Extract counts
            const h1Count = $("h1").length;
            const h2Count = $("h2").length;
            const imageCount = $("img").length;
            const scriptCount = $("script").length;

            // Extract word count
            $("script, style, noscript, nav, footer").remove();
            const bodyText = $("body").text().replace(/\s+/g, " ").trim();
            const wordCount = bodyText ? bodyText.split(" ").length : 0;

            pages.push({
                url: normalizedUrl,
                title,
                metaDescription,
                metaKeywords,
                h1Count,
                h2Count,
                wordCount,
                canonicalTag,
                ogTitle,
                ogDescription,
                imageCount,
                scriptCount,
                responseTime,
            });

            // Find internal links to continue crawling
            $("a").each((_, el) => {
                let href = $(el).attr("href");
                if (!href) return;

                href = href.trim();
                // Skip anchors, mailto, tel scripts
                if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return;

                try {
                    const absoluteUrl = new URL(href, normalizedUrl).href;
                    const absoluteUrlObj = new URL(absoluteUrl);

                    // Only crawl same domain
                    if (absoluteUrlObj.hostname === baseDomain) {
                        const cleanUrl = absoluteUrl.split("#")[0].replace(/\/$/, "");
                        if (!visited.has(cleanUrl) && !queue.includes(cleanUrl)) {
                            queue.push(cleanUrl);
                        }
                    }
                } catch {
                    // Ignore invalid URLs
                }
            });

        } catch (error) {
            console.error(`Failed to crawl ${normalizedUrl}:`, error);
        }
    }

    return pages;
}
