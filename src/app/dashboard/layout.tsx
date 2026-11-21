import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard-shell";

/**
 * Responsive Dashboard Layout Shell with collapsible sidebar toggle, top bar,
 * user profile summary, and dynamic role-based navigation.
 * Unauthenticated visitors are redirected to /sign-in.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  return (
    <DashboardShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image ?? null,
        plan: user.plan ?? "free",
      }}
    >
      {children}
    </DashboardShell>
  );
}
