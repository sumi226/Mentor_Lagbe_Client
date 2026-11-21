import { DashboardTableSkeleton } from "@/components/skeleton-loader";

export default function Loading() {
  return (
    <DashboardTableSkeleton
      title="My Applications"
      subtitle="Loading your tuition applications…"
      rows={6}
    />
  );
}
