import { z } from "zod";

const SAFE_PROTOCOLS = new Set(["http:", "https:"]);

export const urlSchema = z.object({
  url: z
    .string()
    .url("Please enter a valid URL")
    .refine(
      (val) => val.startsWith("http://") || val.startsWith("https://"),
      "URL must start with http:// or https://"
    ),
});

export const monitorSchema = z.object({
  url: z
    .string()
    .url("Please enter a valid URL")
    .refine(
      (val) => val.startsWith("http://") || val.startsWith("https://"),
      "URL must start with http:// or https://"
    ),
  seoThreshold: z.number().int().min(0).max(100),
  responseTimeThreshold: z.number().int().min(100).max(20000),
  checkIntervalMinutes: z.number().int().min(1).max(1440),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const compareSchema = z.object({
  urlA: z
    .string()
    .url("Please enter a valid URL for Site A")
    .refine(
      (val) => val.startsWith("http://") || val.startsWith("https://"),
      "URL must start with http:// or https://"
    ),
  urlB: z
    .string()
    .url("Please enter a valid URL for Site B")
    .refine(
      (val) => val.startsWith("http://") || val.startsWith("https://"),
      "URL must start with http:// or https://"
    ),
});

export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeHttpUrl(urlString: string): string {
  const url = new URL(urlString);
  if (!SAFE_PROTOCOLS.has(url.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are allowed");
  }

  url.hash = "";
  url.username = "";
  url.password = "";
  if (!url.pathname) {
    url.pathname = "/";
  }

  return url.toString();
}

export function assertSafePublicUrl(urlString: string): void {
  const url = new URL(urlString);
  const host = url.hostname.toLowerCase();

  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.endsWith(".local")
  ) {
    throw new Error("Local and loopback addresses are not allowed");
  }

  if (/^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) {
    throw new Error("Private network addresses are not allowed");
  }
}
