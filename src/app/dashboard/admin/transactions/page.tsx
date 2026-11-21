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
  return `${symbol}${(cents / 100).toFixed(2)}`;
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
      .sort({ paidAt: -1 })
      .limit(100)
      .toArray(),
    db
      .collection("payments")
      .aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray(),
    db.collection("payments").countDocuments({ paymentStatus: { $ne: "paid" } }),
  ]);

  const payments = docs.map((doc) => ({
    id: String(doc._id),
    userEmail: String(doc.userEmail ?? ""),
    userName: String(doc.userName ?? "N/A"),
    userRole: String(doc.userRole ?? "user"),
    transactionId: String(doc.transactionId ?? doc.stripeSessionId ?? ""),
    planName: String(doc.planName ?? doc.plan ?? "Pro"),
    amount: Number(doc.amount ?? 0),
    currency: String(doc.currency ?? "usd"),
    status: String(doc.paymentStatus ?? doc.status ?? "paid"),
    paidAt:
      doc.paidAt instanceof Date
        ? doc.paidAt
        : doc.paymentDate instanceof Date
          ? doc.paymentDate
          : doc.createdAt instanceof Date
            ? doc.createdAt
            : new Date(),
  }));

  const revenueCents = Number(paidAgg[0]?.total ?? 0);
  const paidCount = payments.filter((p) => p.status === "paid").length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transaction Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Display all Stripe subscription payment records from the payments collection.
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
        <StatCard icon={CreditCard} label="Total Transactions" value={payments.length} />
        <StatCard icon={Banknote} label="Paid" value={paidCount} />
        <StatCard icon={Inbox} label="Pending / Other" value={pendingCount} />
      </div>

      <DashboardSection title="Payment Records">
        {payments.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="When users subscribe to Pro plans via Stripe Checkout, payment records will appear here."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-3.5">User Name</th>
                    <th scope="col" className="px-4 py-3.5">Email</th>
                    <th scope="col" className="px-4 py-3.5">Role</th>
                    <th scope="col" className="px-4 py-3.5">Plan Name</th>
                    <th scope="col" className="px-4 py-3.5">Amount</th>
                    <th scope="col" className="px-4 py-3.5">Transaction ID</th>
                    <th scope="col" className="px-4 py-3.5">Payment Date</th>
                    <th scope="col" className="px-4 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-foreground">{p.userName}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{p.userEmail}</td>
                      <td className="px-4 py-3.5">
                        <span className="capitalize font-medium text-xs px-2 py-0.5 rounded-full border border-border bg-muted">
                          {p.userRole}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-primary">{p.planName}</td>
                      <td className="px-4 py-3.5 font-bold tabular-nums">
                        {formatAmount(p.amount, p.currency)}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground max-w-[140px] truncate" title={p.transactionId}>
                        {p.transactionId || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                        {format(p.paidAt, "dd MMM yyyy, HH:mm")}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DashboardSection>
    </div>
  );
}
