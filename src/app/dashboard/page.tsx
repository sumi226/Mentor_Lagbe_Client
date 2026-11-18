import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/session";

/**
 * Role-based entry point: sends each user to their own dashboard
 * (student → /dashboard/student, tutor → /dashboard/tutor, admin → /dashboard/admin).
 */
export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  redirect(`/dashboard/${user.role}`);
}
