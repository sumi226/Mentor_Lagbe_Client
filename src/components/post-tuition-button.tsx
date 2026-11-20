"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, Plus, Send } from "lucide-react";
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
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

/**
 * Tutor-only: posts a new tuition batch. Created as "pending" and goes
 * live on /tuitions after an admin approves it.
 */
export function PostTuitionButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/tuitions", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
        body: JSON.stringify({
          title: String(data.get("title") ?? ""),
          subject: String(data.get("subject") ?? ""),
          classLevel: String(data.get("classLevel") ?? ""),
          mode: String(data.get("mode") ?? "Online"),
          location: String(data.get("location") ?? ""),
          monthlyFee: Number(data.get("monthlyFee") ?? 0),
          daysPerWeek: Number(data.get("daysPerWeek") ?? 3),
          description: String(data.get("description") ?? ""),
        }),
      });
      const body = await res.json().catch(() => ({}));

      if (res.ok) {
        setOpen(false);
        form.reset();
        router.refresh();
        return;
      }
      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }
      setError(body.message ?? "Could not post the batch.");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <DialogTrigger
        render={
          <Button>
            <Plus className="size-4" />
            Post New Tuition
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Post New Tuition</DialogTitle>
            <DialogDescription>
              Your batch is sent to an admin for approval before it appears on
              the browse page.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="pt-title">Title</Label>
              <Input
                id="pt-title"
                name="title"
                required
                placeholder="e.g. Class 10 English Grammar Batch"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pt-subject">Subject</Label>
              <Input
                id="pt-subject"
                name="subject"
                required
                placeholder="e.g. English"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pt-class">Class level</Label>
              <Input
                id="pt-class"
                name="classLevel"
                required
                placeholder="e.g. Class 10"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pt-mode">Mode</Label>
              <NativeSelect id="pt-mode" name="mode" defaultValue="Online">
                <NativeSelectOption value="Online">Online</NativeSelectOption>
                <NativeSelectOption value="Offline">Offline</NativeSelectOption>
              </NativeSelect>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pt-location">Location</Label>
              <Input
                id="pt-location"
                name="location"
                placeholder="Online or area name"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pt-fee">Monthly fee (৳)</Label>
              <Input
                id="pt-fee"
                name="monthlyFee"
                type="number"
                min={0}
                step={100}
                required
                defaultValue={1500}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pt-days">Days per week</Label>
              <Input
                id="pt-days"
                name="daysPerWeek"
                type="number"
                min={1}
                max={7}
                required
                defaultValue={3}
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="pt-description">Description</Label>
              <Textarea
                id="pt-description"
                name="description"
                rows={4}
                required
                minLength={20}
                placeholder="Syllabus, teaching style, schedule, requirements…"
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
            >
              {error}
            </p>
          )}

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
              {submitting ? "Submitting…" : "Submit for Approval"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
