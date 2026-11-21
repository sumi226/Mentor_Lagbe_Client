import { DashboardTableSkeleton } from "@/components/skeleton-loader";

export default function Loading() {
  return (
    <DashboardTableSkeleton
      title="Transaction Management"
      subtitle="Loading Stripe payment records…"
      rows={6}
    />
  );
}
