import { DashboardTableSkeleton } from "@/components/skeleton-loader";

export default function Loading() {
  return (
    <DashboardTableSkeleton
      title="User Management"
      subtitle="Loading all registered student, tutor, and admin accounts..."
      rows={6}
      columns={5}
    />
  );
}
