import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // prisma+postgres:// URLs (Prisma Accelerate / local Prisma Postgres)
  // → use accelerateUrl, no adapter needed
  if (connectionString.startsWith("prisma+postgres://")) {
    return new PrismaClient({ accelerateUrl: connectionString });
  }

  // Standard postgresql:// URLs (Neon, Supabase, etc.)
  // → use the pg adapter with sslmode=require for serverless
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

/**
 * Lazy singleton Prisma client — created on first access,
 * not at module import time. This prevents build-time failures
 * when DATABASE_URL is unreachable (e.g. during `next build`).
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    return Reflect.get(globalForPrisma.prisma, prop);
  },
});
