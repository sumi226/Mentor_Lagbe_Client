import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ShieldCheck } from "lucide-react";

import { getSessionUser } from "@/lib/session";
import { client, db } from "@/lib/mongodb";
import { TuitionApproval } from "@/components/tuition-approval";
import {
  DashboardSection,
  EmptyState,
  StatusBadge,
} from "@/components/dashboard-ui";
import { cn } from "@/lib/utils";

export const metadata = { title: "Tuitions · Admin" };

type Filter = "all" | "pending" | "approved" | "rejected";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default async function AdminTuitionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "admin") redirect("/dashboard");

  const sp = await searchParams;
  const filter: Filter =
    sp.status === "pending" || sp.status === "approved" || sp.status === "rejected"
      ? sp.status
      : "all";

  await client.connect();
  const docs = await db
    .collection("tuitions")
    .find(filter === "all" ? {} : { approvalStatus: filter })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const tuitions = docs.map((doc) => ({
    id: String(doc._id),
    title: String(doc.title ?? ""),
    subject: String(doc.subject ?? ""),
    classLevel: String(doc.classLevel ?? ""),
    mode: String(doc.mode ?? ""),
    monthlyFee: Number(doc.monthlyFee ?? 0),
    tutorName: String(doc.tutorName ?? ""),
    tutorEmail: String(doc.tutorEmail ?? ""),
    approvalStatus: String(doc.approvalStatus ?? "pending"),
    isActive: Boolean(doc.isActive),
    createdAt:
      doc.createdAt instanceof Date ? doc.createdAt : new Date(),
  }));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Tuition Approval Flow</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Display and review all tuition posts submitted by tutors. Admin can Approve or Reject any listing.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Administrator
        </span>
      </div>

      <nav aria-label="Filter tuitions" className="mt-5 flex gap-1">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={
              f.key === "all"
                ? "/dashboard/admin/tuitions"
                : `/dashboard/admin/tuitions?status=${f.key}`
            }
            aria-current={filter === f.key ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filter === f.key
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <DashboardSection
        title={`${FILTERS.find((f) => f.key === filter)?.label} Listings`}
        action={
          <span className="text-sm text-muted-foreground">
            {tuitions.length} listing{tuitions.length === 1 ? "" : "s"}
          </span>
        }
      >
        {tuitions.length === 0 ? (
          <EmptyState
            title="Nothing here"
            description="No tuition listings match this filter."
          />
        ) : (
          <ul className="space-y-3">
            {tuitions.map((tuition) => (
              <li
                key={tuition.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{tuition.title}</p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {tuition.subject} · {tuition.classLevel} ·{" "}
                    {tuition.mode} · ৳
                    {tuition.monthlyFee.toLocaleString("en-US")}/month
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {tuition.tutorName} &lt;{tuition.tutorEmail}&gt; · posted{" "}
                    {formatDistanceToNow(tuition.createdAt, { addSuffix: true })}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={tuition.approvalStatus} />
                  <span
                    className={
                      tuition.isActive
                        ? "inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                        : "inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"
                    }
                  >
                    {tuition.isActive ? "Live" : "Not public"}
                  </span>
                  {tuition.approvalStatus === "approved" &&
                  tuition.isActive ? (
                    <Link
                      href={`/tuitions/${tuition.id}`}
                      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      View
                    </Link>
                  ) : null}
                  <TuitionApproval id={tuition.id} currentStatus={tuition.approvalStatus} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>
    </div>
  );
}
