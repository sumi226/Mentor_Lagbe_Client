import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  ClipboardList,
  FileText,
  Inbox,
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

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "admin") redirect("/dashboard");

  await client.connect();

  const [pendingDocs, totalTuitions, applicationsCount, tutors, recentDocs] =
    await Promise.all([
      db
        .collection("tuitions")
        .find({ approvalStatus: "pending" })
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray(),
      db.collection("tuitions").countDocuments(),
      db.collection("applications").countDocuments(),
      db.collection("tuitions").distinct("tutorEmail"),
      db
        .collection("applications")
        .find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray(),
    ]);

  const pending = pendingDocs.map((doc) => ({
    id: String(doc._id),
    title: String(doc.title ?? ""),
    subject: String(doc.subject ?? ""),
    classLevel: String(doc.classLevel ?? ""),
    tutorName: String(doc.tutorName ?? ""),
    tutorEmail: String(doc.tutorEmail ?? ""),
    mode: String(doc.mode ?? ""),
    monthlyFee: Number(doc.monthlyFee ?? 0),
    createdAt:
      doc.createdAt instanceof Date ? doc.createdAt : new Date(),
  }));

  const recent = recentDocs.map((doc) => ({
    id: String(doc._id),
    tuitionTitle: String(doc.tuitionTitle ?? ""),
    studentName: String(doc.studentName ?? ""),
    tutorName: String(doc.tutorName ?? ""),
    status: String(doc.status ?? "pending"),
    createdAt:
      doc.createdAt instanceof Date ? doc.createdAt : new Date(),
  }));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Approve tuition listings and monitor platform activity.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Administrator
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          label="Total Listings"
          value={totalTuitions}
        />
        <StatCard
          icon={FileText}
          label="Pending Approvals"
          value={pending.length}
          hint="Awaiting your review"
        />
        <StatCard
          icon={Inbox}
          label="Applications"
          value={applicationsCount}
        />
        <StatCard icon={Users} label="Registered Tutors" value={tutors.length} />
      </div>

      <DashboardSection title="Pending Approvals">
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
                <TuitionApproval id={tuition.id} />
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>

      <DashboardSection title="Recent Applications">
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
                    {formatDistanceToNow(app.createdAt, { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={app.status} />
                  <CheckCircle2
                    className="size-4 text-muted-foreground/50"
                    aria-hidden="true"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>

      <p className="mt-8 text-sm text-muted-foreground">
        Browse the{" "}
        <Link
          href="/tuitions"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          public tuition listings
        </Link>{" "}
        to see what students view after approval.
      </p>
    </div>
  );
}
