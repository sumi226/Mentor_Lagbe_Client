import Link from "next/link";
import { XCircle, ArrowRight, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = { title: "Payment Cancelled" };

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-rose-500/10">
          <XCircle
            className="size-8 text-rose-600 dark:text-rose-400"
            aria-hidden="true"
          />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">
          Payment cancelled
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          No charge was made — your card was not billed. You can retry the
          subscription whenever you&apos;re ready.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Button render={<Link href="/pricing" />}>
            <CreditCard className="size-4" />
            Try Again
            <ArrowRight className="size-4" />
          </Button>
          <Button variant="outline" render={<Link href="/" />}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
