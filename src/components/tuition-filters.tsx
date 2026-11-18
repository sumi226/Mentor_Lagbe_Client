import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import type { TuitionFilterOptions } from "@/lib/tuitions";

export type TuitionsSearchParams = {
  q?: string;
  subject?: string;
  classLevel?: string;
  mode?: string;
  maxFee?: string;
  sort?: string;
};

/**
 * GET form — submits as URL params (/tuitions?...) so filtering works
 * without client JS and the result is shareable/bookmarkable.
 */
export function TuitionFilters({
  params,
  options,
}: {
  params: TuitionsSearchParams;
  options: TuitionFilterOptions;
}) {
  const hasFilters = Boolean(
    params.q || params.subject || params.classLevel || params.mode || params.maxFee
  );

  return (
    <form
      action="/tuitions"
      method="get"
      className="rounded-2xl border border-border bg-card p-4 shadow-sm"
      aria-label="Search and filter tuitions"
    >
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search title, subject, tutor…"
            className="h-9 pl-9"
            aria-label="Search tuitions"
          />
        </div>

        <NativeSelect name="subject" defaultValue={params.subject ?? ""} aria-label="Subject">
          <NativeSelectOption value="">All subjects</NativeSelectOption>
          {options.subjects.map((s) => (
            <NativeSelectOption key={s} value={s}>
              {s}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <NativeSelect
          name="classLevel"
          defaultValue={params.classLevel ?? ""}
          aria-label="Class level"
        >
          <NativeSelectOption value="">All classes</NativeSelectOption>
          {options.classLevels.map((c) => (
            <NativeSelectOption key={c} value={c}>
              {c}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <NativeSelect name="mode" defaultValue={params.mode ?? ""} aria-label="Mode">
          <NativeSelectOption value="">Online & Offline</NativeSelectOption>
          <NativeSelectOption value="Online">Online</NativeSelectOption>
          <NativeSelectOption value="Offline">Offline</NativeSelectOption>
        </NativeSelect>

        <Input
          type="number"
          name="maxFee"
          min={0}
          step={100}
          defaultValue={params.maxFee ?? ""}
          placeholder="Max ৳ fee"
          className="h-9"
          aria-label="Maximum monthly fee"
        />

        <div className="flex items-center gap-2">
          <input type="hidden" name="sort" value={params.sort ?? "newest"} />
          <Button type="submit" className="h-9">
            <SlidersHorizontal className="size-4" />
            Filter
          </Button>
          {hasFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              aria-label="Clear all filters"
              render={<Link href="/tuitions" />}
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <span className="text-xs font-medium text-muted-foreground">Sort by</span>
        {(
          [
            ["newest", "Newest"],
            ["fee-asc", "Fee: low → high"],
            ["fee-desc", "Fee: high → low"],
          ] as const
        ).map(([value, label]) => {
          const active = (params.sort ?? "newest") === value;
          return (
            <Link
              key={value}
              href={`/tuitions?${new URLSearchParams({
                ...(params.q ? { q: params.q } : {}),
                ...(params.subject ? { subject: params.subject } : {}),
                ...(params.classLevel ? { classLevel: params.classLevel } : {}),
                ...(params.mode ? { mode: params.mode } : {}),
                ...(params.maxFee ? { maxFee: params.maxFee } : {}),
                sort: value,
              }).toString()}`}
              className={
                active
                  ? "rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  : "rounded-full px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              }
            >
              {label}
            </Link>
          );
        })}
      </div>
    </form>
  );
}
