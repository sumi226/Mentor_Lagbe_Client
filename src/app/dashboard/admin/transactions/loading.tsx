import { DashboardTableSkeleton } from "@/components/skeleton-loader";

export default function Loading() {
  return (
    <DashboardTableSkeleton
      title="Transaction Management"
      subtitle="Loading subscription transactions and platform revenue history..."
      rows={6}
      columns={5}
    />
  );
}
