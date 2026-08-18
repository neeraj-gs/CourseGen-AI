// GET /api/stripe
//
// Returns a URL to send the user to: the billing portal if they already
// subscribe, otherwise a fresh Checkout session.

import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { getBaseUrl, isStripeConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          error:
            "Subscriptions are not enabled on this deployment. Set STRIPE_API_KEY and STRIPE_WEBHOOK_SECRET to turn them on.",
        },
        { status: 503 }
      );
    }

    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stripe = getStripe();
    // Resolved per request so preview deployments redirect back to themselves
    // rather than to whatever NEXTAUTH_URL was baked in.
    const settingsUrl = `${getBaseUrl()}/settings`;

    const userSubscription = await prisma.userSubscription.findUnique({
      where: { userId: session.user.id },
    });

    // Existing subscriber: send them to the portal to manage or cancel.
    if (userSubscription?.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: settingsUrl,
      });
      return NextResponse.json({ url: stripeSession.url });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: settingsUrl,
      cancel_url: settingsUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: session.user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: "CourseGenX-AI Pro",
              description: "Unlimited course generations",
            },
            unit_amount: 1000,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      // Read back by the webhook to attach the subscription to this user.
      metadata: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("Stripe session creation failed:", error);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
