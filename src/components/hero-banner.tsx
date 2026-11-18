import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  GraduationCap,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const TRUST_POINTS = [
  { icon: ShieldCheck, label: "Verified tutors" },
  { icon: GraduationCap, label: "All subjects & classes" },
  { icon: Users, label: "Online & offline" },
] as const;

/**
 * Home hero banner: headline, search bar that submits to Browse Tuitions
 * (/tuitions?search=...), a secondary CTA, and the hero visual
 * (public/image/hero.jpg). Sits on the brand orange (theme --primary)
 * with a soft dark scrim so white copy stays readable.
 */
export function HeroBanner() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-primary"
    >
      {/* Dark scrim keeps white copy readable over the brand orange */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-black/30 to-black/50"
      />
      {/* Soft brand glow behind the content */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-24 size-[28rem] rounded-full bg-white/20 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
        {/* ---------- Copy + search ---------- */}
        <div className="flex max-w-xl flex-col items-start gap-6">
          <span className="inline-flex items-center rounded-full border border-white/25 bg-black/30 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white">
            Tuition &amp; 1-on-1 mentorship — in one place
          </span>

          <h1
            id="hero-heading"
            className="text-4xl font-bold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl"
          >
            Find Your Ideal{" "}
            <span className="box-decoration-clone rounded-lg bg-black/25 px-2 py-0.5">
              Tutor or Mentorship Batch
            </span>{" "}
            Today
          </h1>

          <p className="max-w-lg text-pretty text-base text-white/90 sm:text-lg">
            Search approved tuition posts by subject, class, and budget — or
            book a mentor who fits your goals. Online or offline, it starts
            here.
          </p>

          {/* Plain GET form: submits straight to /tuitions?search=... */}
          <form action="/tuitions" method="get" className="w-full">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="hero-search" className="sr-only">
                Search tuitions by subject or class
              </label>
              <Input
                id="hero-search"
                name="search"
                type="search"
                placeholder="e.g. Class 9 Math, Physics, English..."
                className="h-12 flex-1 rounded-xl border-transparent bg-white px-4 text-slate-900 shadow-sm placeholder:text-slate-500 md:text-sm dark:bg-white"
              />
              <Button
                type="submit"
                className="h-12 shrink-0 rounded-xl px-6 shadow-lg shadow-black/25"
              >
                <Search />
                Search
              </Button>
            </div>
          </form>

          <Button
            variant="outline"
            render={<Link href="/tuitions" />}
            className="h-11 rounded-xl border-white/25 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white dark:border-white/25 dark:bg-transparent dark:hover:bg-white/10 dark:hover:text-white"
          >
            Browse All Tuitions
            <ArrowRight />
          </Button>

          <ul className="flex flex-wrap gap-x-6 gap-y-3 pt-1 text-sm text-white/85">
            {TRUST_POINTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* ---------- Visual ---------- */}
        <div className="relative">
          {/* Offset frame adds depth behind the image card */}
          <div
            aria-hidden="true"
            className="absolute inset-0 hidden translate-x-4 translate-y-4 rounded-3xl border-2 border-white/40 lg:block"
          />

          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/40 ring-1 ring-white/10 lg:aspect-[5/4]">
            <Image
              src="/image/hero.jpg"
              alt="An online tuition session in progress on a laptop screen, with a coffee mug on the desk"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              loading="eager"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent"
            />
          </div>

          {/* Floating highlight card */}
          <div className="absolute -bottom-5 left-4 hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/95 px-4 py-3 shadow-xl sm:flex">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </span>
            <div className="text-sm leading-tight">
              <p className="font-semibold text-slate-900">1-on-1 mentorship</p>
              <p className="text-slate-500">
                Guidance that fits your schedule
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
