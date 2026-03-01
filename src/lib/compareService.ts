import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { analyzeSeo, PageExtraction } from "@/lib/seoAnalyzer";
import { SiteMetrics, ComparisonVerdict } from "@/types";

/**
 * Scrape a single URL and return a SiteMetrics object.
 * Reuses the existing seoAnalyzer for scoring.
 */
export async function scrapeSiteMetrics(url: string): Promise<SiteMetrics> {
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1280, height: 800 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    const startTime = Date.now();

    // Track timing phases
    let serverTime = 0;

    page.on("response", (res) => {
      if (res.url() === url || res.url() === url + "/") {
        serverTime = Date.now() - startTime;
      }
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    const totalTime = Date.now() - startTime;
    const parseTime = totalTime - serverTime;

    // Extract page data
    const extracted = await page.evaluate(() => {
      const title = document.title?.trim() || "";
      const metaTag = document.querySelector('meta[name="description"]');
      const meta = metaTag?.getAttribute("content")?.trim() || null;
      const bodyText = document.body?.innerText?.trim() || null;

      const h1Count = document.querySelectorAll("h1").length;
      const h2Count = document.querySelectorAll("h2").length;
      const scriptCount = document.querySelectorAll("script").length;

      const images = Array.from(document.querySelectorAll("img"));
      const imageCount = images.length;
      const imagesWithoutAlt = images.filter((img) => {
        const alt = img.getAttribute("alt");
        return alt === null || alt.trim() === "";
      }).length;

      // Approximate content size (bytes)
      const contentSize = new Blob([document.documentElement.outerHTML]).size;

      return {
        title,
        meta,
        bodyText,
        h1Count,
        h2Count,
        scriptCount,
        imageCount,
        imagesWithoutAlt,
        contentSize,
      };
    });

    await browser.close();
    browser = null;

    // SEO analysis
    const pageExtraction: PageExtraction = {
      title: extracted.title,
      meta: extracted.meta,
      h1Count: extracted.h1Count,
      h2Count: extracted.h2Count,
      bodyText: extracted.bodyText,
      totalImages: extracted.imageCount,
      imagesWithoutAlt: extracted.imagesWithoutAlt,
    };
    const seo = analyzeSeo(pageExtraction);

    return {
      url,
      seoScore: seo.seoScore,
      totalTime,
      serverTime,
      parseTime,
      wordCount: seo.metrics.wordCount,
      h1Count: extracted.h1Count,
      h2Count: extracted.h2Count,
      contentSize: extracted.contentSize,
      scriptCount: extracted.scriptCount,
      imageCount: extracted.imageCount,
    };
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        /* ignore */
      }
    }
  }
}

/**
 * Derive comparison verdicts from two SiteMetrics.
 */
export function deriveVerdicts(a: SiteMetrics, b: SiteMetrics): ComparisonVerdict {
  const faster = a.totalTime <= b.totalTime ? "A" : "B";
  const betterSEO = a.seoScore >= b.seoScore ? "A" : "B";
  const largerContent = a.contentSize >= b.contentSize ? "A" : "B";

  // "cleaner" = fewer scripts + all headings valid (single H1)
  const structureA = (a.h1Count === 1 ? 10 : 0) + Math.max(0, 10 - a.scriptCount);
  const structureB = (b.h1Count === 1 ? 10 : 0) + Math.max(0, 10 - b.scriptCount);
  const cleanerStructure = structureA >= structureB ? "A" : "B";

  return { faster, betterSEO, largerContent, cleanerStructure };
}
