import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Banknote, CreditCard, Inbox, ShieldCheck } from "lucide-react";

import { getSessionUser } from "@/lib/session";
import { client, db } from "@/lib/mongodb";
import {
  DashboardSection,
  EmptyState,
  StatCard,
  StatusBadge,
} from "@/components/dashboard-ui";

export const metadata = { title: "Transactions · Admin" };

function formatAmount(cents: number, currency: string) {
  const symbol = currency === "usd" ? "$" : "";
  return `${symbol}${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

export default async function AdminTransactionsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "admin") redirect("/dashboard");

  await client.connect();

  const [docs, paidAgg, pendingCount] = await Promise.all([
    db
      .collection("payments")
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray(),
    db
      .collection("payments")
      .aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray(),
    db.collection("payments").countDocuments({ status: "pending" }),
  ]);

  const payments = docs.map((doc) => ({
    id: String(doc._id),
    userEmail: String(doc.userEmail ?? ""),
    planName: String(doc.planName ?? doc.plan ?? "Pro"),
    amount: Number(doc.amount ?? 0),
    currency: String(doc.currency ?? "usd"),
    status: String(doc.status ?? "pending"),
    createdAt:
      doc.createdAt instanceof Date ? doc.createdAt : new Date(),
  }));

  const revenueCents = Number(paidAgg[0]?.total ?? 0);
  const paidCount = payments.filter((p) => p.status === "paid").length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every Stripe payment on MentorLagbe, newest first.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Administrator
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Banknote}
          label="Total Stripe Revenue"
          value={`$${(revenueCents / 100).toFixed(2)}`}
          hint="Completed payments only"
        />
        <StatCard icon={CreditCard} label="Transactions" value={payments.length} />
        <StatCard icon={Banknote} label="Paid" value={paidCount} />
        <StatCard icon={Inbox} label="Pending" value={pendingCount} />
      </div>

      <DashboardSection title="Payment History">
        {payments.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Stripe isn't configured yet — add STRIPE_SECRET_KEY to .env.local, then completed checkouts will be recorded here."
          />
        ) : (
          <ul className="space-y-3">
            {payments.map((payment) => (
              <li
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{payment.planName}</p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {payment.userEmail} ·{" "}
                    {format(payment.createdAt, "dd MMM yyyy, HH:mm")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold tabular-nums">
                    {formatAmount(payment.amount, payment.currency)}
                  </span>
                  <StatusBadge status={payment.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>
    </div>
  );
}
