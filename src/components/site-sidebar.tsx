"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  ClipboardList,
  CreditCard,
  Home,
  Info,
  LayoutDashboard,
  LogOut,
  Search,
  UserRound,
  Users,
} from "lucide-react";

import { clearAuthToken } from "@/lib/api-token";
import { authClient, type SessionUser } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Custom active rule for routes where a plain prefix match is too broad
   *  (e.g. /dashboard must not stay lit while viewing /dashboard/profile). */
  match?: (pathname: string) => boolean;
};

/** Public site menu — visible to every visitor. */
const MENU_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home, match: (p) => p === "/" },
  { href: "/tuitions", label: "Browse Tuitions", icon: Search },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/how-it-works", label: "How It Works", icon: Info },
];

/** Signed-in shortcuts shared by all three roles. */
const ACCOUNT_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    match: (p) =>
      p === "/dashboard" || /^\/dashboard\/(student|tutor|admin)$/.test(p),
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: UserRound,
    match: (p) => p.startsWith("/dashboard/profile"),
  },
];

/** Admin-only moderation shortcuts (users, tuitions, transactions). */
const ADMIN_ITEMS: NavItem[] = [
  { href: "/dashboard/admin/users", label: "Users", icon: Users },
  { href: "/dashboard/admin/tuitions", label: "Tuitions", icon: ClipboardList },
  {
    href: "/dashboard/admin/transactions",
    label: "Transactions",
    icon: Banknote,
  },
];

function isLinkActive(item: NavItem, pathname: string) {
  if (item.match) return item.match(pathname);
  return item.href === "/"
    ? pathname === "/"
    : pathname.startsWith(item.href);
}

function MenuGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon;
          const active = isLinkActive(item, pathname);
          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                render={<Link href={item.href} />}
                isActive={active}
                aria-current={active ? "page" : undefined}
                className={cn(
                  active && "bg-primary/10 font-medium text-primary"
                )}
              >
                <Icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

/**
 * Site-wide left menubar (desktop ≥768px). Replaces the horizontal nav
 * that used to live in the topbar; below 768px the header's sheet menu
 * still handles navigation, so this sidebar stays out of the way.
 */
export function SiteSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as unknown as SessionUser | undefined;

  const handleSignOut = async () => {
    await authClient.signOut();
    clearAuthToken(); // drop the cached JWT so it can't outlive the session
    router.push("/");
    router.refresh();
  };

  return (
    <Sidebar side="left" collapsible="offcanvas">
      <SidebarRail />
      <SidebarContent>
        <MenuGroup label="Menu" items={MENU_ITEMS} pathname={pathname} />

        {user ? (
          <>
            <MenuGroup
              label="Account"
              items={ACCOUNT_ITEMS}
              pathname={pathname}
            />
            {user.role === "admin" ? (
              <MenuGroup
                label="Admin"
                items={ADMIN_ITEMS}
                pathname={pathname}
              />
            ) : null}
          </>
        ) : null}
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        {isPending ? (
          <div className="flex flex-col gap-2" aria-hidden="true">
            <div className="h-9 animate-pulse rounded-md bg-sidebar-accent" />
            <div className="h-9 animate-pulse rounded-md bg-sidebar-accent" />
          </div>
        ) : user ? (
          <Button
            variant="outline"
            className="justify-start"
            onClick={handleSignOut}
          >
            <LogOut />
            Sign Out
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="justify-start"
              render={<Link href="/sign-in" />}
            >
              Sign In
            </Button>
            <Button
              className="justify-start"
              render={<Link href="/sign-up" />}
            >
              Sign Up
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
