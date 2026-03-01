import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import puppeteer from "puppeteer";
import { prisma } from "@/lib/prisma";
import { urlSchema } from "@/lib/validators";
import { authOptions } from "@/lib/auth";
import { ScrapeResponse } from "@/types";
import { existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { execSync } from "child_process";

function findChromePath(): string | undefined {
  // 1. Env override
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;

  // 2. Puppeteer cache under current user home
  const cached = join(homedir(), ".cache", "puppeteer");
  // Walk the cache dir for the chrome binary
  try {
    const result = execSync(`find "${cached}" -name chrome -type f 2>/dev/null | head -1`, { encoding: "utf-8" }).trim();
    if (result && existsSync(result)) return result;
  } catch {}

  // 3. Common system paths
  const systemPaths = [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  for (const p of systemPaths) {
    if (existsSync(p)) return p;
  }

  return undefined;
}

// Simple in-memory rate limiter per user
const lastRequest = new Map<string, number>();

// Max body text length stored in DB (characters)
const MAX_BODY_TEXT = 5000;

export async function POST(req: NextRequest): Promise<NextResponse<ScrapeResponse>> {
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Rate limit: 1 request per 3 seconds per user
    const now = Date.now();
    const last = lastRequest.get(userId) || 0;
    if (now - last < 3000) {
      return NextResponse.json(
        { success: false, error: "Please wait a moment before scraping again" },
        { status: 429 }
      );
    }
    lastRequest.set(userId, now);

    const body = await req.json();
    const parsed = urlSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Invalid URL";
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    const { url } = parsed.data;
    const startTime = Date.now();

    // ---- Puppeteer scrape ----
    const chromePath = findChromePath();
    browser = await puppeteer.launch({
      headless: true,
      ...(chromePath ? { executablePath: chromePath } : {}),
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.setViewport({ width: 1280, height: 800 });

    let statusCode = 0;
    page.on("response", (res) => {
      if (res.url() === url || res.url() === url + "/") {
        statusCode = res.status();
      }
    });

    try {
      const response = await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });
      if (response) statusCode = response.status();
    } catch (navError: unknown) {
      const responseTime = Date.now() - startTime;
      await browser.close();
      browser = null;

      const requestLog = await prisma.requestLog.create({
        data: { url, method: "GET", statusCode: statusCode || 0, responseTime, userId },
      });

      const errorMsg =
        navError instanceof Error ? navError.message : "Failed to load page";

      return NextResponse.json(
        {
          success: false,
          error: errorMsg,
          data: {
            requestLog: { ...requestLog, createdAt: requestLog.createdAt.toISOString() },
            scrapedData: {
              id: "",
              requestId: requestLog.id,
              title: "",
              headings: [],
              meta: null,
              bodyText: null,
              createdAt: new Date().toISOString(),
            },
          },
        },
        { status: 502 }
      );
    }

    // Extract data from the fully-rendered page
    const extractedData = await page.evaluate(() => {
      const title = document.title?.trim() || "No title found";

      const h1Elements = Array.from(document.querySelectorAll("h1"));
      const h2Elements = Array.from(document.querySelectorAll("h2"));
      const headings = [
        ...h1Elements.map((el) => `[H1] ${el.innerText.trim()}`),
        ...h2Elements.map((el) => `[H2] ${el.innerText.trim()}`),
      ].filter((h) => h.replace(/\[H[12]\]\s*/, "").length > 0);

      const metaTag = document.querySelector('meta[name="description"]');
      const meta = metaTag?.getAttribute("content")?.trim() || null;

      // Gather visible text content from the body
      const bodyText = document.body?.innerText?.trim() || null;

      return { title, headings, meta, bodyText };
    });

    const responseTime = Date.now() - startTime;

    await browser.close();
    browser = null;

    // Truncate body text to prevent oversized DB writes
    const bodyText = extractedData.bodyText
      ? extractedData.bodyText.substring(0, MAX_BODY_TEXT)
      : null;

    const requestLog = await prisma.requestLog.create({
      data: {
        url,
        method: "GET",
        statusCode: statusCode || 200,
        responseTime,
        userId,
      },
    });

    const scrapedData = await prisma.scrapedData.create({
      data: {
        requestId: requestLog.id,
        title: extractedData.title,
        headings: extractedData.headings,
        meta: extractedData.meta,
        bodyText,
      },
    });

    // Emit via socket (best effort)
    try {
      const { getIO } = await import("@/lib/socket");
      const io = getIO();
      if (io) {
        io.emit("new-log", {
          ...requestLog,
          createdAt: requestLog.createdAt.toISOString(),
          scrapedData: [{ ...scrapedData, createdAt: scrapedData.createdAt.toISOString() }],
        });
      }
    } catch { /* ignore */ }

    return NextResponse.json({
      success: true,
      data: {
        requestLog: { ...requestLog, createdAt: requestLog.createdAt.toISOString() },
        scrapedData: { ...scrapedData, createdAt: scrapedData.createdAt.toISOString() },
      },
    });
  } catch (error: unknown) {
    console.error("Scrape error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } finally {
    // Prevent memory leaks — always close browser
    if (browser) {
      try { await browser.close(); } catch { /* ignore */ }
    }
  }
}
