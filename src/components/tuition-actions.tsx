"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getAuthHeaders } from "@/lib/api-token";
import {
  CircleDot,
  Loader2,
  Pencil,
  Power,
  Trash2,
} from "lucide-react";

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

export type ManageableTuition = {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: string;
  location: string;
  monthlyFee: number;
  daysPerWeek: number;
  description: string;
  approvalStatus: string;
  isActive: boolean;
};

/**
 * Tutor dashboard controls for one tuition post: edit, delete and
 * active/closed toggle. Pending posts can be edited or removed but only
 * approved listings can be opened or closed on the browse page.
 */
export function TuitionActions({ tuition }: { tuition: ManageableTuition }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState<"edit" | "delete" | "toggle" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const approved = tuition.approvalStatus === "approved";

  async function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy("edit");
    setError(null);
    try {
      const res = await fetch(`/api/tuitions/${tuition.id}`, {
        method: "PATCH",
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
      if (!res.ok) {
        setError(body.message ?? "Could not save your changes.");
        return;
      }
      setEditOpen(false);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function toggleActive() {
    setBusy("toggle");
    setError(null);
    try {
      const res = await fetch(`/api/tuitions/${tuition.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
        body: JSON.stringify({ action: "toggle-active" }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.message ?? "Could not update the listing.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setBusy("delete");
    setError(null);
    try {
      const res = await fetch(`/api/tuitions/${tuition.id}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.message ?? "Could not delete the post.");
        return;
      }
      setDeleteOpen(false);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <span className="flex flex-wrap items-center justify-end gap-2">
      <Dialog
        open={editOpen}
        onOpenChange={(next) => {
          setEditOpen(next);
          if (!next) setError(null);
        }}
      >
        <DialogTrigger
          render={
            <Button size="sm" variant="outline">
              <Pencil className="size-3.5" />
              Edit
            </Button>
          }
        />
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={submitEdit}>
            <DialogHeader>
              <DialogTitle>Edit Tuition Post</DialogTitle>
              <DialogDescription>
                Changes are saved immediately. Approved listings stay live
                after editing.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor={`et-title-${tuition.id}`}>Title</Label>
                <Input
                  id={`et-title-${tuition.id}`}
                  name="title"
                  required
                  defaultValue={tuition.title}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`et-subject-${tuition.id}`}>Subject</Label>
                <Input
                  id={`et-subject-${tuition.id}`}
                  name="subject"
                  required
                  defaultValue={tuition.subject}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`et-class-${tuition.id}`}>Class level</Label>
                <Input
                  id={`et-class-${tuition.id}`}
                  name="classLevel"
                  required
                  defaultValue={tuition.classLevel}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`et-mode-${tuition.id}`}>Mode</Label>
                <NativeSelect
                  id={`et-mode-${tuition.id}`}
                  name="mode"
                  defaultValue={tuition.mode}
                >
                  <NativeSelectOption value="Online">Online</NativeSelectOption>
                  <NativeSelectOption value="Offline">
                    Offline
                  </NativeSelectOption>
                </NativeSelect>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`et-location-${tuition.id}`}>Location</Label>
                <Input
                  id={`et-location-${tuition.id}`}
                  name="location"
                  defaultValue={tuition.location}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`et-fee-${tuition.id}`}>Monthly fee (৳)</Label>
                <Input
                  id={`et-fee-${tuition.id}`}
                  name="monthlyFee"
                  type="number"
                  min={0}
                  step={100}
                  required
                  defaultValue={tuition.monthlyFee}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`et-days-${tuition.id}`}>Days per week</Label>
                <Input
                  id={`et-days-${tuition.id}`}
                  name="daysPerWeek"
                  type="number"
                  min={1}
                  max={7}
                  required
                  defaultValue={tuition.daysPerWeek}
                />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor={`et-description-${tuition.id}`}>
                  Description
                </Label>
                <Textarea
                  id={`et-description-${tuition.id}`}
                  name="description"
                  rows={4}
                  required
                  minLength={20}
                  defaultValue={tuition.description}
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
              <Button type="submit" disabled={busy !== null}>
                {busy === "edit" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Pencil className="size-4" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Button
        size="sm"
        variant="outline"
        onClick={toggleActive}
        disabled={!approved || busy !== null}
        title={
          approved
            ? tuition.isActive
              ? "Close this listing"
              : "Open this listing"
            : "Only approved listings can be opened or closed"
        }
      >
        {busy === "toggle" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Power className="size-3.5" />
        )}
        {tuition.isActive ? "Close" : "Open"}
      </Button>

      <Dialog
        open={deleteOpen}
        onOpenChange={(next) => {
          setDeleteOpen(next);
          if (!next) setError(null);
        }}
      >
        <DialogTrigger
          render={
            <Button size="sm" variant="destructive">
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          }
        />
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this tuition post?</DialogTitle>
            <DialogDescription>
              &ldquo;{tuition.title}&rdquo; and all applications to it will be
              permanently removed. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
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
              Keep Post
            </DialogClose>
            <Button
              variant="destructive"
              onClick={remove}
              disabled={busy !== null}
            >
              {busy === "delete" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error && !editOpen && !deleteOpen && (
        <p role="alert" className="w-full text-right text-xs text-destructive">
          {error}
        </p>
      )}
      {!approved && (
        <span className="w-full text-right text-xs text-muted-foreground">
          <CircleDot className="mr-1 inline size-3" aria-hidden="true" />
          Awaiting admin approval — open/close appears once approved.
        </span>
      )}
    </span>
  );
}
