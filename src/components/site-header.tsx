"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  authClient,
  type SessionUser,
} from "@/lib/auth-client";
import { SiteLogo } from "@/components/site-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { clearAuthToken } from "@/lib/api-token";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRoundPen,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/tuitions", label: "Browse Tuitions" },
  { href: "/pricing", label: "Pricing / Pro Plans" },
  { href: "/how-it-works", label: "How It Works / About" },
] as const;

const ROLE_BADGE_STYLES: Record<string, string> = {
  student:
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
  tutor:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
  admin:
    "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
};

function formatRole(role?: string | null): "Student" | "Tutor" | "Admin" | string {
  const r = (role ?? "student").toLowerCase();
  if (r === "student") return "Student";
  if (r === "tutor") return "Tutor";
  if (r === "admin") return "Admin";
  return r.charAt(0).toUpperCase() + r.slice(1);
}

function isLinkActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  if (href === "/how-it-works") {
    return (
      pathname.startsWith("/how-it-works") || pathname.startsWith("/about")
    );
  }
  return pathname.startsWith(href);
}

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

function NavLinks({
  pathname,
  orientation = "desktop",
}: {
  pathname: string;
  orientation?: "desktop" | "mobile";
}) {
  return (
    <nav aria-label="Main navigation">
      <ul
        className={cn(
          "flex list-none",
          orientation === "desktop"
            ? "items-center gap-1"
            : "flex-col items-stretch gap-1"
        )}
      >
        {NAV_ITEMS.map((item) => {
          const active = isLinkActive(item.href, pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "block rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  orientation === "mobile" && "px-3"
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function RoleBadge({
  role,
  className,
}: {
  role?: string | null;
  className?: string;
}) {
  const value = (role ?? "student").toLowerCase();
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", ROLE_BADGE_STYLES[value], className)}
    >
      {formatRole(value)}
    </Badge>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as unknown as SessionUser | undefined;

  const handleSignOut = async () => {
    await authClient.signOut();
    clearAuthToken(); // drop the cached JWT so it can't outlive the session
    router.push("/");
    router.refresh();
  };

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Logo & Brand Name */}
        <SiteLogo />

        {/* Public navigation items */}
        <div className="hidden lg:block">
          <NavLinks pathname={pathname} />
        </div>

        {/* Right side: auth state */}
        <div className="flex items-center gap-2">
          {isPending ? (
            <div className="flex items-center gap-2" aria-hidden="true">
              <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
              <div className="hidden h-4 w-20 animate-pulse rounded bg-muted sm:block" />
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-2 rounded-full border bg-background py-1 pr-2.5 pl-1.5 shadow-sm transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Open user menu"
              >
                <Avatar className="size-8">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-28 truncate text-sm font-medium sm:inline-block">
                  {user.name}
                </span>
                <RoleBadge role={user.role} className="hidden sm:inline-flex" />
                <ChevronDown className="size-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                  {/* Base UI renders the label as Menu.GroupLabel, which
                      requires a Menu.Group context — without this wrapper
                      opening the menu throws "MenuGroupContext is missing". */}
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {user.name}
                        </p>
                        <RoleBadge role={user.role} />
                      </div>
                      <p className="truncate text-xs font-normal text-muted-foreground mt-0.5">
                        {user.email}
                      </p>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/dashboard" />}>
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/dashboard/profile" />}>
                    <UserRoundPen className="size-4" />
                    Update Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                    <LogOut className="size-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          ) : (
            /* Unauthenticated state: Sign In / Sign Up */
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm px-2.5 sm:px-4"
                render={<Link href="/sign-in" />}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                className="text-xs sm:text-sm px-3 sm:px-4"
                render={<Link href="/sign-up" />}
              >
                Sign Up
              </Button>
            </div>
          )}

          {/* Mobile menu trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open navigation menu"
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>
                  <SiteLogo />
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 px-4 pb-6">
                <NavLinks pathname={pathname} orientation="mobile" />
                <Separator />
                {user ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        {user.image ? (
                          <AvatarImage src={user.image} alt={user.name} />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{user.name}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <RoleBadge role={user.role} />
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      render={
                        <Link href="/dashboard" onClick={closeMobileMenu} />
                      }
                    >
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      render={
                        <Link
                          href="/dashboard/profile"
                          onClick={closeMobileMenu}
                        />
                      }
                    >
                      <UserRoundPen className="size-4" />
                      Update Profile
                    </Button>
                    <Button variant="destructive" onClick={handleSignOut}>
                      <LogOut className="size-4" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      render={<Link href="/sign-in" onClick={closeMobileMenu} />}
                    >
                      Sign In
                    </Button>
                    <Button render={<Link href="/sign-up" onClick={closeMobileMenu} />}>
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
