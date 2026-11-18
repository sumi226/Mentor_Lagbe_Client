"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  UserRound,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const TABS = [
  { match: (p: string) => /^\/dashboard\/(student|tutor|admin)$/.test(p), href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { match: (p: string) => p.startsWith("/dashboard/profile"), href: "/dashboard/profile", label: "Profile", icon: UserRound },
] as const;

const ADMIN_TABS = [
  { match: (p: string) => p.startsWith("/dashboard/admin/users"), href: "/dashboard/admin/users", label: "Users", icon: Users },
  { match: (p: string) => p.startsWith("/dashboard/admin/tuitions"), href: "/dashboard/admin/tuitions", label: "Tuitions", icon: ClipboardList },
  { match: (p: string) => p.startsWith("/dashboard/admin/transactions"), href: "/dashboard/admin/transactions", label: "Transactions", icon: CreditCard },
] as const;

/** Sub-navigation shared by all dashboard pages (client-side active state). */
export function DashboardTabs({ role }: { role: string }) {
  const pathname = usePathname();
  const tabs = role === "admin" ? [...TABS, ...ADMIN_TABS] : TABS;

  return (
    <nav aria-label="Dashboard" className="mt-5 flex flex-wrap gap-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.match(pathname);
        const href = tab.label === "Overview" ? `/dashboard/${role}` : tab.href;
        return (
          <Link
            key={tab.label}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
