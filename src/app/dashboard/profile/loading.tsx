import { DashboardFormSkeleton } from "@/components/skeleton-loader";

export default function Loading() {
  return (
    <DashboardFormSkeleton
      title="Profile"
      subtitle="Loading your account profile and details..."
      showAvatar={true}
    />
  );
}
