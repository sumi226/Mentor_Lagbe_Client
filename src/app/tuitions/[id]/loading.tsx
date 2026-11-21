import { TuitionDetailSkeleton } from "@/components/skeleton-loader";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <TuitionDetailSkeleton />
    </div>
  );
}
