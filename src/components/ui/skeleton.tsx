import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.ComponentProps<"div"> {
  /** When true, adds an animated light-sweep shimmer effect over the skeleton. Defaults to true. */
  shimmer?: boolean;
}

function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md bg-muted/80 dark:bg-muted/40",
        shimmer && "animate-shimmer",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
