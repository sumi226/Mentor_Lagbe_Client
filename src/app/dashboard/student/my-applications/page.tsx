import Link from "next/link";
import { redirect } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowRight, BookOpen, Clock, Mail, Search } from "lucide-react";

import { getSessionUser } from "@/lib/session";
import { client, db } from "@/lib/mongodb";
import { ApplicationCancelButton } from "@/components/application-cancel-button";
import { Button } from "@/components/ui/button";
import {
  DashboardSection,
  EmptyState,
  StatusBadge,
} from "@/components/dashboard-ui";
import { cn } from "@/lib/utils";

export const metadata = { title: "My Applications · Student Dashboard" };

type Filter = "all" | "pending" | "accepted" | "rejected";

export default async function MyApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "student") redirect("/dashboard");

  const sp = await searchParams;
  const filter: Filter =
    sp.status === "pending" || sp.status === "accepted" || sp.status === "rejected"
      ? sp.status
      : "all";

  await client.connect();

  const query: Record<string, unknown> = { studentId: user.id };
  if (filter !== "all") {
    query.status = filter;
  }

  const rawDocs = await db
    .collection("applications")
    .find(query)
    .sort({ appliedAt: -1 })
    .toArray();

  const applications = rawDocs.map((doc) => ({
    id: String(doc._id),
    tuitionId: String(doc.tuitionId ?? ""),
    tuitionTitle: String(doc.tuitionTitle ?? "Untitled Tuition"),
    subject: String(doc.subject ?? ""),
    tutorName: String(doc.tutorName ?? "Tutor"),
    tutorEmail: String(doc.tutorEmail ?? ""),
    monthlyFee: Number(doc.monthlyFee ?? 0),
    status: String(doc.status ?? "pending"),
    appliedAt:
      doc.appliedAt instanceof Date
        ? doc.appliedAt
        : doc.createdAt instanceof Date
          ? doc.createdAt
          : new Date(),
    studentNote: String(doc.studentNote ?? doc.message ?? ""),
    preferredSchedule: String(doc.preferredSchedule ?? ""),
  }));

  const filters = [
    { key: "all", label: "All Applications" },
    { key: "pending", label: "Pending" },
    { key: "accepted", label: "Accepted" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Display of all tuitions you have applied for. You can cancel or delete an application while it is still pending.
          </p>
        </div>
        <Button render={<Link href="/tuitions" />}>
          <Search className="size-4" />
          Find More Tuitions
        </Button>
      </div>

      <nav aria-label="Filter applications" className="mt-5 flex gap-1">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={
              f.key === "all"
                ? "/dashboard/student/my-applications"
                : `/dashboard/student/my-applications?status=${f.key}`
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
        title={`${filter.charAt(0).toUpperCase() + filter.slice(1)} Applications`}
        action={
          <span className="text-sm text-muted-foreground">
            {applications.length} application{applications.length === 1 ? "" : "s"}
          </span>
        }
      >
        {applications.length === 0 ? (
          <EmptyState
            title="No applications found"
            description="You haven't submitted any applications under this filter."
            action={
              <Button render={<Link href="/tuitions" />}>
                Browse Tuitions
                <ArrowRight className="size-4" />
              </Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-3.5">Tuition Title</th>
                    <th scope="col" className="px-4 py-3.5">Tutor Name & Email</th>
                    <th scope="col" className="px-4 py-3.5">Monthly Fee</th>
                    <th scope="col" className="px-4 py-3.5">Applied Date</th>
                    <th scope="col" className="px-4 py-3.5">Status</th>
                    <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3.5 font-medium">
                        <Link
                          href={`/tuitions/${app.tuitionId}`}
                          className="font-semibold text-primary hover:underline line-clamp-1"
                        >
                          {app.tuitionTitle}
                        </Link>
                        {app.subject && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <BookOpen className="size-3" />
                            {app.subject}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-foreground">{app.tutorName}</p>
                        {app.tutorEmail && (
                          <a
                            href={`mailto:${app.tutorEmail}`}
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-0.5"
                          >
                            <Mail className="size-3" />
                            {app.tutorEmail}
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-bold tabular-nums">
                        ৳{app.monthlyFee.toLocaleString("en-US")}
                        <span className="text-xs font-normal text-muted-foreground">/mo</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                        <div title={format(app.appliedAt, "dd MMM yyyy, HH:mm")}>
                          {format(app.appliedAt, "dd MMM yyyy")}
                        </div>
                        <div className="text-[11px] text-muted-foreground/80">
                          {formatDistanceToNow(app.appliedAt, { addSuffix: true })}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/tuitions/${app.tuitionId}`}
                            className="text-xs font-medium text-primary hover:underline px-2 py-1 rounded hover:bg-primary/5"
                          >
                            View
                          </Link>
                          {app.status === "pending" ? (
                            <ApplicationCancelButton id={app.id} />
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Finalized</span>
                          )}
                        </div>
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
