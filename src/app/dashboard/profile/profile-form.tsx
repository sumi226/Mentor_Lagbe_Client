"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, Save, UserRound } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Initial = {
  name: string;
  email: string;
  image: string;
  role: string;
};

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Profile update form backed by better-auth's updateUser client API. */
export function ProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [image, setImage] = useState(initial.image);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await authClient.updateUser({
        name: name.trim(),
        image: image.trim() || undefined,
      });
      if (error) {
        setMessage({
          type: "error",
          text: error.message ?? "Could not update your profile.",
        });
        return;
      }
      setMessage({ type: "success", text: "Profile updated successfully." });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Network error — please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      {/* Avatar preview */}
      <div className="flex items-center gap-4">
        {image ? (
          <Image
            src={image}
            alt="Avatar preview"
            width={64}
            height={64}
            className="size-16 rounded-full border border-border object-cover"
          />
        ) : (
          <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {getInitials(name)}
          </span>
        )}
        <div>
          <p className="font-semibold">{name || "Your name"}</p>
          <p className="text-sm capitalize text-muted-foreground">
            {initial.role} account
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div className="grid gap-1.5">
          <Label htmlFor="profile-name">Full name</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoComplete="name"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="profile-email">Email</Label>
          <Input
            id="profile-email"
            value={initial.email}
            readOnly
            disabled
          />
          <p className="text-xs text-muted-foreground">
            Contact support to change your login email.
          </p>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="profile-image">Avatar image URL</Label>
          <Input
            id="profile-image"
            type="url"
            value={image}
            onChange={(event) => setImage(event.target.value)}
            placeholder="https://example.com/avatar.png"
          />
          <p className="text-xs text-muted-foreground">
            Paste a direct image link, or leave it empty to use your initials.
          </p>
        </div>
      </div>

      {message && (
        <p
          role="alert"
          className={
            message.type === "success"
              ? "mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400"
              : "mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
          }
        >
          {message.text}
        </p>
      )}

      <Button type="submit" disabled={saving} className="mt-5">
        {saving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        {saving ? "Saving…" : "Save Changes"}
      </Button>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <UserRound className="size-3.5" aria-hidden="true" />
        Signed in as {initial.email}
      </p>
    </form>
  );
}
