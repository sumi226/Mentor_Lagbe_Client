"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient, type UserRole } from "@/lib/auth-client";
import { fetchAuthToken } from "@/lib/api-token";
import { validateSignUp } from "@/lib/auth-validation";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { BookOpen, CheckCircle2, LoaderCircle, Presentation, ShieldCheck } from "lucide-react";

const ROLE_OPTIONS: {
  value: UserRole;
  label: string;
  description: string;
  icon: typeof BookOpen;
}[] = [
  {
    value: "student",
    label: "Student",
    description: "Find tutors, apply for batches, and book sessions.",
    icon: BookOpen,
  },
  {
    value: "tutor",
    label: "Tutor",
    description: "Post tuition batches and manage applications.",
    icon: Presentation,
  },
  {
    value: "admin",
    label: "Admin",
    description: "Manage users, review tuitions, and platform activity.",
    icon: ShieldCheck,
  },
];

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // Spec: validate required fields, email format and password length
    // before hitting the auth API.
    const invalid = validateSignUp({ name, email, password, role });
    if (invalid) {
      setError(invalid);
      toast.add({
        type: "error",
        title: "Check your details",
        description: invalid,
      });
      return;
    }

    setLoading(true);

    try {
      await authClient.signOut();
    } catch {}

    const { error: signUpError } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      // plan defaults to "free" (better-auth additionalFields.plan) — only
      // the Stripe verification endpoint may upgrade it to "pro".
    });

    if (signUpError) {
      let message =
        signUpError.message ?? "Something went wrong. Please try again.";
      if (
        message.toLowerCase().includes("already exists") ||
        signUpError.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
      ) {
        message = "An account with this email already exists. Please sign in or use another email.";
      }
      setError(message);
      toast.add({
        type: "error",
        title: "Sign-up failed",
        description: message,
      });
      setLoading(false);
      return;
    }

    // JWT integration: fetch a token for the fresh session so protected
    // API calls can send `Authorization: Bearer <jwt>` right away.
    await fetchAuthToken(true);

    // Save registered user details in localStorage for instant Quick Access on sign-in
    try {
      if (typeof window !== "undefined") {
        const customUser = {
          id: `registered-${Date.now()}`,
          role,
          label: `${name.trim().split(" ")[0]} (${role.charAt(0).toUpperCase() + role.slice(1)})`,
          email: email.trim(),
          pass: password,
          isCustom: true,
        };
        localStorage.setItem("mentor_lagbe_custom_quick_user", JSON.stringify(customUser));
      }
    } catch {}

    toast.add({
      type: "success",
      title: "Account created",
      description: `Welcome to MentorLagbe, ${name.trim().split(" ")[0]}!`,
    });

    // Hard navigate so browser sends all newly set session cookies cleanly to server
    window.location.href = role ? `/dashboard/${role}` : "/dashboard";
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Role picker */}
      <div className="flex flex-col gap-1.5">
        <Label>I want to join as</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
