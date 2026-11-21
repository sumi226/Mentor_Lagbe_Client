import { DashboardTableSkeleton } from "@/components/skeleton-loader";

export default function Loading() {
  return (
    <DashboardTableSkeleton
      title="Tuition Applicants"
      subtitle="Loading applicant inquiries for your tuition postings..."
      rows={5}
      columns={5}
    />
  );
}
