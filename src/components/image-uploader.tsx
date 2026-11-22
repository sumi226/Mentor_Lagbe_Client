"use client";

import { useState, useRef, type DragEvent } from "react";
import Image from "next/image";
import { UploadCloud, Loader2, X, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type ImageUploaderProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  disabled?: boolean;
};

export function ImageUploader({
  label,
  value,
  onChange,
  hint,
  disabled = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, JPEG, WebP).");
      return;
    }

    // 10MB limit check
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size exceeds 10MB. Please choose a smaller image.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload/imgbb", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to upload image via ImgBB");
      }

      onChange(data.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!disabled && !uploading) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">{label}</Label>
        {value && !uploading && (
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
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />

      {value ? (
        <div className="relative group overflow-hidden rounded-xl border border-border bg-muted/40 aspect-[16/7] max-h-56 flex items-center justify-center shadow-sm">
          {/* Support both hosted and data URLs */}
          {value.startsWith("data:") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Banner Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={value}
              alt="Banner Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
              unoptimized={value.startsWith("data:")}
            />
          )}

          {/* Action overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 p-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              className="h-8 text-xs font-medium shadow"
            >
              <RefreshCw className="size-3.5 mr-1.5" />
              Change Image
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onChange("")}
              disabled={disabled || uploading}
              className="h-8 text-xs font-medium shadow"
            >
              <X className="size-3.5 mr-1.5" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`cursor-pointer border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2.5 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary/10 scale-[0.99]"
              : "border-border hover:border-primary/50 hover:bg-primary/5 bg-card"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className="size-7 animate-spin text-primary" />
              <p className="text-sm text-foreground font-semibold">
                Uploading image to ImgBB...
              </p>
              <p className="text-xs text-muted-foreground">
                Processing file, please wait a moment
              </p>
            </div>
          ) : (
            <>
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                <UploadCloud className="size-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Click to browse or drag & drop image file
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Supports PNG, JPG, JPEG, WebP up to 10MB (Direct ImgBB API Upload)
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-1 text-xs"
                disabled={disabled}
              >
                Choose File from Computer
              </Button>
            </>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
