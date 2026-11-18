import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  /** Visible + accessible label shown under the spinner. */
  label?: string;
  /** Extra classes — e.g. a shorter min-height inside the dashboard shell. */
  className?: string;
  /** Spinner icon size. */
  size?: "sm" | "md" | "lg";
};

/**
 * Centered spinner block used as the fallback of route-level
 * `loading.tsx` files (App Router streaming), so pages show loading UI
 * while their MongoDB queries run.
 *
 * The fade-in starts after a short delay with `fill-mode-both`, so fast
 * navigations never flash a spinner, while slower ones ease in instead
 * of popping onto the screen.
 */
export function LoadingSpinner({
  label = "Loading…",
  className,
  size = "md",
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-[45vh] flex-col items-center justify-center gap-3",
        "animate-in fill-mode-both fade-in delay-150 duration-300",
        className
      )}
    >
      <Loader2
        aria-hidden="true"
        className={cn(
          "animate-spin text-primary",
          size === "sm" && "size-5",
          size === "md" && "size-7",
          size === "lg" && "size-9"
        )}
      />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
