import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { client, db } from "@/lib/mongodb";
import { PRO_PLANS, type PlanKey } from "@/lib/plans";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: import("stripe").default.Event;

  try {
    const rawBody = await req.text();
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      event = JSON.parse(rawBody) as import("stripe").default.Event;
    }
  } catch (err) {
    console.error("[stripe-webhook] signature error:", err);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as import("stripe").default.Checkout.Session;
    if (session.payment_status === "paid") {
      const planKey: PlanKey =
        session.client_reference_id === "tutor" ||
        session.metadata?.plan === "tutor"
          ? "tutor"
          : "student";

      const userEmail = session.customer_email || session.metadata?.userEmail;
      const plan = PRO_PLANS[planKey];

      try {
        await client.connect();

        const userDoc = userEmail
          ? await db.collection("users").findOne({ email: userEmail })
          : null;

        const sessionId = session.id;
        const existing = await db
          .collection("payments")
          .findOne({ stripeSessionId: sessionId });

        if (!existing) {
          await db.collection("payments").insertOne({
            userId: userDoc ? String(userDoc._id) : "",
            userEmail: userEmail || "",
            userName: userDoc?.name || session.customer_details?.name || "Subscriber",
            userRole: userDoc?.role || planKey,
            planName: plan.name,
            amount: Number(session.amount_total ?? plan.amount),
            currency: String(session.currency ?? plan.currency),
            transactionId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : sessionId,
            stripeSessionId: sessionId,
            paymentStatus: "paid",
            paidAt: new Date(),
          });
        }

        if (userEmail) {
          await db.collection("users").updateOne(
            { email: userEmail },
            { $set: { plan: "pro", planUpgradedAt: new Date() } }
          );
        }
      } catch (dbErr) {
        console.error("[stripe-webhook] database error:", dbErr);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
