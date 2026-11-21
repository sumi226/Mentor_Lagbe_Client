import { SmoothSpinner } from "@/components/skeleton-loader";
import { cn } from "@/lib/utils";

export type LoadingSpinnerProps = {
  /** Visible + accessible label shown under the spinner. */
  label?: string;
  /** Extra classes — e.g. a shorter min-height inside the dashboard shell. */
  className?: string;
  /** Spinner icon size. */
  size?: "sm" | "md" | "lg" | "xl";
};

/**
 * Centered smooth custom spinner block used across routes and asynchronous operations.
 * Uses double-orbit ring animation and smooth ease-in transition.
 */
export function LoadingSpinner({
  label = "Loading...",
  className,
  size = "md",
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-[40vh] flex-col items-center justify-center p-6",
        className
      )}
    >
      <SmoothSpinner size={size} label={label} layout="vertical" />
    </div>
  );
}

// Re-export custom skeleton loader components for convenience
export * from "@/components/skeleton-loader";
