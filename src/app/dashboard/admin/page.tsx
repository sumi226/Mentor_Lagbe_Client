import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  ClipboardList,
  Crown,
  CreditCard,
  FileText,
  ShieldCheck,
  Users,
} from "lucide-react";

import { getSessionUser } from "@/lib/session";
import { client, db } from "@/lib/mongodb";
import { TuitionApproval } from "@/components/tuition-approval";
import {
  DashboardSection,
  EmptyState,
  StatCard,
  StatusBadge,
} from "@/components/dashboard-ui";
import { cn } from "@/lib/utils";

export const metadata = { title: "Admin Dashboard" };

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "admin") redirect("/dashboard");

  await client.connect();

  const [
    pendingDocs,
    pendingCount,
    totalTuitions,
    approvedTuitions,
    totalUsers,
    totalTutors,
    revenueAgg,
    paymentsCount,
    recentDocs,
  ] = await Promise.all([
    db
      .collection("tuitions")
      .find({ approvalStatus: "pending" })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray(),
    db.collection("tuitions").countDocuments({ approvalStatus: "pending" }),
    db.collection("tuitions").countDocuments(),
    db.collection("tuitions").countDocuments({ approvalStatus: "approved" }),
    db.collection("users").countDocuments(),
    db.collection("users").countDocuments({ role: "tutor" }),
    db
      .collection("payments")
      .aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray(),
    db.collection("payments").countDocuments(),
    db
      .collection("applications")
      .find({})
      .sort({ appliedAt: -1 })
      .limit(6)
      .toArray(),
  ]);

  const revenueCents = Number(revenueAgg[0]?.total ?? 0);

  const pending = pendingDocs.map((doc) => ({
    id: String(doc._id),
    title: String(doc.title ?? ""),
    subject: String(doc.subject ?? ""),
    classLevel: String(doc.classLevel ?? ""),
    tutorName: String(doc.tutorName ?? ""),
    tutorEmail: String(doc.tutorEmail ?? ""),
    mode: String(doc.mode ?? ""),
    monthlyFee: Number(doc.monthlyFee ?? 0),
    approvalStatus: String(doc.approvalStatus ?? "pending"),
    createdAt: doc.createdAt instanceof Date ? doc.createdAt : new Date(),
  }));

  const recent = recentDocs.map((doc) => ({
    id: String(doc._id),
    tuitionTitle: String(doc.tuitionTitle ?? ""),
    studentName: String(doc.studentName ?? ""),
    tutorName: String(doc.tutorName ?? ""),
    status: String(doc.status ?? "pending"),
    appliedAt:
      doc.appliedAt instanceof Date
        ? doc.appliedAt
        : doc.createdAt instanceof Date
          ? doc.createdAt
          : new Date(),
  }));

  const subPages = [
    {
      href: "/dashboard/admin/users",
      title: "User Management",
      description: "Manage registered users & assign student/tutor/admin roles.",
      icon: Users,
    },
    {
      href: "/dashboard/admin/tuitions",
      title: "Admin Tuition Approvals",
      description: "Review all tuition listings — Approve or Reject any listing.",
      icon: ClipboardList,
    },
    {
      href: "/dashboard/admin/transactions",
      title: "Transaction Management",
      description: "Track all Stripe subscriptions and platform revenue.",
      icon: CreditCard,
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform statistics, user management, and pending tuition approvals.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Platform Administrator
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={totalUsers}
          hint="All registered accounts"
        />
        <StatCard
          icon={Crown}
          label="Total Tutors"
          value={totalTutors}
          hint="Registered tutor accounts"
        />
        <StatCard
          icon={FileText}
          label="Pending vs. Approved"
          value={`${pendingCount} / ${approvedTuitions}`}
          hint={`${pendingCount} pending, ${approvedTuitions} approved (of ${totalTuitions})`}
        />
        <StatCard
          icon={Banknote}
          label="Total Stripe Revenue"
          value={formatCents(revenueCents)}
          hint={`${paymentsCount} completed transactions`}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {subPages.map((sub) => {
          const Icon = sub.icon;
          return (
            <Link
              key={sub.href}
              href={sub.href}
              className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <span className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-4 text-primary" aria-hidden="true" />
                </span>
                <ArrowRight
                  className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                  aria-hidden="true"
                />
              </span>
              <p className="mt-3 font-semibold">{sub.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {sub.description}
              </p>
            </Link>
          );
        })}
      </div>

      <DashboardSection
        title="Pending Tuition Approvals"
        action={
          <Link
            href="/dashboard/admin/tuitions"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View All ({pendingCount})
          </Link>
        }
      >
        {pending.length === 0 ? (
          <EmptyState
            title="All caught up"
            description="There are no tuition batches waiting for approval."
          />
        ) : (
          <ul className="space-y-3">
            {pending.map((tuition) => (
              <li
                key={tuition.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{tuition.title}</p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {tuition.subject} · {tuition.classLevel} · {tuition.mode} ·
                    ৳{tuition.monthlyFee.toLocaleString("en-US")}/month
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {tuition.tutorName} &lt;{tuition.tutorEmail}&gt; · posted{" "}
                    {formatDistanceToNow(tuition.createdAt, { addSuffix: true })}
                  </p>
                </div>
                <TuitionApproval id={tuition.id} currentStatus={tuition.approvalStatus} />
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>

      <DashboardSection
        title="Recent Applications Across Platform"
        action={
          <span className="text-sm text-muted-foreground">
            Latest student inquiries
          </span>
        }
      >
        {recent.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Student applications will appear here as they come in."
          />
        ) : (
          <ul className="space-y-3">
            {recent.map((app) => (
              <li
                key={app.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {app.studentName} → {app.tutorName}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {app.tuitionTitle} ·{" "}
                    {formatDistanceToNow(app.appliedAt, { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={app.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>
    </div>
  );
}
