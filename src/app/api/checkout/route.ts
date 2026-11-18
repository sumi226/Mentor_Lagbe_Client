import { NextResponse } from "next/server";
import Stripe from "stripe";

import { auth } from "@/lib/auth";
import { client, db } from "@/lib/mongodb";
import { FREE_FEATURES, PRO_PLANS, type PlanKey } from "@/lib/plans";

/**
 * Creates a Stripe Checkout Session for a Pro subscription.
 *
 * Graceful fallback: when STRIPE_SECRET_KEY is not configured yet, responds
 * 503 with a friendly message the UI shows to the user instead of failing
 * silently. Add STRIPE_SECRET_KEY (and optionally STRIPE_PRICE_ID_STUDENT /
 * STRIPE_PRICE_ID_TUTOR) to .env.local to enable live payments.
 */
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: "unauthorized", message: "Please sign in to subscribe." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const planKey: PlanKey = body.plan === "tutor" ? "tutor" : "student";
    const plan = PRO_PLANS[planKey];

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json(
        {
          error: "stripe-not-configured",
          message:
            "Stripe payments aren't configured yet — add STRIPE_SECRET_KEY to .env.local to enable subscriptions.",
        },
        { status: 503 }
      );
    }

    const stripe = new Stripe(stripeKey);
    const priceId = process.env[plan.priceIdEnv];

    const origin =
      req.headers.get("origin") ??
      process.env.BETTER_AUTH_URL ??
      "http://localhost:3000";

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: session.user.email ?? undefined,
      client_reference_id: planKey,
      line_items: priceId
        ? [{ price: priceId, quantity: 1 }]
        : [
            {
              quantity: 1,
              price_data: {
                currency: plan.currency,
                unit_amount: plan.amount,
                recurring: { interval: "month" },
                product_data: {
                  name: `MentorLagbe ${plan.name}`,
                  description: plan.tagline,
                },
              },
            },
          ],
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment/cancel`,
      metadata: {
        plan: planKey,
        features: FREE_FEATURES[planKey].length + plan.features.length,
      },
    });

    // Record the transaction for the admin dashboard. It starts as "pending"
    // and is marked "paid" by /api/checkout/verify once Stripe confirms it.
    try {
      await client.connect();
      await db.collection("payments").insertOne({
        userId: String(session.user.id ?? ""),
        userEmail: String(session.user.email ?? ""),
        plan: planKey,
        planName: plan.name,
        amount: plan.amount,
        currency: plan.currency,
        status: "pending",
        stripeSessionId: checkout.id,
        createdAt: new Date(),
      });
    } catch (recordError) {
      console.error("[checkout] failed to record payment:", recordError);
    }

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("[checkout] failed to create session:", error);
    return NextResponse.json(
      { error: "checkout-failed", message: "Could not start checkout. Please try again." },
      { status: 502 }
    );
  }
}
