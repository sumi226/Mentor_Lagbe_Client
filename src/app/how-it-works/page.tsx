import type { Metadata } from "next";
import Link from "next/link";

import { HowItWorksSection } from "@/components/how-it-works-section";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how students find tutors, how tutors post batches, and how admins keep MentorLagbe safe — in four simple steps.",
};

export default function HowItWorksPage() {
  return (
    <div className="bg-background">
      <div className="border-b border-border bg-gradient-to-b from-primary/10 to-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-foreground">How It Works</span>
          </nav>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            How MentorLagbe Works
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            A simple, four-step journey from finding a tutor — or posting your
            first batch as one.
          </p>
        </div>
      </div>

      <HowItWorksSection hideHeader />
    </div>
  );
}
