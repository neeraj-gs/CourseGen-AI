import Stripe from "stripe";
import { env } from "./env";

let client: Stripe | null = null;

/**
 * Lazily-constructed Stripe client. Throws a readable error when the key is
 * missing — callers should gate on `isStripeConfigured()` first so the app
 * degrades to "subscriptions unavailable" rather than crashing.
 */
export function getStripe(): Stripe {
  if (!client) {
    const key = env.STRIPE_API_KEY;
    if (!key) {
      throw new Error(
        "Stripe is not configured. Set STRIPE_API_KEY and STRIPE_WEBHOOK_SECRET to enable subscriptions."
      );
    }
    client = new Stripe(key, {
      apiVersion: "2023-10-16",
      typescript: true,
    });
  }
  return client;
}
