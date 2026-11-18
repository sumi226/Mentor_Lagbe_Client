import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Monitor,
  School,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FeaturedTuition } from "@/lib/tuitions";

function initials(name: string) {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

function ModeBadge({ mode }: { mode: string }) {
  const isOnline = mode === "Online";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        isOnline
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
      )}
    >
      {isOnline ? <Monitor className="size-3.5" /> : <MapPin className="size-3.5" />}
      {mode}
    </span>
  );
}

/**
 * Equal-size tuition card used by the home page featured grid and the
 * /tuitions browse grid. Links to the tuition detail page.
 */
export function TuitionCard({ item }: { item: FeaturedTuition }) {
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
          <Avatar className="size-6 shrink-0">
            {item.tutorAvatar ? (
              <AvatarImage src={item.tutorAvatar} alt="" />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-[9px] font-bold text-primary">
              {initials(item.tutorName)}
            </AvatarFallback>
          </Avatar>
          <span className="truncate">{item.tutorName}</span>
        </div>
        {item.daysPerWeek ? (
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0 text-primary" />
            <span className="truncate">{item.daysPerWeek} days / week</span>
          </div>
        ) : null}
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <p className="text-2xl font-bold tracking-tight text-primary">
          ৳{item.monthlyFee.toLocaleString("en-US")}
          <span className="text-sm font-medium text-muted-foreground">/month</span>
        </p>
      </div>

      <div className="mt-auto pt-5">
        <Button
          render={<Link href={`/tuitions/${item.id}`} />}
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
