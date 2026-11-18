import Link from "next/link";
import { CheckCircle2, ArrowRight, CreditCard, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = { title: "Payment Success" };

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2
            className="size-8 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">
          Payment successful!
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Your MentorLagbe Pro subscription has been confirmed. Your Pro
          benefits are now active on your account.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Button render={<Link href="/dashboard" />}>
            <LayoutDashboard className="size-4" />
            Go to My Dashboard
            <ArrowRight className="size-4" />
          </Button>
          <Button variant="outline" render={<Link href="/pricing" />}>
            <CreditCard className="size-4" />
            Back to Pricing
          </Button>
        </div>

        <p className="mt-5 text-xs text-muted-foreground">
          A receipt has been sent to your email by Stripe.
        </p>
      </div>
    </div>
  );
}
