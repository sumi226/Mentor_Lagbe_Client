"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Crown, Loader2, Send } from "lucide-react";
import { getAuthHeaders } from "@/lib/api-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/image-uploader";

type PostTuitionFormProps = {
  isPro: boolean;
  postsUsed: number;
  freeLimit: number;
};

export function PostTuitionForm({ isPro, postsUsed, freeLimit }: PostTuitionFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [mode, setMode] = useState<"Online" | "Offline">("Online");
  const [location, setLocation] = useState("");
  const [monthlyFee, setMonthlyFee] = useState("1500");
  const [daysPerWeek, setDaysPerWeek] = useState("3");
  const [description, setDescription] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limitReached = !isPro && postsUsed >= freeLimit;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (limitReached) {
      setError(`Free Plan limit reached (${freeLimit} posts). Upgrade to Pro for unlimited posts.`);
      return;
    }

    if (!title.trim() || !subject.trim() || !classLevel.trim() || description.trim().length < 20) {
      setError("Please fill in title, subject, class level, and description (at least 20 characters).");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/tuitions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify({
          title: title.trim(),
          subject: subject.trim(),
          classLevel: classLevel.trim(),
          mode,
          location: location.trim(),
          monthlyFee: Number(monthlyFee) || 0,
          daysPerWeek: Number(daysPerWeek) || 3,
          description: description.trim(),
          bannerImage: bannerImage.trim(),
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (res.ok) {
        router.push("/dashboard/tutor/my-tuitions");
        router.refresh();
        return;
      }

      setError(body.message ?? "Could not post tuition.");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      {limitReached ? (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2 font-semibold">
            <Crown className="size-5" />
            Free Post Limit Reached ({postsUsed}/{freeLimit})
          </div>
          <p className="mt-1 text-sm text-amber-700/90 dark:text-amber-400">
            Free plan tutors can post up to {freeLimit} tuitions. Upgrade to Pro Tutor for unlimited posts & verified badge.
          </p>
          <Button
            render={<Link href="/pricing" />}
            className="mt-3 bg-amber-600 hover:bg-amber-700 text-white"
            size="sm"
          >
            Upgrade to Pro ($15)
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor="pt-title">Tuition Title *</Label>
          <Input
            id="pt-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Class 10 Higher Mathematics Batch"
            disabled={limitReached}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="pt-subject">Subject *</Label>
          <Input
            id="pt-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="e.g. Mathematics"
            disabled={limitReached}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="pt-class">Class Level *</Label>
          <Input
            id="pt-class"
            value={classLevel}
            onChange={(e) => setClassLevel(e.target.value)}
            required
            placeholder="e.g. Class 10 / HSC 1st Year"
            disabled={limitReached}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="pt-mode">Mode *</Label>
          <NativeSelect
            id="pt-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as "Online" | "Offline")}
            disabled={limitReached}
          >
            <NativeSelectOption value="Online">Online</NativeSelectOption>
            <NativeSelectOption value="Offline">Offline</NativeSelectOption>
          </NativeSelect>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="pt-location">Location {mode === "Offline" ? "*" : ""}</Label>
          <Input
            id="pt-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={mode === "Online" ? "Online (Google Meet/Zoom)" : "e.g. Dhanmondi, Dhaka"}
            disabled={limitReached}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="pt-fee">Monthly Fee (৳) *</Label>
          <Input
            id="pt-fee"
            type="number"
            min={0}
            step={100}
            value={monthlyFee}
            onChange={(e) => setMonthlyFee(e.target.value)}
            required
            disabled={limitReached}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="pt-days">Days per Week *</Label>
          <Input
            id="pt-days"
            type="number"
            min={1}
            max={7}
            value={daysPerWeek}
            onChange={(e) => setDaysPerWeek(e.target.value)}
            required
            disabled={limitReached}
          />
        </div>

        <div className="grid gap-1.5 sm:col-span-2">
          <ImageUploader
            label="Banner Image (uploaded via ImgBB API)"
            value={bannerImage}
            onChange={setBannerImage}
            hint="Upload a banner photo from your computer via ImgBB, or enter a direct image URL."
          />
        </div>

        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor="pt-description">Description *</Label>
          <Textarea
            id="pt-description"
            rows={5}
            required
            minLength={20}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed course description: syllabus breakdown, weekly schedule, study materials, prerequisites..."
            disabled={limitReached}
          />
          <p className="text-xs text-muted-foreground">{description.length} characters (minimum 20)</p>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || limitReached}>
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {submitting ? "Submitting for Approval…" : "Submit for Approval"}
        </Button>
      </div>
    </form>
  );
}
