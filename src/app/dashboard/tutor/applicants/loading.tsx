import { DashboardTableSkeleton } from "@/components/skeleton-loader";

export default function Loading() {
  return (
    <DashboardTableSkeleton
      title="Manage Applicants"
      subtitle="Loading student applications for your tuitions…"
      rows={6}
    />
  );
}
