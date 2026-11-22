"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, type FormEvent, type DragEvent } from "react";
import {
  Loader2,
  Save,
  UploadCloud,
  UserRound,
  X,
  Camera,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

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

/** Profile update form with direct ImgBB file upload (no URL pasting). */
export function ProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [image, setImage] = useState(initial.image);
  const [phone, setPhone] = useState(initial.phone);
  const [bio, setBio] = useState(initial.bio);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function uploadAvatarFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file (PNG, JPG, JPEG, WebP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Image size exceeds 8MB. Please choose a smaller image.");
      return;
    }

    setUploadingImage(true);
    setUploadError(null);
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
      setMessage({
        type: "success",
        text: "Profile picture uploaded directly via ImgBB! Click 'Save Changes' to update.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploadError(msg);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatarFile(file);
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!uploadingImage) setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (uploadingImage) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadAvatarFile(file);
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
      {/* Direct ImgBB File Upload Section */}
      <div className="space-y-3 pb-6 border-b border-border">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">
            Profile Picture (Direct Upload via ImgBB API)
          </Label>
          {image && !uploadingImage && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="size-3.5" />
              Uploaded via ImgBB
            </span>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={uploadingImage}
        />

        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar Preview */}
          <div className="relative group shrink-0">
            {image ? (
              <div className="relative size-24 rounded-full overflow-hidden border-2 border-primary/30 shadow-md">
                {image.startsWith("data:") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt="Avatar preview"
                    className="size-full object-cover"
                  />
                ) : (
                  <Image
                    src={image}
                    alt="Avatar preview"
                    width={96}
                    height={96}
                    className="size-full object-cover"
                    unoptimized={image.startsWith("data:")}
                  />
                )}
                {/* Remove button on hover */}
                <button
                  type="button"
                  onClick={() => setImage("")}
                  className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove avatar"
                  disabled={uploadingImage}
                >
                  <X className="size-5" />
                  <span className="text-[10px] mt-0.5">Remove</span>
                </button>
              </div>
            ) : (
              <div className="size-24 rounded-full bg-primary/10 border-2 border-dashed border-primary/40 flex flex-col items-center justify-center text-primary shadow-inner">
                <span className="text-2xl font-bold">{getInitials(name)}</span>
                <Camera className="size-4 mt-0.5 text-primary/70" />
              </div>
            )}
          </div>

          {/* Direct File Dropzone */}
          <div
            onClick={() => !uploadingImage && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex-1 w-full cursor-pointer border-2 border-dashed rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left transition-all ${
              isDragging
                ? "border-primary bg-primary/10 scale-[0.99]"
                : "border-border hover:border-primary/50 hover:bg-primary/5 bg-background/50"
            }`}
          >
            {uploadingImage ? (
              <div className="flex items-center gap-3 py-2 mx-auto sm:mx-0">
                <Loader2 className="size-5 animate-spin text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Uploading image to ImgBB...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Direct API upload in progress
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <UploadCloud className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {image ? "Replace Profile Picture" : "Choose Image File"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Click to browse or drag & drop (PNG, JPG, WebP)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs pointer-events-none"
                  >
                    {image ? (
                      <>
                        <RefreshCw className="size-3 mr-1" />
                        Change Photo
                      </>
                    ) : (
                      <>
                        <UploadCloud className="size-3 mr-1" />
                        Upload File
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {uploadError && (
          <p role="alert" className="text-xs font-medium text-destructive mt-1">
            {uploadError}
          </p>
        )}
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
        Signed in as {initial.email} ({initial.role})
      </p>
    </form>
  );
}
