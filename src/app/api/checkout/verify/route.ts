import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getAuthSession } from "@/lib/api-auth";
import { client, db } from "@/lib/mongodb";
import { PRO_PLANS, type PlanKey } from "@/lib/plans";

/**
 * Confirms a Stripe Checkout Session after the buyer returns to
 * /payment/success. Per the spec this is where the payments record is
 * inserted (paymentStatus "paid", paidAt) and the user's plan is upgraded
 * to "pro". Falls back to 503 when Stripe isn't configured yet.
 */
export async function POST(req: Request) {
  try {
    const session = await getAuthSession(req);
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

    // Spec Step 6: session verification inserts the payment record and
    // upgrades the user. Idempotent — re-verifying the same session (page
    // refresh) must not create a duplicate record.
    const plan = PRO_PLANS[planKey];
    const existing = await db
      .collection("payments")
      .findOne({ stripeSessionId: sessionId });
    if (!existing) {
      await db.collection("payments").insertOne({
        userId: String(session.user.id ?? ""),
        userEmail: String(session.user.email ?? ""),
        userName: String(session.user.name ?? ""),
        userRole: String(session.user.role ?? "student"),
        planName: plan.name,
        amount: Number(checkout.amount_total ?? plan.amount),
        currency: String(checkout.currency ?? plan.currency),
        transactionId:
          typeof checkout.payment_intent === "string"
            ? checkout.payment_intent
            : sessionId,
        stripeSessionId: sessionId,
        paymentStatus: "paid",
        paidAt: new Date(),
      });
    }
    await db
      .collection("users")
      .updateOne(
        { email: String(session.user.email ?? "") },
        { $set: { plan: "pro", planUpgradedAt: new Date() } }
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
