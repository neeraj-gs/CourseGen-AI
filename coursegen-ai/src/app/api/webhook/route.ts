// POST /api/webhook — Stripe subscription lifecycle events.

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { env, isStripeConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";
// Signature verification needs the raw body, which only the Node runtime gives us.
export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return new NextResponse("Stripe is not configured", { status: 503 });
  }

  const stripe = getStripe();
  const body = await req.text();
  const signature = headers().get("Stripe-Signature");

  if (!signature) {
    return new NextResponse("Missing Stripe-Signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.userId;
      if (!userId) {
        return new NextResponse("Webhook Error: no user id", { status: 400 });
      }

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      const data = {
        userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      };

      // Upsert rather than create: Stripe retries webhooks, and a user who
      // cancels and resubscribes would otherwise hit a unique-constraint error.
      await prisma.userSubscription.upsert({
        where: { userId },
        create: data,
        update: data,
      });
    }

    if (event.type === "invoice.payment_succeeded") {
      // The object on an invoice event is an Invoice, not a Checkout Session.
      const invoice = event.data.object as Stripe.Invoice;
      if (!invoice.subscription) {
        return new NextResponse(null, { status: 200 });
      }

      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string
      );

      await prisma.userSubscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        },
      });
    }

    if (
      event.type === "customer.subscription.deleted" ||
      event.type === "customer.subscription.updated"
    ) {
      const subscription = event.data.object as Stripe.Subscription;

      await prisma.userSubscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          stripePriceId: subscription.items.data[0]?.price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        },
      });
    }
  } catch (error) {
    // Returning 500 asks Stripe to retry, which is what we want for a transient
    // database failure.
    console.error(`Failed handling Stripe event ${event.type}:`, error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
}
