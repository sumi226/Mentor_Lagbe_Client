"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

const TABS = [
  { match: (p: string) => /^\/dashboard\/(student|tutor|admin)$/.test(p), href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { match: (p: string) => p.startsWith("/dashboard/profile"), href: "/dashboard/profile", label: "Profile", icon: UserRound },
] as const;

/** Sub-navigation shared by all dashboard pages (client-side active state). */
export function DashboardTabs({ role }: { role: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard" className="mt-5 flex gap-1">
      {TABS.map((tab) => {
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
