import { NextResponse } from "next/server";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe";
import { getAuthSession } from "@/lib/api-auth";
import { PRO_PLANS, type PlanKey } from "@/lib/plans";

/**
 * Creates a Stripe Checkout Session for a Pro subscription (one-time payment mode).
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
    const priceId = STRIPE_PRICE_IDS[planKey] || process.env[plan.priceIdEnv];

    const origin =
      req.headers.get("origin") ??
      (process.env.BETTER_AUTH_URL && !process.env.BETTER_AUTH_URL.includes("localhost")
        ? process.env.BETTER_AUTH_URL
        : null) ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : null) ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
      (process.env.NODE_ENV === "production"
        ? "https://mentor-lagbe-client-nine.vercel.app"
        : "http://localhost:3000");

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
