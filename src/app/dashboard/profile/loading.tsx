import { DashboardFormSkeleton } from "@/components/skeleton-loader";

export default function Loading() {
  return (
    <DashboardFormSkeleton
      title="Update Profile"
      subtitle="Loading your profile details…"
      showAvatar
    />
  );
}
