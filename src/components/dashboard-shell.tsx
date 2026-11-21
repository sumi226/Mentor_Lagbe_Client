"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UserRound,
  Users,
  ClipboardList,
  CreditCard,
  FilePlus,
  Send,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Crown,
  ChevronRight,
  ShieldCheck,
  Search,
  CheckCircle,
  Menu,
  X,
} from "lucide-react";
import { authClient, type SessionUser } from "@/lib/auth-client";
import { clearAuthToken } from "@/lib/api-token";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const STUDENT_NAV: NavItem[] = [
  { href: "/dashboard/student", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/student/my-applications", label: "My Applications", icon: Send },
  { href: "/tuitions", label: "Browse Tuitions", icon: Search },
  { href: "/dashboard/profile", label: "Update Profile", icon: UserRound },
];

const TUTOR_NAV: NavItem[] = [
  { href: "/dashboard/tutor", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/tutor/post-tuition", label: "Post a Tuition", icon: FilePlus },
  { href: "/dashboard/tutor/my-tuitions", label: "My Tuitions", icon: Send },
  { href: "/dashboard/tutor/applicants", label: "Manage Applicants", icon: Users },
  { href: "/tuitions", label: "Browse Tuitions", icon: Search },
  { href: "/dashboard/profile", label: "Update Profile", icon: UserRound },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/admin/users", label: "User Management", icon: Users },
  { href: "/dashboard/admin/tuitions", label: "Tuition Approvals", icon: ClipboardList },
  { href: "/dashboard/admin/transactions", label: "Transactions", icon: CreditCard },
  { href: "/tuitions", label: "Public Listings", icon: Search },
  { href: "/dashboard/profile", label: "Update Profile", icon: UserRound },
];

const ROLE_BADGE_STYLES: Record<string, string> = {
  student: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
  tutor: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
  admin: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
};

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type DashboardShellProps = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string | null;
    plan?: string | null;
  };
  children: React.ReactNode;
};

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Desktop sidebar collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Mobile drawer open state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems =
    user.role === "admin"
      ? ADMIN_NAV
      : user.role === "tutor"
      ? TUTOR_NAV
      : STUDENT_NAV;

  const isPro = (user.plan ?? "free").toLowerCase() === "pro";

  const handleSignOut = async () => {
    await authClient.signOut();
    clearAuthToken();
    router.push("/");
    router.refresh();
  };

  // Find current active section title
  const activeItem = navItems.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)
  );
  const currentTitle = activeItem ? activeItem.label : "Dashboard";

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full bg-background">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Desktop Collapsible & Mobile Slide-out Drawer) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out md:static",
          // Mobile state
          mobileOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0",
          // Desktop state
          isCollapsed ? "md:w-20" : "md:w-64"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link
            href={`/dashboard/${user.role}`}
            className={cn(
              "flex items-center gap-2.5 font-bold transition-opacity",
              isCollapsed && "md:hidden"
            )}
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <BookOpen className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base tracking-tight">MentorLagbe</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {user.role} workspace
              </span>
            </div>
          </Link>

          {isCollapsed && (
            <div className="hidden md:flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground mx-auto">
              <BookOpen className="size-5" />
            </div>
          )}

          {/* Close button for mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-muted-foreground hover:text-foreground p-1"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className={cn("px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground", isCollapsed && "md:hidden")}>
            Menu Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed && "md:justify-center md:px-2"
                )}
              >
                <Icon
                  className={cn(
                    "size-5 shrink-0 transition-transform group-hover:scale-105",
                    active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span className={cn("truncate", isCollapsed && "md:hidden")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Pro Banner (if Free) */}
        {!isPro && !isCollapsed && (
          <div className="mx-3 mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-1.5 font-semibold">
              <Crown className="size-4 text-amber-500" />
              <span>Upgrade to Pro</span>
            </div>
            <p className="mt-1 text-[11px] text-amber-700/90 dark:text-amber-400">
              {user.role === "tutor"
                ? "Unlock unlimited posts & verified badge ($15/mo)"
                : "Get priority bookings & direct tutor access ($10/mo)"}
            </p>
            <Button
              size="sm"
              className="mt-2.5 w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs h-8"
              render={<Link href="/pricing" />}
            >
              Get Pro Plan
            </Button>
          </div>
        )}

        {/* Sidebar Footer: User Profile Summary */}
        <div className="border-t border-border p-3">
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl p-2 transition-colors",
              isCollapsed ? "md:justify-center" : "bg-muted/40"
            )}
          >
            <Avatar className="size-10 border border-border shrink-0">
              {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
              <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <div className={cn("min-w-0 flex-1", isCollapsed && "md:hidden")}>
              <div className="flex items-center justify-between gap-1">
                <p className="truncate text-sm font-semibold text-foreground leading-tight">
                  {user.name}
                </p>
              </div>
              <p className="truncate text-[11px] text-muted-foreground">
                {user.email}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-semibold capitalize px-2 py-0",
                    ROLE_BADGE_STYLES[user.role] ?? ROLE_BADGE_STYLES.student
                  )}
                >
                  {user.role}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-semibold px-2 py-0",
                    isPro
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "border-border bg-muted text-muted-foreground"
                  )}
                >
                  {isPro ? "★ Pro" : "Free"}
                </Badge>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className={cn("p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10", isCollapsed && "md:hidden")}
              title="Sign Out"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Area: Top Bar + Page Content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-16 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile toggle button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="size-5" />
            </button>

            {/* Desktop collapsible toggle button */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label="Toggle sidebar collapse"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </button>

            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
              <Link
                href={`/dashboard/${user.role}`}
                className="font-medium text-muted-foreground hover:text-foreground capitalize"
              >
                {user.role} Dashboard
              </Link>
              {currentTitle !== "Overview" && (
                <>
                  <ChevronRight className="size-3.5 text-muted-foreground/60" />
                  <span className="font-semibold text-foreground">
                    {currentTitle}
                  </span>
                </>
              )}
            </nav>
          </div>

          {/* Top Bar Right: Plan badge, Quick Action & User Chip */}
          <div className="flex items-center gap-3">
            {isPro ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Crown className="size-3.5" />
                Pro Member
              </span>
            ) : (
              <Link
                href="/pricing"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
              >
                <Crown className="size-3.5" />
                Upgrade to Pro
              </Link>
            )}

            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pr-2.5 shadow-xs hover:bg-muted transition-colors"
            >
              <Avatar className="size-7">
                {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
                <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-block text-xs font-medium max-w-[100px] truncate">
                {user.name}
              </span>
            </Link>
          </div>
        </header>

        {/* Dynamic Route Children Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
