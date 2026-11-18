import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";

import {
  getAllTuitions,
  getTuitionFilterOptions,
  type TuitionFilters,
} from "@/lib/tuitions";
import { TuitionCard } from "@/components/tuition-card";
import { TuitionFilters as FilterBar } from "@/components/tuition-filters";

export const metadata: Metadata = {
  title: "Browse Tuitions",
  description:
    "Search and filter all admin-approved and active tuition listings by subject, class level, mode and monthly budget.",
};

type SearchParams = { [key: string]: string | string[] | undefined };

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export default async function TuitionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const filters: TuitionFilters = {
    q: first(sp.q),
    subject: first(sp.subject),
    classLevel: first(sp.classLevel),
    mode: first(sp.mode),
    maxFee: first(sp.maxFee) ? Number(first(sp.maxFee)) : undefined,
    sort:
      first(sp.sort) === "fee-asc"
        ? "fee-asc"
        : first(sp.sort) === "fee-desc"
          ? "fee-desc"
          : "newest",
  };

  const [tuitions, options] = await Promise.all([
    getAllTuitions(filters),
    getTuitionFilterOptions(),
  ]);

  const activeFilterCount = [
    filters.q,
    filters.subject,
    filters.classLevel,
    filters.mode,
    filters.maxFee,
  ].filter(Boolean).length;

  return (
    <div className="bg-background">
      {/* Page header */}
      <div className="border-b border-border bg-gradient-to-b from-primary/10 to-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-foreground">Browse Tuitions</span>
          </nav>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Browse Tuitions
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Every listing below is admin-approved and active. Search by keyword,
            narrow down by subject, class, mode and budget.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <FilterBar
          params={{
            q: filters.q,
            subject: filters.subject,
            classLevel: filters.classLevel,
            mode: filters.mode,
            maxFee: filters.maxFee ? String(filters.maxFee) : "",
            sort: filters.sort,
          }}
          options={options}
        />

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            <span className="font-semibold text-foreground">
              {tuitions.length}
            </span>{" "}
            {tuitions.length === 1 ? "tuition" : "tuitions"} found
            {activeFilterCount > 0
              ? ` · ${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} applied`
              : ""}
          </p>
        </div>

        {tuitions.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <SearchX className="mx-auto size-10 text-muted-foreground/60" />
            <p className="mt-4 font-semibold">No tuitions match your filters</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different keyword or clear the filters to see everything.
            </p>
            <Link
              href="/tuitions"
              className="mt-4 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Clear all filters
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tuitions.map((item) => (
              <TuitionCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
