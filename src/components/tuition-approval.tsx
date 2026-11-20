"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { getAuthHeaders } from "@/lib/api-token";

import { Button } from "@/components/ui/button";

/** Approve / reject buttons for pending listings (admin dashboard only). */
export function TuitionApproval({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "approve" | "reject") {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch("/api/admin/tuitions", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
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

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => act("approve")}
          disabled={busy !== null}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {busy === "approve" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Check className="size-3.5" />
          )}
          Approve
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
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
