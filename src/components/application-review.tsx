"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Tutor dashboard: accept or reject a student application
 * (PATCH /api/applications). The server verifies the tutor owns the tuition.
 */
export function ApplicationReview({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"accept" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "accept" | "reject") {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.message ?? "Action failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(null);
    }
  }

  if (status !== "pending") return null;

  return (
    <span className="flex flex-col items-end gap-1">
      <span className="flex gap-2">
        <Button
          size="sm"
          onClick={() => act("accept")}
          disabled={busy !== null}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {busy === "accept" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Check className="size-3.5" />
          )}
          Accept
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => act("reject")}
          disabled={busy !== null}
        >
          {busy === "reject" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <X className="size-3.5" />
          )}
          Reject
        </Button>
      </span>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </span>
  );
}
