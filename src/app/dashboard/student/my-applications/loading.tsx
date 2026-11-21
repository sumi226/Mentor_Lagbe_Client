import { DashboardTableSkeleton } from "@/components/skeleton-loader";

export default function Loading() {
  return (
    <DashboardTableSkeleton
      title="My Tuition Applications"
      subtitle="Loading your submitted applications and their review statuses..."
      rows={5}
      columns={5}
    />
  );
}
