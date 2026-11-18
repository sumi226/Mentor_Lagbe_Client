"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient, type UserRole } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { BookOpen, CheckCircle2, LoaderCircle, Presentation } from "lucide-react";

const ROLE_OPTIONS: {
  value: Exclude<UserRole, "admin">;
  label: string;
  description: string;
  icon: typeof BookOpen;
}[] = [
  {
    value: "student",
    label: "Student",
    description: "Find tutors, apply for batches, and book 1-on-1 sessions.",
    icon: BookOpen,
  },
  {
    value: "tutor",
    label: "Tutor",
    description: "Post tuition batches and manage incoming applications.",
    icon: Presentation,
  },
];

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Exclude<UserRole, "admin">>("student");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signUpError } = await authClient.signUp.email({
      name,
      email,
      password,
      role,
    });

    if (signUpError) {
      setError(
        signUpError.message ?? "Something went wrong. Please try again."
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Role picker */}
      <div className="flex flex-col gap-1.5">
        <Label>I want to join as</Label>
        <div className="grid grid-cols-2 gap-2">
          {ROLE_OPTIONS.map((option) => {
            const selected = role === option.value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setRole(option.value)}
                aria-pressed={selected}
                className={cn(
                  "flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/40"
                    : "border-border hover:bg-accent"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg",
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  {selected ? (
                    <CheckCircle2 className="size-4 text-primary" />
                  ) : null}
                </div>
                <span className="text-sm font-semibold">{option.label}</span>
                <span className="text-xs leading-snug text-muted-foreground">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="e.g. Rahim Ahmed"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          autoComplete="name"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={loading} className="mt-2">
        {loading ? <LoaderCircle className="animate-spin" /> : null}
        Create Account
      </Button>
    </form>
  );
}
