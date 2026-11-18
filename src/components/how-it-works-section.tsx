import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  Search,
  Send,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: UserPlus,
    title: "Create your account",
    text: "Students and tutors sign up in seconds and pick their role — free to join, no paperwork.",
  },
  {
    icon: Search,
    title: "Find the right match",
    text: "Students browse live listings, filtered by subject, class level, mode and monthly budget.",
  },
  {
    icon: Send,
    title: "Apply or post a batch",
    text: "Students apply with one click. Tutors post batches and admins approve every listing.",
  },
  {
    icon: GraduationCap,
    title: "Connect & learn",
    text: "Tutors respond to applications and classes begin — online or offline, on your schedule.",
  },
];

/**
 * 4-step visual workflow shown on the home page and the /how-it-works page.
 */
export function HowItWorksSection({ hideHeader = false }: { hideHeader?: boolean }) {
  return (
    <section id="how-it-works" className="bg-background py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {!hideHeader && (
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              How MentorLagbe Works
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              From search to first class in 4 steps
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Whether you&apos;re a student looking for the right tutor or a
              tutor looking for students — the flow is simple and transparent.
            </p>
          </div>
        )}

        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="relative rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-3.5 left-6 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow"
                >
                  {index + 1}
                </span>
                <Icon className="size-6 text-primary" aria-hidden="true" />
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </li>
            );
          })}
        </ol>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button render={<Link href="/tuitions" />}>
            Browse Tuitions
            <ArrowRight className="size-4" />
          </Button>
          <Button variant="outline" render={<Link href="/sign-up" />}>
            Join as a Tutor
          </Button>
        </div>
      </div>
    </section>
  );
}
