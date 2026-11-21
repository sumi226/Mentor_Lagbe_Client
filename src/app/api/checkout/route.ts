import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getAuthSession } from "@/lib/api-auth";
import { PRO_PLANS, type PlanKey } from "@/lib/plans";

/**
 * Creates a Stripe Checkout Session for a Pro subscription.
 */
export async function POST(req: Request) {
  try {
    const session = await getAuthSession(req);
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

    let checkout;
    try {
      checkout = await stripe.checkout.sessions.create({
        mode: "payment",
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
          userEmail: session.user.email ?? "",
          userId: session.user.id ?? "",
        },
      });
    } catch (createErr) {
      if (priceId) {
        console.warn("[checkout] priceId create failed, falling back to dynamic price_data:", createErr);
        checkout = await stripe.checkout.sessions.create({
          mode: "payment",
          customer_email: session.user.email ?? undefined,
          client_reference_id: planKey,
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: plan.currency,
                unit_amount: plan.amount,
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
            userEmail: session.user.email ?? "",
            userId: session.user.id ?? "",
          },
        });
      } else {
        throw createErr;
      }
    }

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("[checkout] failed to create session:", error);
    const message = error instanceof Error ? error.message : "Could not start checkout. Please try again.";
    return NextResponse.json(
      { error: "checkout-failed", message },
      { status: 502 }
    );
  }
}
