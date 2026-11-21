import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                           CUSTOM SMOOTH SPINNER                            */
/* -------------------------------------------------------------------------- */

export interface SmoothSpinnerProps {
  /** Accessible + visible label shown alongside/under the spinner */
  label?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl";
  /** Optional orientation */
  layout?: "vertical" | "horizontal";
  /** Extra wrapper classes */
  className?: string;
  /** Whether to show the text label */
  showLabel?: boolean;
}

/**
 * Custom modern smooth spinner with glowing double-orbit ring,
 * ease-in-out rotation, and accessible ARIA live status.
 */
export function SmoothSpinner({
  label = "Loading...",
  size = "md",
  layout = "vertical",
  className,
  showLabel = true,
}: SmoothSpinnerProps) {
  const sizeMap = {
    sm: "size-5",
    md: "size-8",
    lg: "size-11",
    xl: "size-14",
  };

  const ringBorderMap = {
    sm: "border-2",
    md: "border-[2.5px]",
    lg: "border-[3px]",
    xl: "border-4",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-3",
        layout === "vertical" ? "flex-col" : "flex-row",
        "animate-in fade-in fill-mode-both duration-300",
        className
      )}
    >
      <div className={cn("relative shrink-0", sizeMap[size])}>
        {/* Subtle background track */}
        <div
          className={cn(
            "absolute inset-0 rounded-full border-primary/20",
            ringBorderMap[size]
          )}
        />
        {/* Animated active gradient ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-full border-transparent border-t-primary border-r-primary/70 animate-spin",
            ringBorderMap[size]
          )}
          style={{ animationDuration: "0.85s" }}
        />
        {/* Inner subtle glow pulse */}
        <div className="absolute inset-1 rounded-full bg-primary/5 animate-pulse" />
      </div>

      {showLabel && label ? (
        <span className="text-xs sm:text-sm font-medium text-muted-foreground animate-pulse">
          {label}
        </span>
      ) : null}
      <span className="sr-only">{label}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                         PAGE & ROUTE SKELETONS                             */
/* -------------------------------------------------------------------------- */

/**
 * Tuition Card Skeleton - perfectly mirrors `TuitionCard` component layout.
 */
export function TuitionCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
      {/* Top badges: Subject pill & Mode badge */}
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Title (2 lines) */}
      <div className="mt-3.5 space-y-2">
        <Skeleton className="h-4.5 w-11/12 rounded" />
        <Skeleton className="h-4.5 w-3/4 rounded" />
      </div>

      {/* Meta rows (Class, Tutor, Days) */}
      <div className="mt-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <Skeleton className="size-4 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-4 w-28 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-4 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
      </div>

      {/* Price separator */}
      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-7 w-28 rounded" />
          <Skeleton className="h-4 w-12 rounded" />
        </div>
      </div>

      {/* Button */}
      <div className="mt-auto pt-5">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Tuitions Browse Page Skeleton (`/tuitions/loading.tsx`).
 */
