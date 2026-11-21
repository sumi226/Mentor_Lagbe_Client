import type { Metadata } from "next";
import Link from "next/link";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "About MentorLagbe & How It Works",
  description:
    "Learn about MentorLagbe — Bangladesh's premier role-based tuition management platform connecting verified tutors with students for 1-on-1 mentorship.",
};

const FEATURES = [
  {
    title: "Verified Mentors & Tutors",
    description:
      "All tutors on MentorLagbe are thoroughly vetted and approved by platform administrators before their batches go live.",
  },
  {
    title: "Three Distinct Dashboards",
    description:
      "Tailored experiences for Students (application tracking), Tutors (batch management & applicant reviews), and Admins (platform oversight).",
  },
  {
    title: "Online & Offline Flexibility",
    description:
      "Find home tutors near your location in Dhaka and across Bangladesh, or connect via online 1-on-1 video sessions.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="border-b border-border bg-gradient-to-b from-primary/10 to-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-foreground">About & How It Works</span>
          </nav>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              About MentorLagbe
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Trusted Tuition Platform
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            MentorLagbe connects students and parents with top-tier tutors across
            Bangladesh. Whether you need Class 9 Math, HSC Physics, or English language
            coaching, finding the right mentor has never been simpler.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button render={<Link href="/tuitions" />}>
              Browse Tuitions
              <ArrowRight className="size-4" />
            </Button>
            <Button variant="outline" render={<Link href="/pricing" />}>
              Pricing & Plans
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CheckCircle2 className="size-5" />
              </div>
              <h2 className="mt-4 text-base font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <HowItWorksSection />
    </div>
  );
}
