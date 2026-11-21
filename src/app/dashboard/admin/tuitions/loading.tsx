import { DashboardTableSkeleton } from "@/components/skeleton-loader";

export default function Loading() {
  return (
    <DashboardTableSkeleton
      title="Admin Tuition Approvals"
      subtitle="Loading all submitted tuition listings…"
      rows={6}
    />
  );
}
