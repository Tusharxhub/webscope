import { z } from "zod";

export const urlSchema = z.object({
  url: z
    .string()
    .url("Please enter a valid URL")
    .refine(
      (val) => val.startsWith("http://") || val.startsWith("https://"),
      "URL must start with http:// or https://"
    ),
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
