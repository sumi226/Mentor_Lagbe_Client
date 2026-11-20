"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, LogIn, Send, ShieldAlert } from "lucide-react";
import { getAuthHeaders } from "@/lib/api-token";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/** Session info resolved on the server (detail page) so the correct state
 *  renders immediately without a client-side fetch flash. */
export type ApplyViewer = {
  name: string;
  email: string;
  role: string;
};

/**
 * "Apply for Tuition" entry point. The apply flow is only available to
 * signed-in students — other roles and guests see an explanation instead.
 * The server enforces the same rule in POST /api/applications.
 */
export function ApplyTuitionButton({
  tuitionId,
  tutorName,
  viewer,
}: {
  tuitionId: string;
  tutorName: string;
  viewer: ApplyViewer | null;
}) {
  const router = useRouter();
  const user = viewer;
  const role = user?.role ?? "student";

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  /* Guest → prompt to sign in */
  if (!user) {
    return (
      <div className="rounded-xl border border-border bg-muted/40 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Sign in with a student account to apply for this tuition.
        </p>
        <Button className="mt-3 w-full" render={<Link href="/sign-in" />}>
          <LogIn className="size-4" />
          Sign In to Apply
        </Button>
      </div>
    );
  }

  /* Tutor / admin → application is students-only */
  if (role !== "student") {
    return (
      <div className="rounded-xl border border-border bg-muted/40 p-4">
        <p className="flex items-center gap-2 text-sm font-medium">
          <ShieldAlert className="size-4 shrink-0 text-amber-500" />
          Students only
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Applications are available to student accounts. You&apos;re signed in
          as a <span className="capitalize">{role}</span>.
        </p>
      </div>
    );
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setError(null);
      setDone(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
        body: JSON.stringify({
          tuitionId,
          name: String(data.get("name") ?? ""),
          phone: String(data.get("phone") ?? ""),
          preferredSchedule: String(data.get("schedule") ?? ""),
          studentNote: String(data.get("message") ?? ""),
        }),
      });
      const body = await res.json().catch(() => ({}));

      if (res.ok) {
        setDone(true);
        return;
      }
      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }
      setError(body.message ?? "Could not submit your application.");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button className="w-full">
            <Send className="size-4" />
            Apply for Tuition
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        {done ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-500" />
                Application sent!
              </DialogTitle>
              <DialogDescription>
                Your application for {tutorName}&apos;s tuition has been
                submitted. You&apos;ll be contacted at{" "}
                <span className="font-medium text-foreground">
                  {user.email}
                </span>
                .
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button type="button" />}>Done</DialogClose>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle>Apply for Tuition</DialogTitle>
              <DialogDescription>
                Introduce yourself to {tutorName}. Students only — this goes
                straight to the tutor&apos;s dashboard.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-3">
              <div className="grid gap-1.5">
                <Label htmlFor="apply-name">Full name</Label>
                <Input
                  id="apply-name"
                  name="name"
                  defaultValue={user.name}
                  required
                  autoComplete="name"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="apply-email">Email</Label>
                <Input
                  id="apply-email"
                  name="email"
                  defaultValue={user.email}
                  readOnly
                  disabled
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="apply-phone">Phone (optional)</Label>
                <Input
                  id="apply-phone"
                  name="phone"
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  autoComplete="tel"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="apply-schedule">Preferred Schedule</Label>
                <Input
                  id="apply-schedule"
                  name="schedule"
                  required
                  placeholder="e.g. Sat–Tue, 5:00–7:00 PM"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="apply-message">Message</Label>
                <Textarea
                  id="apply-message"
                  name="message"
                  rows={4}
                  required
                  minLength={10}
                  placeholder="Why are you a good fit? Mention your curriculum, availability and goals…"
                />
              </div>
              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
                >
                  {error}
                </p>
              )}
            </div>

            <DialogFooter className="mt-4">
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                {submitting ? "Submitting…" : "Submit Application"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
