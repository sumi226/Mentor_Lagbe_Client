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
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How It Works" },
] as const;

const ROLE_BADGE_STYLES: Record<string, string> = {
  student: "bg-blue-100 text-blue-700 border-blue-200",
  tutor: "bg-emerald-100 text-emerald-700 border-emerald-200",
  admin: "bg-rose-100 text-rose-700 border-rose-200",
};

function isLinkActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
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
                  "block rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
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

function RoleBadge({ role }: { role?: string | null }) {
  const value = role ?? "student";
  return (
    <Badge
      variant="outline"
      className={cn("hidden capitalize sm:inline-flex", ROLE_BADGE_STYLES[value])}
    >
      {value}
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
    router.push("/");
    router.refresh();
  };

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
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
            <>
              {/* Authenticated state: avatar + name + role badge dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex items-center gap-2 rounded-full border bg-background py-1 pr-2 pl-1 shadow-sm transition-colors hover:bg-accent"
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
                  <span className="hidden max-w-28 truncate text-sm font-medium md:inline-block">
                    {user.name}
                  </span>
                  <RoleBadge role={user.role} />
                  <ChevronDown className="size-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="text-sm font-medium text-foreground">
                      {user.name}
                    </p>
                    <p className="truncate text-xs font-normal text-muted-foreground">
                      {user.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/dashboard" />}>
                    <LayoutDashboard />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/update-profile" />}>
                    <UserRoundPen />
                    Update Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                    <LogOut />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            /* Unauthenticated state: Sign In / Sign Up */
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" render={<Link href="/login" />}>
                Sign In
              </Button>
              <Button render={<Link href="/register" />}>Sign Up</Button>
            </div>
          )}

          {/* Mobile menu */}
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
                        <p className="truncate text-xs text-muted-foreground">
                          <span className="capitalize">{user.role ?? "student"}</span>
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      render={
                        <Link href="/dashboard" onClick={closeMobileMenu} />
                      }
                    >
                      <LayoutDashboard />
                      Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      render={
                        <Link
                          href="/update-profile"
                          onClick={closeMobileMenu}
                        />
                      }
                    >
                      <UserRoundPen />
                      Update Profile
                    </Button>
                    <Button variant="destructive" onClick={handleSignOut}>
                      <LogOut />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      render={<Link href="/login" onClick={closeMobileMenu} />}
                    >
                      Sign In
                    </Button>
                    <Button render={<Link href="/register" onClick={closeMobileMenu} />}>
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
