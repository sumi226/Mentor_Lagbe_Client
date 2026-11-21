import { DashboardTableSkeleton } from "@/components/skeleton-loader";

export default function Loading() {
  return (
    <DashboardTableSkeleton
      title="My Created Tuitions"
      subtitle="Loading your tuition posts…"
      rows={5}
    />
  );
}
