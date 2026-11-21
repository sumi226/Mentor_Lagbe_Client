import { DashboardTableSkeleton } from "@/components/skeleton-loader";

export default function Loading() {
  return (
    <DashboardTableSkeleton
      title="My Tuition Posts"
      subtitle="Loading your published tuitions and student interest..."
      rows={5}
      columns={5}
    />
  );
}
