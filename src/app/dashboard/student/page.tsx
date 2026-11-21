import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  Send,
  Clock,
  Sparkles,
  Search,
} from "lucide-react";

import { getSessionUser } from "@/lib/session";
import { client, db } from "@/lib/mongodb";
import { ApplicationCancelButton } from "@/components/application-cancel-button";
import { Button } from "@/components/ui/button";
import {
  DashboardSection,
  EmptyState,
  StatCard,
  StatusBadge,
} from "@/components/dashboard-ui";

export const metadata = { title: "Student Dashboard" };

export default async function StudentDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "student") redirect("/dashboard");

  await client.connect();
  const [raw, planDoc] = await Promise.all([
    db
      .collection("applications")
      .find({ studentId: user.id })
      .sort({ appliedAt: -1 })
      .limit(50)
      .toArray(),
    db.collection("users").findOne({ email: user.email }),
  ]);

  const applications = raw.map((doc) => ({
    id: String(doc._id),
    tuitionId: String(doc.tuitionId ?? ""),
    tuitionTitle: String(doc.tuitionTitle ?? ""),
    tutorName: String(doc.tutorName ?? ""),
    status: String(doc.status ?? "pending"),
    studentNote: String(doc.studentNote ?? doc.message ?? ""),
    appliedAt: doc.appliedAt instanceof Date ? doc.appliedAt : new Date(),
  }));

  const isPro = String(planDoc?.plan ?? "free") === "pro";
  const plan = isPro ? "Pro" : "Free";

  const stats = {
    total: applications.length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    pending: applications.filter((a) => a.status === "pending").length,
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of your tuition applications, status tracking and current subscription.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isPro && (
            <Button
              variant="outline"
              className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
              render={<Link href="/pricing" />}
            >
              <Crown className="size-4 mr-1 text-amber-500" />
              Upgrade to Pro ($10)
            </Button>
          )}
          <Button render={<Link href="/tuitions" />}>
            <Search className="size-4" />
            Browse Tuitions
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Send}
          label="Total Applied Tuitions"
          value={stats.total}
          hint="All submitted applications"
        />
        <StatCard
          icon={CheckCircle2}
          label="Accepted Applications"
          value={stats.accepted}
          hint="Tutors ready to teach"
        />
        <StatCard
          icon={Clock}
          label="Pending Applications"
          value={stats.pending}
          hint="Awaiting tutor response"
        />
        <StatCard
          icon={Crown}
          label="Current Plan"
          value={plan}
          hint={
            plan === "Free"
              ? "Upgrade for priority booking"
              : "Priority booking unlocked"
          }
        />
      </div>

      <DashboardSection
        title="Recent Applications"
        action={
          <Link
            href="/dashboard/student/my-applications"
            className="text-sm font-medium text-primary flex items-center gap-1 hover:underline"
          >
            View All Applications
            <ArrowRight className="size-3.5" />
          </Link>
        }
      >
        {applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Find a tuition batch that matches your subjects and send your first application."
            action={
              <Button render={<Link href="/tuitions" />}>
                Browse Tuitions
                <ArrowRight className="size-4" />
              </Button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {applications.slice(0, 5).map((app) => (
              <li
                key={app.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{app.tuitionTitle}</p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    Tutor: {app.tutorName} · Applied{" "}
                    {formatDistanceToNow(app.appliedAt, { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={app.status} />
                  <Link
                    href={`/tuitions/${app.tuitionId}`}
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    View
                  </Link>
                  {app.status === "pending" ? (
                    <ApplicationCancelButton id={app.id} />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>
    </div>
  );
}
