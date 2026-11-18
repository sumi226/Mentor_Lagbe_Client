"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

const ROLES = ["student", "tutor", "admin"] as const;

/**
 * Admin users page: changes a user's role via POST /api/admin/users.
 * The server blocks admins from changing their own role.
 */
export function RoleSelect({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function change(next: string) {
    if (next === currentRole) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: next }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.message ?? "Could not change the role.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="flex flex-col items-end gap-1">
      <span className="flex items-center gap-2">
        {busy && <Loader2 className="size-3.5 animate-spin text-primary" />}
        <NativeSelect
          aria-label="Change role"
          defaultValue={currentRole}
          disabled={busy}
          onChange={(event) => change(event.target.value)}
          className="w-32"
        >
          {ROLES.map((role) => (
            <NativeSelectOption key={role} value={role}>
              {role[0].toUpperCase() + role.slice(1)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </span>
      {error && (
        <p role="alert" className="max-w-48 text-right text-xs text-destructive">
          {error}
        </p>
      )}
    </span>
  );
}