export function TuitionsPageSkeleton() {
  return (
    <div className="bg-background min-h-screen py-8">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-4 w-80 max-w-full rounded" />
          </div>
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>

        {/* Filter bar placeholder */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <Skeleton className="h-10 col-span-2 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
        </div>

        {/* Results counter */}
        <div className="mt-6 flex items-center justify-between">
          <Skeleton className="h-5 w-36 rounded" />
          <Skeleton className="h-5 w-24 rounded" />
        </div>

        {/* Grid of 6 cards */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <TuitionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Tuition Details Page Skeleton (`/tuitions/[id]/loading.tsx`).
 */
export function TuitionDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        {/* Back Link */}
        <Skeleton className="h-5 w-32 rounded mb-6" />

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-8 w-11/12 rounded-lg" />
              <Skeleton className="h-4 w-40 rounded" />

              {/* Meta Chips Grid */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-border">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            </div>

            {/* Description block */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
              <Skeleton className="h-6 w-36 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-4/5 rounded" />
            </div>

            {/* Tutor Profile Card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <Skeleton className="size-16 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-40 rounded" />
                  <Skeleton className="h-4 w-52 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar CTA Card (1 col) */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5 sticky top-24">
              <Skeleton className="h-4 w-28 rounded" />
              <div className="space-y-1">
                <Skeleton className="h-10 w-44 rounded-lg" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
              <div className="space-y-2 pt-4 border-t border-border">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Stat Card Skeleton - mirrors `StatCard` in `dashboard-ui.tsx`.
 */
export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Skeleton className="size-4 rounded" />
        <Skeleton className="h-4 w-24 rounded" />
      </div>
      <Skeleton className="mt-3 h-8 w-20 rounded-md" />
      <Skeleton className="mt-2 h-3.5 w-32 rounded" />
    </div>
  );
}

/**
 * Reusable Data Table Skeleton for admin and list routes.
 */
export function DashboardTableSkeleton({
  title = "Loading data...",
  subtitle = "Please wait while we fetch the latest records.",
  rows = 5,
  columns = 5,
}: {
  title?: string;
  subtitle?: string;
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="space-y-6">
      {/* Table Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <SmoothSpinner size="sm" showLabel={false} />
          </div>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Table Head */}
        <div className="grid grid-cols-6 gap-4 border-b border-border bg-muted/40 p-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20 rounded" />
          ))}
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="grid grid-cols-6 items-center gap-4 p-4">
              <div className="flex items-center gap-3 col-span-2">
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              </div>
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-24 rounded" />
              <div className="flex justify-end gap-2">
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Admin Dashboard Overview Skeleton (`/dashboard/admin/loading.tsx`).
 */
export function DashboardAdminSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard Overview</h1>
            <SmoothSpinner size="sm" showLabel={false} />
          </div>
          <p className="text-sm text-muted-foreground">
            Platform statistics, user management, and pending tuition approvals.
          </p>
        </div>
        <Skeleton className="h-7 w-36 rounded-full" />
      </div>

      {/* 4 Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Subpage Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-5 w-36 rounded" />
            <Skeleton className="h-3.5 w-full rounded" />
          </div>
        ))}
      </div>

      {/* Section Table Skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-44 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <div className="space-y-3 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="space-y-1.5">
                <Skeleton className="h-4.5 w-64 rounded" />
                <Skeleton className="h-3.5 w-40 rounded" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-lg" />
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Student Dashboard Skeleton (`/dashboard/student/loading.tsx`).
 */
export function DashboardStudentSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">Student Dashboard</h1>
            <SmoothSpinner size="sm" showLabel={false} />
          </div>
          <p className="text-sm text-muted-foreground">
            Track your tuition applications and mentor responses in real-time.
          </p>
        </div>
        <Skeleton className="h-7 w-32 rounded-full" />
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Applications List Skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
        <div className="divide-y divide-border pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-5 w-56 rounded" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Tutor Dashboard Skeleton (`/dashboard/tutor/loading.tsx`).
 */
export function DashboardTutorSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">Tutor Dashboard</h1>
            <SmoothSpinner size="sm" showLabel={false} />
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your tuition posts, track student applications, and view analytics.
          </p>
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {/* 3 Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Tuitions and Applicants Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <Skeleton className="h-6 w-36 rounded" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 border border-border/70 rounded-xl space-y-2">
                <Skeleton className="h-4.5 w-3/4 rounded" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <Skeleton className="h-6 w-36 rounded" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 border border-border/70 rounded-xl space-y-2">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-4 w-32 rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-7 w-20 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Form Skeleton (`/dashboard/tutor/post-tuition` and `/dashboard/profile`).
 */
export function DashboardFormSkeleton({
  title = "Loading form...",
  subtitle = "Please wait while the form is being prepared.",
  showAvatar = false,
}: {
  title?: string;
  subtitle?: string;
  showAvatar?: boolean;
}) {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <SmoothSpinner size="sm" showLabel={false} />
        </div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
        {showAvatar && (
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <Skeleton className="size-18 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Home Page Skeleton (`/loading.tsx`).
 */
export function HomePageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero section skeleton */}
      <section className="border-b border-border bg-muted/20 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center space-y-4">
          <Skeleton className="mx-auto h-7 w-40 rounded-full" />
          <Skeleton className="mx-auto h-12 w-3/4 max-w-2xl rounded-xl" />
          <Skeleton className="mx-auto h-5 w-2/3 max-w-xl rounded" />
          <div className="pt-4 flex justify-center gap-3">
            <Skeleton className="h-11 w-36 rounded-xl" />
            <Skeleton className="h-11 w-36 rounded-xl" />
          </div>
        </div>
      </section>

      {/* Featured Tuitions Section Skeleton */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center space-y-3">
            <Skeleton className="mx-auto h-6 w-36 rounded-full" />
            <Skeleton className="mx-auto h-8 w-64 rounded-lg" />
            <Skeleton className="mx-auto h-4 w-96 max-w-full rounded" />
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <TuitionCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
