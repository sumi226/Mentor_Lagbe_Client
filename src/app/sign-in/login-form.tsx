"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { fetchAuthToken } from "@/lib/api-token";
import { validateSignIn } from "@/lib/auth-validation";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, LoaderCircle, Shield, GraduationCap, School, KeyRound, LogIn, Check, Copy } from "lucide-react";

const QUICK_ROLES = [
  {
    role: "admin" as const,
    label: "Admin",
    email: "admin@mentorlagbe.com",
    pass: "MentorLagbe123!",
    icon: Shield,
    colorClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    borderClass: "hover:border-rose-500/40",
  },
  {
    role: "tutor" as const,
    label: "Tutor",
    email: "tutor@mentorlagbe.com",
    pass: "MentorLagbe123!",
    icon: GraduationCap,
    colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    borderClass: "hover:border-emerald-500/40",
  },
  {
    role: "student" as const,
    label: "Student",
    email: "student@mentorlagbe.com",
    pass: "MentorLagbe123!",
    icon: School,
    colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    borderClass: "hover:border-blue-500/40",
  },
];

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState<"admin" | "tutor" | "student" | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const invalid = validateSignIn({ email, password });
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

    const { error: signInError } = await authClient.signIn.email({
      email: email.trim(),
      password,
    });

    if (signInError) {
      const message =
        signInError.message ?? "Something went wrong. Please try again.";
      setError(message);
      toast.add({
        type: "error",
        title: "Sign-in failed",
        description: message,
      });
      setLoading(false);
      return;
    }

    await fetchAuthToken(true);

    toast.add({
      type: "success",
      title: "Welcome back!",
      description: "You are signed in.",
    });

    // Navigate cleanly with fresh cookies
    const lowerEmail = email.trim().toLowerCase();
    if (lowerEmail === "admin@mentorlagbe.com") {
      window.location.href = "/dashboard/admin";
    } else if (lowerEmail === "tutor@mentorlagbe.com") {
      window.location.href = "/dashboard/tutor";
    } else if (lowerEmail === "student@mentorlagbe.com") {
      window.location.href = "/dashboard/student";
    } else {
      window.location.href = "/dashboard";
    }
  };

  const handleFillCredentials = (
    targetEmail: string,
    targetPass: string,
    roleLabel: string
  ) => {
    setEmail(targetEmail);
    setPassword(targetPass);
    setError(null);
    toast.add({
      type: "success",
      title: `${roleLabel} credentials added!`,
      description: "Email & password filled into form. Click 'Sign In' or '1-Click'.",
    });
  };

  const handleQuickLogin = async (role: "admin" | "tutor" | "student") => {
    setQuickLoading(role);
    setError(null);

    const targetEmail = `${role}@mentorlagbe.com`;
    const defaultPass = "MentorLagbe123!";

    // Automatically fill the form inputs
    setEmail(targetEmail);
    setPassword(defaultPass);

    try {
      // 1. Attempt direct 1-click sign in first for instant response
      let signInResult = await authClient.signIn.email({
        email: targetEmail,
        password: defaultPass,
      });

      // 2. If direct login fails (e.g. account missing or needs resync), call quick-login endpoint and retry
      if (signInResult.error) {
        const prepRes = await fetch("/api/auth/quick-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        });
        const prepData = await prepRes.json().catch(() => ({}));
        const loginEmail = prepData.email || targetEmail;
        const loginPass = prepData.password || defaultPass;

        setEmail(loginEmail);
        setPassword(loginPass);

        signInResult = await authClient.signIn.email({
          email: loginEmail,
          password: loginPass,
        });

        if (signInResult.error) {
          throw new Error(signInResult.error.message || "Failed to sign in.");
        }
      }

      await fetchAuthToken(true);

      toast.add({
        type: "success",
        title: `Welcome, ${role.charAt(0).toUpperCase() + role.slice(1)}!`,
        description: `Signed in successfully as ${role}.`,
      });

      // Navigate directly to the role dashboard with a full reload to ensure server session cookies are active
      window.location.href = `/dashboard/${role}`;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed.";
      setError(msg);
      toast.add({
        type: "error",
        title: "Login Failed",
        description: msg,
      });
    } finally {
      setQuickLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    toast.add({
      type: "info",
      title: "Google Sign In",
      description: "Google OAuth provider can be connected in .env.local via Google Cloud Console.",
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={loading || quickLoading !== null}
          className="mt-1 flex items-center justify-center gap-2 h-11 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {loading ? (
            <LoaderCircle className="animate-spin size-4" />
          ) : (
            <>
              Sign In
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      {/* Sign in with Google Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={loading || quickLoading !== null}
        className="h-11 flex items-center justify-center gap-3 border-border hover:bg-muted font-medium text-sm"
      >
        <svg className="size-4.5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Sign in with Google
      </Button>

      {/* Quick 1-Click Access Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between pb-1.5">
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            QUICK ACCESS (1-CLICK & AUTO-FILL)
          </span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Instant Demo Access
          </span>
        </div>

        <p className="text-xs text-muted-foreground pb-2">
          Click <strong>Auto-fill</strong> to add email & password to the form, or <strong>1-Click</strong> to sign in directly.
        </p>

        <div className="flex flex-col gap-2.5">
          {QUICK_ROLES.map((item) => {
            const Icon = item.icon;
            const isLoggingIn = quickLoading === item.role;
            const isCurrentFilled = email === item.email;

            return (
              <div
                key={item.role}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrentFilled
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:bg-muted/40 " + item.borderClass
                }`}
              >
                <div className="flex items-center justify-between gap-2.5">
                  <div
                    onClick={() => handleFillCredentials(item.email, item.pass, item.label)}
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer select-none"
                    title="Click to fill email and password"
                  >
                    <div
                      className={`size-9 rounded-lg ${item.colorClass} flex items-center justify-center shrink-0`}
                    >
                      <Icon className="size-4.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-foreground">
                          {item.label} Account
                        </span>
                        {isCurrentFilled ? (
                          <span className="text-[10px] font-medium bg-primary/15 text-primary px-1.5 py-0.2 rounded-full">
                            In Form
                          </span>
                        ) : null}
                      </div>
                      <span className="text-xs text-muted-foreground truncate font-mono">
                        {item.email}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                        <KeyRound className="size-3 text-muted-foreground shrink-0" />
                        <span>Pass:</span>
                        <code className="text-foreground bg-muted px-1 rounded font-mono text-[11px]">
                          {item.pass}
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleFillCredentials(item.email, item.pass, item.label)}
                      disabled={loading || quickLoading !== null}
                      className="px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors flex items-center gap-1 cursor-pointer"
                      title="Add to form inputs"
                    >
                      <Copy className="size-3 text-muted-foreground" />
                      Auto-fill
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin(item.role)}
                      disabled={loading || quickLoading !== null}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                      title="Sign in immediately"
                    >
                      {isLoggingIn ? (
                        <>
                          <LoaderCircle className="size-3 animate-spin" />
                          <span>Wait...</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="size-3" />
                          <span>1-Click</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
