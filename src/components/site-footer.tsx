"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";

import { SiteLogo } from "@/components/site-logo";

/** App-shell routes that render their own full-height layout — no footer. */
const HIDDEN_ON = ["/dashboard", "/sign-in", "/sign-up", "/payment"];

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/tuitions", label: "Browse Tuitions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How It Works" },
];

const ACCOUNT_LINKS = [
  { href: "/sign-in", label: "Sign In" },
  { href: "/sign-up", label: "Sign Up" },
  { href: "/dashboard", label: "Dashboard" },
];

const CONTACT = [
  {
    icon: Mail,
    label: "hello@mentorlagbe.com",
    href: "mailto:hello@mentorlagbe.com",
  },
  { icon: Phone, label: "+880 1712-345678", href: "tel:+8801712345678" },
  {
    icon: MapPin,
    label: "Dhanmondi, Dhaka 1205, Bangladesh",
    href: "https://maps.google.com/?q=Dhanmondi,+Dhaka,+Bangladesh",
  },
] as const;

/**
 * Social profiles. The first entry is the official X mark (the new
 * logo) — lucide-react ships no brand icons, so these are inline
 * SVG paths instead of the legacy Twitter bird.
 */
const SOCIAL_LINKS = [
  {
    label: "MentorLagbe on X",
    href: "https://x.com/mentorlagbe",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    label: "MentorLagbe on Facebook",
    href: "https://www.facebook.com/mentorlagbe",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "MentorLagbe on YouTube",
    href: "https://www.youtube.com/@mentorlagbe",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
] as const;

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ href: string; label: string }>;
}) {
  return (
    <nav aria-label={title}>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Site footer: brand + tagline, quick navigation, account shortcuts,
 * contact details, social links (official X logo) and copyright.
 * Hidden on the app-shell routes (dashboard, auth, payment) which have
 * their own full-height layouts.
 */
export function SiteFooter() {
  const pathname = usePathname();
  const isHidden = HIDDEN_ON.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  if (isHidden) return null;

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + tagline + socials */}
          <div className="sm:col-span-2 lg:col-span-1">
            <SiteLogo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              MentorLagbe connects verified tutors with students for
              subject-wise tuition batches and 1-on-1 mentorship — online or
              offline.
            </p>
            <ul className="mt-5 flex items-center gap-2.5">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      className="size-4"
                    >
                      <path d={social.path} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <LinkColumn title="Quick Links" links={QUICK_LINKS} />
          <LinkColumn title="Account" links={ACCOUNT_LINKS} />

          {/* Contact */}
          <div>
            <h2 className="text-sm font-semibold text-foreground">Contact</h2>
            <ul className="mt-4 space-y-3">
              {CONTACT.map(({ icon: Icon, label, href }) => {
                const content = (
                  <span className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Icon
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span className="break-words">{label}</span>
                  </span>
                );
                return (
                  <li key={label}>
                    {href ? (
                      <a
                        href={href}
                        className="transition-colors hover:text-foreground"
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {year} MentorLagbe. All rights reserved.</p>
          <p>Online &amp; offline tuition — across Bangladesh.</p>
        </div>
      </div>
    </footer>
  );
}
