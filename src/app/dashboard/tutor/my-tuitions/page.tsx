import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Plus, BookOpen, MapPin, Calendar, Clock, DollarSign } from "lucide-react";

import { getSessionUser } from "@/lib/session";
import { client, db } from "@/lib/mongodb";
import { TuitionActions } from "@/components/tuition-actions";
import { Button } from "@/components/ui/button";
import {
  DashboardSection,
  EmptyState,
  StatusBadge,
} from "@/components/dashboard-ui";

export const metadata = { title: "My Created Tuitions · Tutor Dashboard" };

export default async function MyTuitionsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "tutor") redirect("/dashboard");

  await client.connect();

  const tuitionDocs = await db
    .collection("tuitions")
    .find({ tutorEmail: user.email })
    .sort({ createdAt: -1 })
    .toArray();

  const tuitions = tuitionDocs.map((doc) => ({
    id: String(doc._id),
    title: String(doc.title ?? ""),
    subject: String(doc.subject ?? ""),
    classLevel: String(doc.classLevel ?? ""),
    mode: String(doc.mode ?? "Online"),
    location: String(doc.location ?? ""),
    monthlyFee: Number(doc.monthlyFee ?? 0),
    daysPerWeek: Number(doc.daysPerWeek ?? 3),
    description: String(doc.description ?? ""),
    bannerImage: String(doc.bannerImage ?? ""),
    approvalStatus: String(doc.approvalStatus ?? "pending"),
    isActive: Boolean(doc.isActive),
    createdAt: doc.createdAt instanceof Date ? doc.createdAt : new Date(),
  }));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Created Tuitions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Full management of all tuition batches you have created. Edit details, toggle active status, or delete listings.
          </p>
        </div>
        <Button render={<Link href="/dashboard/tutor/post-tuition" />}>
          <Plus className="size-4" />
          Post a Tuition
        </Button>
      </div>

      <div className="mt-6">
        {tuitions.length === 0 ? (
          <EmptyState
            title="No tuition posts yet"
            description="You haven't created any tuition batches yet. Post your first tuition batch to start getting students."
            action={
              <Button render={<Link href="/dashboard/tutor/post-tuition" />}>
                <Plus className="size-4" />
                Post New Tuition
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tuitions.map((t) => (
              <div
                key={t.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow transition-shadow"
              >
                {t.bannerImage ? (
                  <div className="relative h-40 w-full overflow-hidden bg-muted">
                    <Image
                      src={t.bannerImage}
                      alt={t.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-28 w-full bg-gradient-to-r from-primary/10 to-primary/5 flex items-center justify-center text-primary/40">
                    <BookOpen className="size-10" />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={t.approvalStatus} />
                    <span
                      className={
                        t.isActive
                          ? "inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                          : "inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
                      }
                    >
                      {t.isActive ? "Active (Open)" : "Closed"}
                    </span>
                  </div>

                  <h3 className="mt-3 font-bold text-base line-clamp-1">{t.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {t.description}
                  </p>

                  <div className="mt-4 space-y-1.5 text-xs text-muted-foreground border-t border-border/60 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <BookOpen className="size-3.5 text-primary" />
                        {t.subject} ({t.classLevel})
                      </span>
                      <span className="font-bold text-sm text-primary">
                        ৳{t.monthlyFee.toLocaleString("en-US")}/mo
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-3.5" />
                        {t.mode} {t.location ? `· ${t.location}` : ""}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        {t.daysPerWeek} days/wk
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-border/60 pt-3 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      {formatDistanceToNow(t.createdAt, { addSuffix: true })}
                    </span>
                    <TuitionActions tuition={t} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
