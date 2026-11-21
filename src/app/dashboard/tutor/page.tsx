import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  FilePlus,
  Inbox,
  Send,
  Users,
} from "lucide-react";

import { getSessionUser } from "@/lib/session";
import { client, db } from "@/lib/mongodb";
import { ApplicationReview } from "@/components/application-review";
import { TuitionActions } from "@/components/tuition-actions";
import { Button } from "@/components/ui/button";
import {
  DashboardSection,
  EmptyState,
  StatCard,
  StatusBadge,
} from "@/components/dashboard-ui";

export const metadata = { title: "Tutor Dashboard" };

const FREE_POST_LIMIT = 2;

export default async function TutorDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "tutor") redirect("/dashboard");

  await client.connect();

  const [tuitionDocs, planDoc] = await Promise.all([
    db
      .collection("tuitions")
      .find({ tutorEmail: user.email })
      .sort({ createdAt: -1 })
      .limit(25)
      .toArray(),
    db.collection("users").findOne({ email: user.email }),
  ]);

  const applicantDocs = await db
    .collection("applications")
    .find(
      tuitionDocs.length
        ? { tuitionId: { $in: tuitionDocs.map((t) => String(t._id)) } }
        : { tuitionId: { $in: [] } }
    )
    .sort({ appliedAt: -1 })
    .limit(30)
    .toArray();

  const tuitions = tuitionDocs.map((doc) => ({
    id: String(doc._id),
    title: String(doc.title ?? ""),
    subject: String(doc.subject ?? ""),
    classLevel: String(doc.classLevel ?? ""),
    mode: String(doc.mode ?? ""),
    location: String(doc.location ?? ""),
    monthlyFee: Number(doc.monthlyFee ?? 0),
    daysPerWeek: Number(doc.daysPerWeek ?? 3),
    description: String(doc.description ?? ""),
    approvalStatus: String(doc.approvalStatus ?? "pending"),
    isActive: Boolean(doc.isActive),
  }));

  const applicants = applicantDocs.map((doc) => ({
    id: String(doc._id),
    tuitionTitle: String(doc.tuitionTitle ?? ""),
    subject: String(doc.subject ?? ""),
    studentName: String(doc.studentName ?? ""),
    studentEmail: String(doc.studentEmail ?? ""),
    studentPhone: String(doc.studentPhone ?? doc.phone ?? ""),
    preferredSchedule: String(doc.preferredSchedule ?? ""),
    studentNote: String(doc.studentNote ?? doc.message ?? ""),
    status: String(doc.status ?? "pending"),
    appliedAt: doc.appliedAt instanceof Date ? doc.appliedAt : new Date(),
  }));

  const isPro = String(planDoc?.plan ?? "free") === "pro";
  const postsUsed = tuitions.filter(
    (t) => t.approvalStatus !== "rejected"
  ).length;

  const stats = {
    posted: tuitions.length,
    activeApproved: tuitions.filter((t) => t.approvalStatus === "approved" && t.isActive)
      .length,
    applicants: applicants.length,
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tutor Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of your tuition postings, student applicants and current plan.
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
              Upgrade to Pro ($15)
            </Button>
          )}
          <Button render={<Link href="/dashboard/tutor/post-tuition" />}>
            <FilePlus className="size-4" />
            Post a Tuition
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Send}
          label="Total Tuitions Posted"
          value={stats.posted}
          hint="All your posted batches"
        />
        <StatCard
          icon={CheckCircle2}
          label="Active/Approved Tuitions"
          value={stats.activeApproved}
          hint="Live on browse page"
        />
        <StatCard
          icon={Inbox}
          label="Total Applicants Received"
          value={stats.applicants}
          hint="Incoming student applications"
        />
        <StatCard
          icon={Crown}
          label="Current Plan"
          value={isPro ? "Pro" : "Free"}
          hint={
            isPro
              ? "Unlimited tuition posts & verified badge"
              : `${Math.min(postsUsed, FREE_POST_LIMIT)} of ${FREE_POST_LIMIT} posts used`
          }
        />
      </div>

      {!isPro && postsUsed >= FREE_POST_LIMIT ? (
        <p
          role="status"
          className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400"
        >
          You&apos;ve reached the Free plan limit of {FREE_POST_LIMIT} tuition
          posts.{" "}
          <Link
            href="/pricing"
            className="font-semibold underline underline-offset-4"
          >
            Upgrade to Pro Tutor
          </Link>{" "}
          for unlimited posts and verified badge.
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/tutor/post-tuition"
          className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <span className="flex items-center justify-between">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <FilePlus className="size-4 text-primary" aria-hidden="true" />
            </span>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </span>
          <p className="mt-3 font-semibold">Post a Tuition</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create a new tuition batch with ImgBB banner.
          </p>
        </Link>

        <Link
          href="/dashboard/tutor/my-tuitions"
          className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <span className="flex items-center justify-between">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Send className="size-4 text-primary" aria-hidden="true" />
            </span>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </span>
          <p className="mt-3 font-semibold">My Created Tuitions</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Full CRUD: Edit, Delete, Toggle Active/Closed.
          </p>
        </Link>

        <Link
          href="/dashboard/tutor/applicants"
          className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <span className="flex items-center justify-between">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Users className="size-4 text-primary" aria-hidden="true" />
            </span>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </span>
          <p className="mt-3 font-semibold">Manage Applicants</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Review student applicants and Accept or Reject.
          </p>
        </Link>
      </div>

      <DashboardSection
        title="Recent Tuitions"
        action={
          <Link
            href="/dashboard/tutor/my-tuitions"
            className="text-sm font-medium text-primary hover:underline"
          >
            Manage All ({tuitions.length})
          </Link>
        }
      >
        {tuitions.length === 0 ? (
          <EmptyState
            title="No batches posted yet"
            description="Post your first tuition batch — admins usually approve within 24–48 hours."
            action={
              <Button render={<Link href="/dashboard/tutor/post-tuition" />}>
                Post a Tuition
              </Button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {tuitions.slice(0, 4).map((tuition) => (
              <li
                key={tuition.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{tuition.title}</p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {tuition.subject} · {tuition.classLevel} ·{" "}
                      {tuition.mode} · ৳
                      {tuition.monthlyFee.toLocaleString("en-US")}/month
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusBadge status={tuition.approvalStatus} />
                      <span
                        className={
                          tuition.isActive
                            ? "inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                            : "inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"
                        }
                      >
                        {tuition.isActive ? "Open" : "Closed"}
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
                    </div>
                  </div>
                  <TuitionActions tuition={tuition} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>

      <DashboardSection
        title="Recent Applicants"
        action={
          <Link
            href="/dashboard/tutor/applicants"
            className="text-sm font-medium text-primary hover:underline"
          >
            View All ({applicants.length})
          </Link>
        }
      >
        {applicants.length === 0 ? (
          <EmptyState
            title="No applicants yet"
            description="Applications from students will appear here once your batches are live."
          />
        ) : (
          <ul className="space-y-3">
            {applicants.slice(0, 3).map((app) => (
              <li
                key={app.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {app.studentName}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        · applied to {app.tuitionTitle}
                      </span>
                    </p>
                    <a
                      href={`mailto:${app.studentEmail}`}
                      className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      {app.studentEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={app.status} />
                    <ApplicationReview id={app.id} status={app.status} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>
    </div>
  );
}
