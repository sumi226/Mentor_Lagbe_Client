import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CalendarRange,
  Mail,
  MapPin,
  Monitor,
  School,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";

import { ApplyTuitionButton } from "@/components/apply-tuition-button";
import { TuitionCard } from "@/components/tuition-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSessionUser } from "@/lib/session";
import { getSimilarTuitions, getTuitionById } from "@/lib/tuitions";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const tuition = await getTuitionById(id);
  if (!tuition) return { title: "Tuition Not Found" };
  return {
    title: tuition.title,
    description: tuition.description.slice(0, 160),
  };
}

function MetaChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof School;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2">
      <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
      <span className="min-w-0">
        <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="block truncate text-sm font-semibold">{value}</span>
      </span>
    </div>
  );
}

export default async function TuitionDetailsPage({ params }: Props) {
  const { id } = await params;
  const tuition = await getTuitionById(id);
  if (!tuition) notFound();

  const viewer = await getSessionUser();
  const similar = await getSimilarTuitions(tuition.id, tuition.subject, 3);
  const postedAgo = tuition.createdAt
    ? formatDistanceToNow(new Date(tuition.createdAt), { addSuffix: true })
    : null;
  const initials = tuition.tutorName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/tuitions" className="hover:text-foreground">
            Browse Tuitions
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-foreground">{tuition.subject}</span>
        </nav>

        <Link
          href="/tuitions"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to all tuitions
        </Link>

        <div className="mt-4 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          {/* Main column */}
          <div className="min-w-0 space-y-6">
            <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              {tuition.bannerImage && (
                <div className="relative aspect-video w-full bg-muted">
                  <Image
                    src={tuition.bannerImage}
                    alt={tuition.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {tuition.subject}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    <School className="size-3.5" aria-hidden="true" />
                    {tuition.classLevel}
                  </span>
                  <span
                    className={
                      tuition.mode === "Online"
                        ? "inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                        : "inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400"
                    }
                  >
                    {tuition.mode === "Online" ? (
                      <Monitor className="size-3.5" aria-hidden="true" />
                    ) : (
                      <MapPin className="size-3.5" aria-hidden="true" />
                    )}
                    {tuition.mode}
                  </span>
                </div>

                <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                  {tuition.title}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Wallet className="size-4 text-primary" aria-hidden="true" />
                    <span className="font-semibold text-foreground">
                      ৳{tuition.monthlyFee.toLocaleString("en-US")}
                    </span>
                    /month
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-4 text-primary" aria-hidden="true" />
                    {tuition.daysPerWeek} days / week
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarRange className="size-4 text-primary" aria-hidden="true" />
                    Posted {postedAgo}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <MetaChip
                    icon={School}
                    label="Class"
                    value={tuition.classLevel}
                  />
                  <MetaChip
                    icon={tuition.mode === "Online" ? Monitor : MapPin}
                    label="Mode"
                    value={tuition.mode}
                  />
                  <MetaChip
                    icon={MapPin}
                    label="Location"
                    value={tuition.location || tuition.mode}
                  />
                </div>
              </div>
            </article>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold">About this tuition</h2>
              <p className="mt-3 leading-relaxed whitespace-pre-line text-muted-foreground">
                {tuition.description}
              </p>
            </section>

            {/* Similar tuitions */}
            {similar.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold">Similar tuitions</h2>
                <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {similar.map((item) => (
                    <TuitionCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {/* Tutor details */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Tutor details
              </h2>
              <div className="mt-4 flex items-center gap-3">
                <Avatar className="size-12 shrink-0">
                  {tuition.tutorAvatar ? (
                    <AvatarImage src={tuition.tutorAvatar} alt="" />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-base font-bold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate font-semibold">
                    {tuition.tutorName}
                    <BadgeCheck
                      className="size-4 shrink-0 text-primary"
                      aria-label="Verified tutor"
                    />
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    Teaches {tuition.subject}
                  </p>
                </div>
              </div>

              <dl className="mt-4 space-y-2.5 border-t border-border pt-4 text-sm">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    className="size-4 shrink-0 text-emerald-500"
                    aria-hidden="true"
                  />
                  <dt className="sr-only">Verification</dt>
                  <dd className="text-muted-foreground">
                    Verified by MentorLagbe admin
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  <dt className="sr-only">Email</dt>
                  <dd className="min-w-0">
                    <a
                      href={`mailto:${tuition.tutorEmail}`}
                      className="truncate text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      {tuition.tutorEmail}
                    </a>
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <UserRound
                    className="size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <dt className="sr-only">Member since</dt>
                  <dd className="text-muted-foreground">
                    Member since{" "}
                    {tuition.createdAt
                      ? new Date(tuition.createdAt).getFullYear()
                      : "—"}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Fee summary + apply */}
            <div className="rounded-2xl border-2 border-primary bg-card p-5 shadow-sm">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Monthly fee
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-primary">
                    ৳{tuition.monthlyFee.toLocaleString("en-US")}
                  </p>
                </div>
                <p className="pb-1 text-sm text-muted-foreground">
                  {tuition.daysPerWeek} days/week
                </p>
              </div>
              <div className="mt-4">
                <ApplyTuitionButton
                  tuitionId={tuition.id}
                  tutorName={tuition.tutorName}
                  viewer={
                    viewer
                      ? {
                          name: viewer.name,
                          email: viewer.email,
                          role: viewer.role,
                        }
                      : null
                  }
                />
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Your application is sent directly to the tutor.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
