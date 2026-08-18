// GET /api/health
//
// Deployment smoke test: reports which required environment variables are
// missing and whether the database is reachable. Handy for confirming a fresh
// deploy is wired up correctly without digging through server logs.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isStripeConfigured, missingRequiredEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const missing = missingRequiredEnv();

  let database: "ok" | "unreachable" = "unreachable";
  let databaseError: string | undefined;

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "ok";
  } catch (error) {
    databaseError = error instanceof Error ? error.message : String(error);
  }

  const healthy = missing.length === 0 && database === "ok";

  return NextResponse.json(
    {
      status: healthy ? "ok" : "misconfigured",
      database,
      databaseError,
      missingEnv: missing,
      optional: {
        stripe: isStripeConfigured() ? "enabled" : "disabled",
        unsplash: process.env.UNSPLASH_API_KEY ? "enabled" : "disabled",
      },
    },
    { status: healthy ? 200 : 503 }
  );
}
