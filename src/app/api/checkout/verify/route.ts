import { NextResponse } from "next/server";
import Stripe from "stripe";

import { auth } from "@/lib/auth";
import { client, db } from "@/lib/mongodb";
import type { PlanKey } from "@/lib/plans";

/**
 * Confirms a Stripe Checkout Session after the buyer returns to
 * /payment/success: marks the recorded transaction as paid and upgrades the
 * user's plan to "pro". Falls back to 503 when Stripe isn't configured yet.
 */
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: "unauthorized", message: "Please sign in first." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const sessionId = String(body.sessionId ?? "");
    if (!sessionId.startsWith("cs_")) {
      return NextResponse.json(
        { error: "invalid-session", message: "Missing checkout session id." },
        { status: 400 }
      );
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json(
        { error: "stripe-not-configured", message: "Stripe payments aren't configured yet." },
        { status: 503 }
      );
    }

    const stripe = new Stripe(stripeKey);
    const checkout = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkout.payment_status !== "paid") {
      return NextResponse.json({
        ok: false,
        status: checkout.payment_status,
        message: "This payment hasn't completed yet.",
      });
    }

    const planKey: PlanKey =
      checkout.client_reference_id === "tutor" ||
      checkout.metadata?.plan === "tutor"
        ? "tutor"
        : "student";

    await client.connect();
    await db.collection("payments").updateOne(
      { stripeSessionId: sessionId },
      { $set: { status: "paid", paidAt: new Date() } }
    );
    await db
      .collection("user")
      .updateOne(
        { email: String(session.user.email ?? "") },
        { $set: { plan: planKey, planUpgradedAt: new Date() } }
      );

    return NextResponse.json({ ok: true, plan: planKey });
  } catch (error) {
    console.error("[checkout] failed to verify session:", error);
    return NextResponse.json(
      { error: "verify-failed", message: "Could not confirm the payment." },
      { status: 502 }
    );
  }
}
