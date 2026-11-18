import Image from "next/image";
import { SiteLogo } from "@/components/site-logo";
import { cn } from "@/lib/utils";

/**
 * Split-screen shell for the auth pages: brand panel on the left,
 * form on the right. Each page passes its own visual —
 * /sign-in uses public/image/sign_in.jpg, /sign-up uses
 * public/image/sign_up.jpg.
 */
export function AuthShell({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  children,
  footer,
  className,
}: {
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-slate-900/10" />
        <div className="absolute inset-x-0 bottom-0 p-10 text-white">
          <blockquote className="max-w-md text-2xl font-semibold leading-snug text-balance">
            “The right mentor doesn’t just teach a subject — they change how a
            student learns.”
          </blockquote>
          <p className="mt-3 text-sm text-white/70">
            Join thousands of students and tutors already on MentorLagbe.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className={cn("w-full max-w-sm", className)}>
          <SiteLogo className="mb-8 lg:hidden" />
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
          {footer ? <div className="mt-6 text-sm">{footer}</div> : null}
        </div>
      </div>
    </section>
  );
}
