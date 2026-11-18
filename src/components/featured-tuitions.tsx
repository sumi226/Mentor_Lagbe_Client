import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  MapPin,
  Monitor,
  School,
  Sparkles,
  UserRound,
} from "lucide-react";

import { getFeaturedTuitions, type FeaturedTuition } from "@/lib/tuitions";
import { Button } from "@/components/ui/button";

function ModeBadge({ mode }: { mode: FeaturedTuition["mode"] }) {
  const isOnline = mode === "Online";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isOnline
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
      }`}
    >
      {isOnline ? <Monitor className="size-3.5" /> : <MapPin className="size-3.5" />}
      {mode}
    </span>
  );
}

function TuitionCard({ item }: { item: FeaturedTuition }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          {item.subject}
        </span>
        <ModeBadge mode={item.mode} />
      </div>

      <h3 className="mt-3 line-clamp-2 min-h-12 text-base font-semibold leading-snug">
        {item.title}
      </h3>

      <div className="mt-3 space-y-2.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <School className="size-4 shrink-0 text-primary" />
          <span className="truncate">{item.classLevel}</span>
        </div>
        <div className="flex items-center gap-2">
          <UserRound className="size-4 shrink-0 text-primary" />
          <span className="truncate">{item.tutorName}</span>
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <p className="text-2xl font-bold tracking-tight text-primary">
          ৳{item.monthlyFee.toLocaleString("en-US")}
          <span className="text-sm font-medium text-muted-foreground">/month</span>
        </p>
      </div>

      <div className="mt-auto pt-5">
        <Button
          render={<Link href="/tuitions" />}
          variant="outline"
          className="w-full"
        >
          View Details
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export default async function FeaturedTuitions() {
  const tuitions = await getFeaturedTuitions(6);

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            Featured Tuitions
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Fresh listings, ready to book
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            The latest approved tuition requests from students and parents — updated
            automatically as new requests come in.
          </p>
        </div>

        {tuitions.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <BookOpen className="mx-auto size-10 text-muted-foreground/60" />
            <p className="mt-4 font-semibold">No featured tuitions yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Approved and active listings will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tuitions.map((item) => (
              <TuitionCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
