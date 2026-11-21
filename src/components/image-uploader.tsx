"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, Loader2, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ImageUploaderProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
};

export function ImageUploader({ label, value, onChange, hint }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"file" | "url">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, WebP, etc.).");
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
        throw new Error(data.error || "Failed to upload to ImgBB");
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

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`cursor-pointer transition-colors ${
              mode === "file" ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Upload via ImgBB
          </button>
          <span className="text-muted-foreground">|</span>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`cursor-pointer transition-colors ${
              mode === "url" ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Image URL
          </button>
        </div>
      </div>

      {value ? (
        <div className="relative group overflow-hidden rounded-xl border border-border bg-muted/40 aspect-video max-h-48 flex items-center justify-center">
          <Image
            src={value}
            alt="Preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onChange("")}
              className="size-8 p-0"
              title="Remove image"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ) : mode === "file" ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-center"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-medium">Uploading to ImgBB...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UploadCloud className="size-5" />
              </div>
              <p className="text-xs font-semibold text-foreground">Click to upload image</p>
              <p className="text-[11px] text-muted-foreground">PNG, JPG, WebP via ImgBB API</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            type="url"
            placeholder="https://example.com/banner.jpg"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
