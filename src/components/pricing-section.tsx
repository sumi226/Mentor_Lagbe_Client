"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Check,
  CreditCard,
  GraduationCap,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { FREE_FEATURES, PRO_PLANS, type PlanKey } from "@/lib/plans";
import { getAuthHeaders } from "@/lib/api-token";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AUDIENCES: { key: PlanKey; label: string; icon: typeof Users }[] = [
  { key: "student", label: "For Students", icon: GraduationCap },
  { key: "tutor", label: "For Tutors", icon: Users },
];

export function PricingSection({ hideHeader = false }: { hideHeader?: boolean }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [audience, setAudience] = useState<PlanKey>("student");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const plan = PRO_PLANS[audience];
  const freeFeatures = FREE_FEATURES[audience];

  async function subscribe() {
    setNotice(null);
    if (!session) {
      router.push("/sign-in");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
        body: JSON.stringify({ plan: audience }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }
      setNotice(
        data.message ?? "Could not start checkout. Please try again."
      );
    } catch {
      setNotice("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="pricing"
      className="border-y border-border bg-muted/40 py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {!hideHeader && (
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              Pricing
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Free to start. Pro when you&apos;re ready.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Core features stay free forever. Upgrade to a Pro plan to remove
              limits and get priority visibility.
            </p>
          </div>
        )}

        {/* Audience toggle */}
        <div
          className="mx-auto mt-8 flex w-fit rounded-full border border-border bg-background p-1"
          role="tablist"
          aria-label="Choose audience"
        >
          {AUDIENCES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={audience === key}
              onClick={() => {
                setAudience(key);
                setNotice(null);
              }}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                audience === key
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Plans */}
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 lg:grid-cols-2">
          {/* Free */}
          <div className="flex flex-col rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">
            <h3 className="text-lg font-semibold">Free</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Everything you need to get started.
            </p>
            <p className="mt-5 text-4xl font-bold tracking-tight">
              $0
              <span className="text-base font-medium text-muted-foreground">
                /month
              </span>
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              className="mt-8 w-full"
              render={<Link href="/sign-up" />}
            >
              Get Started Free
            </Button>
          </div>

          {/* Pro */}
          <div className="relative flex flex-col rounded-2xl border-2 border-primary bg-background p-6 shadow-lg sm:p-8">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
              Most Popular
            </span>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                {audience === "student" ? "For Students" : "For Tutors"}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
            <p className="mt-5 text-4xl font-bold tracking-tight text-primary">
              {plan.priceLabel}
              <span className="text-base font-medium text-muted-foreground">
                /month
              </span>
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="mt-8 w-full" onClick={subscribe} disabled={loading}>
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CreditCard className="size-4" />
              )}
              {loading ? "Redirecting…" : "Subscribe with Stripe"}
            </Button>
            {notice && (
              <p
                role="alert"
                className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-600 dark:text-amber-400"
              >
                {notice}
              </p>
            )}
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-xs text-muted-foreground">
          Secure payments processed by Stripe. Subscriptions renew monthly and can
          be cancelled anytime.
        </p>
      </div>
    </section>
  );
}
