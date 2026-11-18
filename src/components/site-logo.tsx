import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The official MentorLagbe brand mark (public/image/Logo.png).
 * Reuse this component everywhere (navbar, home hero, footer) so the
 * logo always renders at the same style and size.
 */
export function SiteLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="MentorLagbe – go to home"
      className={cn("inline-flex items-center", className)}
    >
      <Image
        src="/image/Logo.png"
        alt="MentorLagbe"
        width={120}
        height={42}
        preload
        className="h-10 w-auto dark:rounded-xl dark:bg-white dark:px-2.5 dark:py-1.5"
      />
    </Link>
  );
}
