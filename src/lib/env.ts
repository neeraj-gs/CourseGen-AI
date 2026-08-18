/**
 * Central access point for server-side environment variables.
 *
 * Every value is exposed through a getter so nothing is read at import time.
 * That matters because `next build` imports every module while collecting page
 * data — eager validation would make the build fail on machines that legitimately
 * have no secrets (CI, a fresh clone). Instead a missing variable throws a clear,
 * actionable error the first time a request actually needs it.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        `Add it to .env for local development, or to your hosting provider's ` +
        `environment settings. See .env.example for the full list.`
    );
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  get DATABASE_URL() {
    return required("DATABASE_URL");
  },
  get NEXTAUTH_SECRET() {
    return required("NEXTAUTH_SECRET");
  },
  get GOOGLE_CLIENT_ID() {
    return required("GOOGLE_CLIENT_ID");
  },
  get GOOGLE_CLIENT_SECRET() {
    return required("GOOGLE_CLIENT_SECRET");
  },
  get OPENAI_API_KEY() {
    return required("OPENAI_API_KEY");
  },
  get YOUTUBE_API_KEY() {
    return required("YOUTUBE_API_KEY");
  },

  /** Optional — course cards fall back to a bundled placeholder without it. */
  get UNSPLASH_API_KEY() {
    return optional("UNSPLASH_API_KEY");
  },
  /** Optional — the whole Pro/subscription flow is disabled without these. */
  get STRIPE_API_KEY() {
    return optional("STRIPE_API_KEY");
  },
  get STRIPE_WEBHOOK_SECRET() {
    return optional("STRIPE_WEBHOOK_SECRET");
  },

  get OPENAI_MODEL() {
    return optional("OPENAI_MODEL") ?? "gpt-4o-mini";
  },
} as const;

/** True when both Stripe secrets are present, so the UI can hide Pro upgrades. */
export function isStripeConfigured(): boolean {
  return Boolean(env.STRIPE_API_KEY && env.STRIPE_WEBHOOK_SECRET);
}

/**
 * The public origin of this deployment, used to build Stripe redirect URLs.
 * Prefers NEXTAUTH_URL, then Vercel's injected URL, then localhost.
 */
export function getBaseUrl(): string {
  const explicit = optional("NEXTAUTH_URL");
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = optional("VERCEL_URL");
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

/**
 * Names of required variables that are currently missing. Used by /api/health
 * so you can verify a deployment's configuration without reading server logs.
 */
export function missingRequiredEnv(): string[] {
  const names = [
    "DATABASE_URL",
    "NEXTAUTH_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "OPENAI_API_KEY",
    "YOUTUBE_API_KEY",
  ];
  return names.filter((n) => !process.env[n]);
}
