import type { Metadata } from "next";
import Link from "next/link";

import { PricingSection } from "@/components/pricing-section";

export const metadata: Metadata = {
  title: "Pricing & Pro Plans",
  description:
    "Free vs Pro plans for students and tutors on MentorLagbe — subscribe securely with Stripe.",
};

export default function PricingPage() {
  return (
    <div className="bg-background">
      <div className="border-b border-border bg-gradient-to-b from-primary/10 to-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-foreground">Pricing</span>
          </nav>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Pricing & Pro Plans
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Compare the Free and Pro plans for students and tutors, then
            upgrade securely with Stripe whenever you&apos;re ready.
          </p>
        </div>
      </div>

      <PricingSection hideHeader />
    </div>
  );
}
