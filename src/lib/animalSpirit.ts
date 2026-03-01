import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_MODEL = "gemini-1.5-flash";
const AI_TIMEOUT_MS = 6000;

export interface AnimalSpiritInput {
  title: string;
  seoScore: number;
  wordCount: number;
  totalTime: number;
  h1Count: number;
  h2Count: number;
}

export interface AnimalSpiritResult {
  animal: string;
  personality: string;
  insight: string;
}

let geminiClient: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(apiKey);
  }

  return geminiClient;
}

function sanitizeJsonText(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return raw.slice(firstBrace, lastBrace + 1).trim();
  }

  return raw.trim();
}

function isValidAnimalSpirit(obj: unknown): obj is AnimalSpiritResult {
  if (typeof obj !== "object" || obj === null) return false;

  const value = obj as Record<string, unknown>;
  return (
    typeof value.animal === "string" &&
    value.animal.trim().length > 0 &&
    typeof value.personality === "string" &&
    value.personality.trim().length > 0 &&
    typeof value.insight === "string" &&
    value.insight.trim().length > 0
  );
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Gemini request timeout")), timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export function getFallbackAnimalSpirit(data: AnimalSpiritInput): AnimalSpiritResult {
  const isFast = data.totalTime < 1200;
  const richContent = data.wordCount >= 600;
  const strongStructure = data.h1Count === 1 && data.h2Count >= 2;

  if (data.seoScore >= 85 && isFast && richContent && strongStructure) {
    return {
      animal: "Hawk",
      personality: "Precise and strategic",
      insight:
        "Strong SEO, fast delivery, and clear heading hierarchy signal a high-clarity site built for both users and search engines.",
    };
  }

  if (data.seoScore >= 70) {
    return {
      animal: "Wolf",
      personality: "Focused and adaptive",
      insight:
        "Good optimization and solid content depth show a site with dependable structure and room for further refinement.",
    };
  }

  if (data.seoScore >= 50) {
    return {
      animal: "Otter",
      personality: "Curious and developing",
      insight:
        "The foundation is promising, but improving content depth, heading consistency, and speed can significantly raise search performance.",
    };
  }

  return {
    animal: "Tortoise",
    personality: "Steady but under-optimized",
    insight:
      "The site has baseline structure, yet SEO fundamentals and page efficiency need stronger alignment to compete effectively.",
  };
}

export async function generateAnimalSpirit(data: AnimalSpiritInput): Promise<AnimalSpiritResult> {
  const client = getGeminiClient();
  if (!client) {
    return getFallbackAnimalSpirit(data);
  }

  try {
    const model = client.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = [
      "You are an SEO and web-performance analyst.",
      "Given the website metrics below, assign one professional 'Animal Spirit'.",
      "Return ONLY valid JSON with keys: animal, personality, insight.",
      "Constraints:",
      "- insight must be 2-3 sentences",
      "- tone must be creative but professional",
      "- do not include markdown or code fences",
      "Website metrics:",
      JSON.stringify(data),
      "Example format:",
      '{"animal":"Hawk","personality":"Sharp and focused","insight":"High SEO and efficient load times reflect a well-optimized structure."}',
    ].join("\n");

    const result = await withTimeout(model.generateContent(prompt), AI_TIMEOUT_MS);
    const raw = result.response.text();
    const parsed = JSON.parse(sanitizeJsonText(raw)) as unknown;

    if (!isValidAnimalSpirit(parsed)) {
      return getFallbackAnimalSpirit(data);
    }

    return {
      animal: parsed.animal.trim(),
      personality: parsed.personality.trim(),
      insight: parsed.insight.trim(),
    };
  } catch (error) {
    console.error("ANIMAL SPIRIT AI ERROR:", error);
    return getFallbackAnimalSpirit(data);
  }
}
