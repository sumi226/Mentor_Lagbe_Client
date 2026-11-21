import { DashboardTableSkeleton } from "@/components/skeleton-loader";

export default function Loading() {
  return (
    <DashboardTableSkeleton
      title="Admin Tuition Approvals"
      subtitle="Loading pending and approved tuition posts for moderation..."
      rows={6}
      columns={6}
    />
  );
}
