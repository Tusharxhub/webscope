import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "@/lib/prisma";
import { urlSchema } from "@/lib/validators";
import { authOptions } from "@/lib/auth";
import { ScrapeResponse } from "@/types";

// Simple in-memory rate limiter per user
const lastRequest = new Map<string, number>();

export async function POST(req: NextRequest): Promise<NextResponse<ScrapeResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Rate limit: 1 request per 2 seconds per user
    const now = Date.now();
    const last = lastRequest.get(userId) || 0;
    if (now - last < 2000) {
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

    let response;
    try {
      response = await axios.get(url, {
        timeout: 15000,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; WebScopePro/1.0)",
        },
      });
    } catch (axiosError: unknown) {
      const statusCode =
        axios.isAxiosError(axiosError) && axiosError.response
          ? axiosError.response.status
          : 0;
      const responseTime = Date.now() - startTime;

      const requestLog = await prisma.requestLog.create({
        data: { url, method: "GET", statusCode, responseTime, userId },
      });

      const errorMessage = axios.isAxiosError(axiosError)
        ? axiosError.message
        : "Failed to fetch website";

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          data: {
            requestLog: { ...requestLog, createdAt: requestLog.createdAt.toISOString() },
            scrapedData: {
              id: "",
              requestId: requestLog.id,
              title: "",
              headings: [],
              meta: null,
              createdAt: new Date().toISOString(),
            },
          },
        },
        { status: 502 }
      );
    }

    const responseTime = Date.now() - startTime;
    const html = response.data;
    const $ = cheerio.load(html);

    const title = $("title").first().text().trim() || "No title found";
    const headings: string[] = [];
    $("h2").each((_, el) => {
      const text = $(el).text().trim();
      if (text) headings.push(text);
    });
    const meta =
      $('meta[name="description"]').attr("content")?.trim() || null;

    const requestLog = await prisma.requestLog.create({
      data: { url, method: "GET", statusCode: response.status, responseTime, userId },
    });

    const scrapedData = await prisma.scrapedData.create({
      data: { requestId: requestLog.id, title, headings, meta },
    });

    // Emit via socket (best effort)
    try {
      const { getIO } = await import("@/lib/socket");
      const io = getIO();
      if (io) {
        io.emit("new-log", { ...requestLog, createdAt: requestLog.createdAt.toISOString() });
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
  }
}
