import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "@/lib/prisma";
import { isValidUrl } from "@/lib/validators";
import { ScrapeResponse } from "@/types";

export async function POST(req: NextRequest): Promise<NextResponse<ScrapeResponse>> {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || !isValidUrl(url)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid URL (http or https)" },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    let response;
    try {
      response = await axios.get(url, {
        timeout: 15000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; WebScope/1.0; +https://webscope.dev)",
        },
      });
    } catch (axiosError: unknown) {
      const statusCode =
        axios.isAxiosError(axiosError) && axiosError.response
          ? axiosError.response.status
          : 0;
      const responseTime = Date.now() - startTime;

      const requestLog = await prisma.requestLog.create({
        data: {
          url,
          method: "GET",
          statusCode,
          responseTime,
        },
      });

      const errorMessage =
        axios.isAxiosError(axiosError)
          ? axiosError.message
          : "Failed to fetch website";

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          data: {
            requestLog: {
              ...requestLog,
              createdAt: requestLog.createdAt.toISOString(),
            },
            scrapedData: {
              id: "",
              requestId: requestLog.id,
              title: "",
              content: null,
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

    // Extract title
    const title = $("title").first().text().trim() || "No title found";

    // Extract h2 headings
    const headings: string[] = [];
    $("h2").each((_, el) => {
      const text = $(el).text().trim();
      if (text) headings.push(text);
    });

    const content = headings.length > 0 ? headings.join(" | ") : null;

    // Save to database
    const requestLog = await prisma.requestLog.create({
      data: {
        url,
        method: "GET",
        statusCode: response.status,
        responseTime,
      },
    });

    const scrapedData = await prisma.scrapedData.create({
      data: {
        requestId: requestLog.id,
        title,
        content,
      },
    });

    // Try to emit via global socket (best effort)
    try {
      const { getIO } = await import("@/lib/socket");
      const io = getIO();
      if (io) {
        io.emit("new-log", {
          ...requestLog,
          createdAt: requestLog.createdAt.toISOString(),
        });
      }
    } catch {
      // Socket not initialized — ignore
    }

    return NextResponse.json({
      success: true,
      data: {
        requestLog: {
          ...requestLog,
          createdAt: requestLog.createdAt.toISOString(),
        },
        scrapedData: {
          ...scrapedData,
          createdAt: scrapedData.createdAt.toISOString(),
        },
      },
    });
  } catch (error: unknown) {
    console.error("Scrape error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
