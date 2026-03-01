import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { compareSchema } from "@/lib/validators";
import { scrapeBothSites, deriveVerdicts } from "@/lib/compareService";
import { CompareResponse } from "@/types";

// Simple in-memory rate limiter per user
const lastCompare = new Map<string, number>();

// Allow up to 60 s on Vercel Pro / 10 s on Hobby
export const maxDuration = 60;

export async function POST(
  req: NextRequest
): Promise<NextResponse<CompareResponse>> {
  try {
    // ── Auth ──
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // ── Rate limit: 1 comparison per 5 seconds per user ──
    const now = Date.now();
    const last = lastCompare.get(userId) || 0;
    if (now - last < 5000) {
      return NextResponse.json(
        { success: false, error: "Please wait a moment before comparing again" },
        { status: 429 }
      );
    }
    lastCompare.set(userId, now);

    // ── Validate body ──
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const parsed = compareSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Invalid URLs";
      return NextResponse.json(
        { success: false, error: msg },
        { status: 400 }
      );
    }

    const { urlA, urlB } = parsed.data;

    // ── Scrape both sites in parallel (Axios + Cheerio, no Puppeteer) ──
    const { siteA, siteB } = await scrapeBothSites(urlA, urlB);

    const comparison = deriveVerdicts(siteA, siteB);

    // ── Persist for history ──
    try {
      await prisma.comparison.create({
        data: { userId, urlA, urlB },
      });
    } catch (dbError) {
      // Log but don't fail the response — scraping already succeeded
      console.error("COMPARE DB ERROR:", dbError);
    }

    return NextResponse.json({
      success: true,
      data: { siteA, siteB, comparison },
    });
  } catch (error: unknown) {
    console.error("COMPARE ERROR:", error);

    // Return a user-friendly message, never leak stack traces
    const message =
      error instanceof Error ? error.message : "Comparison failed";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
