import {
  Atom,
  BookOpen,
  Code2,
  Globe,
  Layers,
  Monitor,
  Quote,
  Sigma,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";

import { CountUp } from "@/components/count-up";
import { getPlatformStats, getSubjectCounts } from "@/lib/tuitions";

const POPULAR_SUBJECTS: { name: string; icon: LucideIcon; blurb: string }[] = [
  { name: "Mathematics", icon: Sigma, blurb: "Algebra, geometry & Olympiad prep" },
  { name: "Physics", icon: Atom, blurb: "Concepts, numericals & board prep" },
  { name: "Programming", icon: Code2, blurb: "CSE fundamentals, Python & DSA" },
  { name: "IELTS", icon: Globe, blurb: "Band 7+ speaking & writing" },
];

const TESTIMONIALS = [
  {
    quote:
      "Found a maths tutor for my daughter in under an hour. The subject and budget filters made it so easy.",
    name: "Sadia Rahman",
    role: "Student · Class 9 parent",
    initials: "SR",
  },
  {
    quote:
      "I posted my physics batch on Monday and had four student applications by Wednesday. Smooth approval too.",
    name: "Tanvir Hasan",
    role: "Tutor · Physics, HSC",
    initials: "TH",
  },
  {
    quote:
      "The Pro badge got me priority responses from tutors — my IELTS preparation finally has a schedule.",
    name: "Rafi Ahmed",
    role: "Pro Student · IELTS",
    initials: "RA",
  },
];

const STATS: {
  key: "tuitions" | "subjects" | "tutors" | "online";
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "tuitions", label: "Active Tuitions", icon: BookOpen },
  { key: "subjects", label: "Subjects Covered", icon: Layers },
  { key: "tutors", label: "Expert Tutors", icon: Users },
  { key: "online", label: "Online Classes", icon: Monitor },
];

/**
 * Home page: live platform statistics + popular subjects + testimonials.
 * Counters animate (CountUp) when scrolled into view.
 */
export async function StatsTestimonials() {
  const [stats, subjectCounts] = await Promise.all([
    getPlatformStats(),
    getSubjectCounts(POPULAR_SUBJECTS.map((s) => s.name)),
  ]);

  return (
    <section className="border-y border-border bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Star className="size-3.5" />
            Platform Statistics
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted by students & tutors across Bangladesh
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Live numbers straight from our database — plus what the community
            says about learning on MentorLagbe.
          </p>
        </div>

        {/* Live counters */}
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map(({ key, label, icon: Icon }) => (
            <div
              key={key}
              className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm"
            >
              <Icon
                className="mx-auto size-5 text-primary"
                aria-hidden="true"
              />
              <p className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                <CountUp value={stats[key]} />
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Popular subjects */}
        <div className="mt-12">
          <h3 className="text-center text-lg font-semibold">
            Top subject categories
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {POPULAR_SUBJECTS.map(({ name, icon: Icon, blurb }) => {
              const count = subjectCounts[name] ?? 0;
              return (
                <div
                  key={name}
                  className="rounded-2xl border border-border bg-background p-5 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="size-5 text-primary" aria-hidden="true" />
                    </span>
                    <span
                      className={
                        count > 0
                          ? "rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                          : "rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                      }
                    >
                      {count > 0 ? `${count} live` : "In demand"}
                    </span>
                  </div>
                  <p className="mt-3 font-semibold">{name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-12">
          <h3 className="text-center text-lg font-semibold">
            What our community says
          </h3>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <Quote
                  className="size-5 text-primary/60"
                  aria-hidden="true"
                />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {t.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {t.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {t.role}
                    </span>
                  </span>
                  <span
                    className="ml-auto flex shrink-0 gap-0.5"
                    aria-label="5 out of 5 stars"
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="size-3.5 fill-primary text-primary"
                        aria-hidden="true"
                      />
                    ))}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
