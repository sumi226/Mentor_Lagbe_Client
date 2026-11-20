"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldAlert, Sparkles } from "lucide-react";
import { getAuthHeaders } from "@/lib/api-token";

type State =
  | { kind: "idle" }
  | { kind: "verifying" }
  | { kind: "confirmed"; plan: string }
  | { kind: "unpaid" }
  | { kind: "unconfigured" }
  | { kind: "error"; message: string };

/**
 * Runs once on /payment/success when Stripe appended
 * ?session_id={CHECKOUT_SESSION_ID}: confirms the payment server-side,
 * records the transaction as paid and upgrades the account to Pro.
 * Renders nothing when there is no session id (e.g. demo navigation).
 */
export function PaymentVerifier() {
  const [state, setState] = useState<State>({ kind: "idle" });

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id"
    );
    if (!sessionId) return;

    let cancelled = false;
    (async () => {
      setState({ kind: "verifying" });
      try {
        const res = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
          body: JSON.stringify({ sessionId }),
        });
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.status === 503) {
          setState({ kind: "unconfigured" });
        } else if (res.ok && body.ok) {
          setState({ kind: "confirmed", plan: String(body.plan ?? "student") });
        } else if (res.ok) {
          setState({ kind: "unpaid" });
        } else {
          setState({
            kind: "error",
            message: String(body.message ?? "Could not confirm the payment."),
          });
        }
      } catch {
        if (!cancelled) {
          setState({
            kind: "error",
            message: "Network error while confirming the payment.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind === "idle") return null;

  return (
    <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4 text-sm">
      {state.kind === "verifying" && (
        <p className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Confirming your payment with Stripe…
        </p>
      )}
      {state.kind === "confirmed" && (
        <p className="flex items-center justify-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
          <Sparkles className="size-4" />
          {state.plan === "tutor" ? "Pro Tutor" : "Pro Student"} activated —
          your Pro benefits are live.
        </p>
      )}
      {state.kind === "unpaid" && (
        <p className="flex items-center justify-center gap-2 text-muted-foreground">
          <ShieldAlert className="size-4" />
          This payment hasn&apos;t completed yet — you&apos;ll be upgraded once
          it clears.
        </p>
      )}
      {state.kind === "unconfigured" && (
        <p className="flex items-center justify-center gap-2 text-muted-foreground">
          <ShieldAlert className="size-4" />
          Stripe isn&apos;t configured yet, so there&apos;s nothing to confirm.
        </p>
      )}
      {state.kind === "error" && (
        <p
          role="alert"
          className="flex items-center justify-center gap-2 text-destructive"
        >
          <ShieldAlert className="size-4" />
          {state.message}
        </p>
      )}
    </div>
  );
}
