"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, type FormEvent } from "react";
import { Loader2, Save, UploadCloud, UserRound, X } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { fetchAuthToken } from "@/lib/api-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Initial = {
  name: string;
  email: string;
  image: string;
  role: string;
  phone: string;
  bio: string;
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
  const [phone, setPhone] = useState(initial.phone);
  const [bio, setBio] = useState(initial.bio);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload/imgbb", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to upload avatar to ImgBB");
      }

      setImage(data.url);
      setMessage({ type: "success", text: "Profile picture uploaded via ImgBB!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setMessage({ type: "error", text: msg });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await authClient.updateUser({
        name: name.trim(),
        image: image.trim() || undefined,
        phone: phone.trim(),
        bio: bio.trim(),
      });
      if (error) {
        setMessage({
          type: "error",
          text: error.message ?? "Could not update your profile.",
        });
        return;
      }
      setMessage({ type: "success", text: "Profile updated successfully." });
      await fetchAuthToken(true);
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
      {/* Avatar preview & ImgBB Upload */}
      <div className="flex flex-wrap items-center gap-4">
        {image ? (
          <div className="relative">
            <Image
              src={image}
              alt="Avatar preview"
              width={72}
              height={72}
              className="size-18 rounded-full border border-border object-cover"
            />
            <button
              type="button"
              onClick={() => setImage("")}
              className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 shadow hover:bg-destructive/90"
              title="Remove avatar"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <span className="flex size-18 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {getInitials(name)}
          </span>
        )}
        <div className="flex-1 min-w-[200px]">
          <p className="font-semibold text-lg">{name || "Your name"}</p>
          <p className="text-sm capitalize text-muted-foreground">
            {initial.role} account
          </p>
          <div className="mt-2 flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploadingImage}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="text-xs"
            >
              {uploadingImage ? (
                <Loader2 className="size-3.5 animate-spin mr-1" />
              ) : (
                <UploadCloud className="size-3.5 mr-1" />
              )}
              {uploadingImage ? "Uploading to ImgBB…" : "Upload Photo (ImgBB)"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
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
          <Label htmlFor="profile-image">Avatar Image URL (or use ImgBB upload above)</Label>
          <Input
            id="profile-image"
            type="url"
            value={image}
            onChange={(event) => setImage(event.target.value)}
            placeholder="https://example.com/avatar.png"
          />
          <p className="text-xs text-muted-foreground">
            Upload an image above via ImgBB API, paste a direct link, or leave empty.
          </p>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="profile-phone">Phone</Label>
          <Input
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="01XXXXXXXXX"
            autoComplete="tel"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="profile-bio">Bio</Label>
          <Textarea
            id="profile-bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={4}
            maxLength={500}
            placeholder="A short introduction — subjects you teach or want to learn, curriculum, availability…"
          />
          <p className="text-xs text-muted-foreground">{bio.length}/500 characters</p>
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

      <Button type="submit" disabled={saving || uploadingImage} className="mt-5">
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
