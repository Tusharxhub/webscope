import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { compareSchema } from "@/lib/validators";
import { compareWebsites, deriveVerdicts } from "@/services/compareService";
import { CompareResponse } from "@/types";
import { classifyPrismaError, jsonApiError } from "@/lib/errorHandler";

// Simple in-memory rate limiter per user
const lastCompare = new Map<string, number>();

// Allow up to 60 s on Vercel Pro / 10 s on Hobby
export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(
  req: NextRequest
): Promise<NextResponse<CompareResponse>> {
  try {
    // ── Auth ──
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonApiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    let userId = session.user.id;
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      const sessionEmail = session.user.email;
      if (!sessionEmail) {
        return jsonApiError("UNAUTHORIZED", "Session is no longer valid. Please sign in again.", 401);
      }

      const userByEmail = await prisma.user.findUnique({
        where: { email: sessionEmail },
        select: { id: true },
      });

      if (!userByEmail) {
        return jsonApiError("UNAUTHORIZED", "Session is no longer valid. Please sign in again.", 401);
      }

      userId = userByEmail.id;
    }

    // ── Rate limit: 1 comparison per 5 seconds per user ──
    const now = Date.now();
    const last = lastCompare.get(userId) || 0;
    if (now - last < 5000) {
      return jsonApiError("VALIDATION", "Please wait a moment before comparing again", 429);
    }
    lastCompare.set(userId, now);

    // ── Validate body ──
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonApiError("VALIDATION", "Invalid JSON body", 400);
    }

    const parsed = compareSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Invalid URLs";
      return jsonApiError("VALIDATION", msg, 400);
    }

    const { urlA, urlB } = parsed.data;

    // ── Analyze both sites via centralized analysis service ──
    const { siteA, siteB } = await compareWebsites(urlA, urlB);

    const comparison = deriveVerdicts(siteA, siteB);

    // ── Persist for history ──
    try {
      await prisma.comparison.create({
        data: { userId, urlA, urlB },
        select: { id: true },
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
    const prismaError = classifyPrismaError(error);
    return NextResponse.json(
      {
        success: false,
        errorType: prismaError.type,
        message: prismaError.message,
        error: prismaError.message,
      },
      { status: prismaError.status }
    );
  }
}
