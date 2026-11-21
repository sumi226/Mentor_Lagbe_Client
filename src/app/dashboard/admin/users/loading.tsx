import { DashboardTableSkeleton } from "@/components/skeleton-loader";

export default function Loading() {
  return (
    <DashboardTableSkeleton
      title="User Management"
      subtitle="Loading all registered users…"
      rows={7}
    />
  );
}
