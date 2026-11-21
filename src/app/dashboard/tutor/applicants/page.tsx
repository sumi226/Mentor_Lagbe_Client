import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Mail, Phone, Calendar, BookOpen, Clock } from "lucide-react";

import { getSessionUser } from "@/lib/session";
import { client, db } from "@/lib/mongodb";
import { ApplicationReview } from "@/components/application-review";
import {
  DashboardSection,
  EmptyState,
  StatusBadge,
} from "@/components/dashboard-ui";
import { cn } from "@/lib/utils";

export const metadata = { title: "Manage Applicants · Tutor Dashboard" };

type Filter = "all" | "pending" | "accepted" | "rejected";

export default async function TutorApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "tutor") redirect("/dashboard");

  const sp = await searchParams;
  const filter: Filter =
    sp.status === "pending" || sp.status === "accepted" || sp.status === "rejected"
      ? sp.status
      : "all";

  await client.connect();

  const tuitionDocs = await db
    .collection("tuitions")
    .find({ tutorEmail: user.email })
    .toArray();

  const tuitionIds = tuitionDocs.map((t) => String(t._id));

  const query: Record<string, unknown> = {
    tuitionId: { $in: tuitionIds.length ? tuitionIds : ["__none__"] },
  };

  if (filter !== "all") {
    query.status = filter;
  }

  const applicantDocs = await db
    .collection("applications")
    .find(query)
    .sort({ appliedAt: -1 })
    .toArray();

  const applicants = applicantDocs.map((doc) => ({
    id: String(doc._id),
    tuitionId: String(doc.tuitionId ?? ""),
    tuitionTitle: String(doc.tuitionTitle ?? ""),
    subject: String(doc.subject ?? ""),
    studentName: String(doc.studentName ?? "Student"),
    studentEmail: String(doc.studentEmail ?? ""),
    studentPhone: String(doc.studentPhone ?? doc.phone ?? ""),
    preferredSchedule: String(doc.preferredSchedule ?? ""),
    studentNote: String(doc.studentNote ?? doc.message ?? ""),
    status: String(doc.status ?? "pending"),
    appliedAt: doc.appliedAt instanceof Date ? doc.appliedAt : new Date(),
  }));

  const filters = [
    { key: "all", label: "All Applicants" },
    { key: "pending", label: "Pending" },
    { key: "accepted", label: "Accepted" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Applicants</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Display all students who applied to your tuition posts. Review their details and update application status to &apos;Accepted&apos; or &apos;Rejected&apos;.
          </p>
        </div>
      </div>

      <nav aria-label="Filter applicants" className="mt-5 flex gap-1">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={
              f.key === "all"
                ? "/dashboard/tutor/applicants"
                : `/dashboard/tutor/applicants?status=${f.key}`
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
        title={`${filter.charAt(0).toUpperCase() + filter.slice(1)} Applicants`}
        action={
          <span className="text-sm text-muted-foreground">
            {applicants.length} applicant{applicants.length === 1 ? "" : "s"}
          </span>
        }
      >
        {applicants.length === 0 ? (
          <EmptyState
            title="No applicants found"
            description="Student applications will appear here once students apply to your batches."
          />
        ) : (
          <ul className="space-y-4">
            {applicants.map((app) => (
              <li
                key={app.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{app.studentName}</h3>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground flex items-center gap-1.5">
                      <BookOpen className="size-3.5 text-primary" />
                      Applied to:{" "}
                      <span className="font-medium text-foreground">
                        {app.tuitionTitle}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <ApplicationReview id={app.id} status={app.status} />
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm border-t border-border/60 pt-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="size-4 text-primary" />
                    <span>Email:</span>
                    <a
                      href={`mailto:${app.studentEmail}`}
                      className="font-medium text-foreground hover:text-primary underline"
                    >
                      {app.studentEmail}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-4 text-primary" />
                    <span>Phone:</span>
                    {app.studentPhone ? (
                      <a
                        href={`tel:${app.studentPhone}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {app.studentPhone}
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic">Not provided</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="size-4 text-primary" />
                    <span>Preferred Schedule:</span>
                    <span className="font-medium text-foreground">
                      {app.preferredSchedule || "Flexible"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-4 text-primary" />
                    <span>Applied:</span>
                    <span className="font-medium text-foreground">
                      {formatDistanceToNow(app.appliedAt, { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {app.studentNote && (
                  <div className="mt-3 rounded-xl bg-muted/50 p-3 text-sm text-foreground">
                    <p className="font-medium text-xs text-muted-foreground uppercase mb-1">
                      Student Note:
                    </p>
                    <p className="whitespace-pre-wrap">{app.studentNote}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>
    </div>
  );
}
