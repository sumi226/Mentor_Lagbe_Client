import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, FileText, Send, UserRound } from "lucide-react";

import { getSessionUser } from "@/lib/session";
import { client, db } from "@/lib/mongodb";
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
  const raw = await db
    .collection("applications")
    .find({ studentId: user.id })
    .sort({ createdAt: -1 })
    .limit(25)
    .toArray();

  const applications = raw.map((doc) => ({
    id: String(doc._id),
    tuitionId: String(doc.tuitionId ?? ""),
    tuitionTitle: String(doc.tuitionTitle ?? ""),
    tutorName: String(doc.tutorName ?? ""),
    status: String(doc.status ?? "pending"),
    message: String(doc.message ?? ""),
    createdAt: doc.createdAt instanceof Date ? doc.createdAt : new Date(),
  }));

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    tutors: new Set(applications.map((a) => a.tutorName)).size,
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track the tuition applications you&apos;ve sent to tutors.
          </p>
        </div>
        <Button render={<Link href="/tuitions" />}>
          Browse Tuitions
          <ArrowRight className="size-4" />
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Send}
          label="Applications Sent"
          value={stats.total}
        />
        <StatCard
          icon={FileText}
          label="Awaiting Response"
          value={stats.pending}
          hint="Tutors typically reply within 24–48h"
        />
        <StatCard
          icon={UserRound}
          label="Tutors Contacted"
          value={stats.tutors}
        />
      </div>

      <DashboardSection title="My Applications">
        {applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Find a tuition you like and send your first application."
            action={
              <Button render={<Link href="/tuitions" />}>
                Browse Tuitions
                <ArrowRight className="size-4" />
              </Button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {applications.map((app) => (
              <li
                key={app.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{app.tuitionTitle}</p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    Tutor: {app.tutorName} · Applied{" "}
                    {formatDistanceToNow(app.createdAt, { addSuffix: true })}
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>
    </div>
  );
}
