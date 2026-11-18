import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Crown, Mail, ShieldCheck, UserRound } from "lucide-react";

import { getSessionUser } from "@/lib/session";
import { client, db } from "@/lib/mongodb";
import { RoleSelect } from "@/components/role-select";
import {
  DashboardSection,
  EmptyState,
  StatCard,
} from "@/components/dashboard-ui";

export const metadata = { title: "Users · Admin" };

export default async function AdminUsersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "admin") redirect("/dashboard");

  await client.connect();
  const docs = await db
    .collection("users")
    .find({})
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const users = docs.map((doc) => ({
    id: String(doc._id),
    name: String(doc.name ?? "Unnamed"),
    email: String(doc.email ?? ""),
    role: String(doc.role ?? "student"),
    plan: String(doc.plan ?? "free") === "pro" ? "Pro" : "Free",
    createdAt:
      doc.createdAt instanceof Date ? doc.createdAt : new Date(),
    isSelf: String(doc._id) === String(user.id),
  }));

  const stats = {
    total: users.length,
    students: users.filter((u) => u.role === "student").length,
    tutors: users.filter((u) => u.role === "tutor").length,
    admins: users.filter((u) => u.role === "admin").length,
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Change any account&apos;s role — student, tutor or admin.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Administrator
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={UserRound} label="Total Users" value={stats.total} />
        <StatCard icon={Mail} label="Students" value={stats.students} />
        <StatCard icon={Crown} label="Tutors" value={stats.tutors} />
        <StatCard icon={ShieldCheck} label="Admins" value={stats.admins} />
      </div>

      <DashboardSection title="All Accounts">
        {users.length === 0 ? (
          <EmptyState
            title="No users yet"
            description="Registered accounts will appear here."
          />
        ) : (
          <ul className="space-y-3">
            {users.map((account) => (
              <li
                key={account.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {account.name}
                    {account.isSelf ? (
                      <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        You
                      </span>
                    ) : null}
                    {account.plan === "Pro" ? (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <Crown className="size-3" aria-hidden="true" />
                        Pro
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {account.email} · joined{" "}
                    {formatDistanceToNow(account.createdAt, { addSuffix: true })}
                  </p>
                </div>
                {account.isSelf ? (
                  <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold capitalize text-muted-foreground">
                    {account.role}
                  </span>
                ) : (
                  <RoleSelect userId={account.id} currentRole={account.role} />
                )}
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>
    </div>
  );
}
