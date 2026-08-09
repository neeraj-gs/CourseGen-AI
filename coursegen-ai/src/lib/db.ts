import { PrismaClient } from "@prisma/client";
import "server-only";

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient | undefined;
}

// In development Next.js hot-reloads modules, which would otherwise open a new
// pool of database connections on every edit until the database refuses them.
// Caching the client on `globalThis` survives reloads.
export const prisma =
  global.cachedPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.cachedPrisma = prisma;
}
