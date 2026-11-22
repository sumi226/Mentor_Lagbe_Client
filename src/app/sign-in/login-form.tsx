"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { fetchAuthToken } from "@/lib/api-token";
import { validateSignIn } from "@/lib/auth-validation";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  LoaderCircle,
  Shield,
  GraduationCap,
  School,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Zap,
  User,
} from "lucide-react";

type RoleType = "admin" | "tutor" | "student" | "registered";

interface QuickCardItem {
  id: string;
  role: RoleType;
  title: string;
  email: string;
  pass: string;
  icon: typeof Shield | typeof User;
  iconColor: string;
  iconBg: string;
  isRegistered?: boolean;
}

const DEFAULT_ACCOUNTS: QuickCardItem[] = [
  {
    id: "admin",
    role: "admin",
    title: "Admin Login",
    email: "admin@mentorlagbe.com",
    pass: "MentorLagbe123!",
    icon: Shield,
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40",
  },
  {
    id: "tutor",
    role: "tutor",
    title: "Tutor Login",
    email: "tutor@mentorlagbe.com",
    pass: "MentorLagbe123!",
    icon: GraduationCap,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40",
  },
  {
    id: "student",
    role: "student",
    title: "Student Login",
    email: "student@mentorlagbe.com",
    pass: "MentorLagbe123!",
    icon: School,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40",
  },
];

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState<string | null>(null);

  // Saved registered user from localStorage
  const [savedUser, setSavedUser] = useState<QuickCardItem | null>(null);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      // 1. Check custom quick user from signup
      const fromSignup = localStorage.getItem("mentor_lagbe_custom_quick_user");
      // 2. Check saved user from previous login
      const fromLogin = localStorage.getItem("mentor_lagbe_saved_user");

      const raw = fromSignup || fromLogin;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          parsed.email &&
          !DEFAULT_ACCOUNTS.some(
            (a) => a.email.toLowerCase() === parsed.email.toLowerCase()
          )
        ) {
          setSavedUser({
            id: "saved-registered",
            role: parsed.role || "registered",
            title: parsed.label || `${parsed.email.split("@")[0]} Login`,
            email: parsed.email,
            pass: parsed.pass || "",
            icon: User,
            iconColor: "text-indigo-600 dark:text-indigo-400",
            iconBg:
              "bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40",
            isRegistered: true,
          });
        }
      }
    } catch {}
  }, []);

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

    // Save user for future 1-Click Quick Access
    try {
      if (typeof window !== "undefined") {
        const lower = email.trim().toLowerCase();
        const detectedRole = lower.includes("admin")
          ? "admin"
          : lower.includes("tutor")
          ? "tutor"
          : "student";
        const remembered = {
          role: detectedRole,
          label: `${email.trim().split("@")[0]} Login`,
          email: email.trim(),
          pass: password,
        };
        localStorage.setItem("mentor_lagbe_saved_user", JSON.stringify(remembered));
      }
    } catch {}

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

  const handleQuickLogin = async (item: QuickCardItem) => {
    setQuickLoading(item.id);
    setError(null);

    const targetEmail = item.email.trim();
    const targetPass = item.pass;

    // Automatically fill the form inputs
    setEmail(targetEmail);
    if (targetPass) {
      setPassword(targetPass);
    }

    if (!targetPass) {
      setQuickLoading(null);
      toast.add({
        type: "info",
        title: "Enter Password",
        description: `Please enter password for ${targetEmail} and click Sign In.`,
      });
      return;
    }

    try {
      // 1. Attempt direct 1-click sign in first
      let signInResult = await authClient.signIn.email({
        email: targetEmail,
        password: targetPass,
      });

      // 2. If direct login fails and it's a demo account, ensure account exists in DB and retry
      if (signInResult.error && !item.isRegistered) {
        const prepRes = await fetch("/api/auth/quick-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: item.role }),
        });
        const prepData = await prepRes.json().catch(() => ({}));
        const loginEmail = prepData.email || targetEmail;
        const loginPass = prepData.password || targetPass;

        setEmail(loginEmail);
        setPassword(loginPass);

        signInResult = await authClient.signIn.email({
          email: loginEmail,
          password: loginPass,
        });

        if (signInResult.error) {
          throw new Error(signInResult.error.message || "Failed to sign in.");
        }
      } else if (signInResult.error) {
        throw new Error(signInResult.error.message || "Failed to sign in.");
      }

      await fetchAuthToken(true);

      toast.add({
        type: "success",
        title: `Welcome back!`,
        description: `Signed in successfully as ${targetEmail}.`,
      });

      // Navigate directly to dashboard
      const destRole =
        item.role === "admin" || item.role === "tutor" || item.role === "student"
          ? item.role
          : null;
      window.location.href = destRole ? `/dashboard/${destRole}` : "/dashboard";
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

  // Compile list of Quick Access cards:
  // Include saved registered user first if present, followed by Admin, Tutor, Student
  const displayAccounts: QuickCardItem[] = [
    ...(savedUser ? [savedUser] : []),
    ...DEFAULT_ACCOUNTS,
  ];

  // If user has typed an email that is not in the list and not empty
  const typedEmail = email.trim();
  const isCustomTyped =
    typedEmail.length > 3 &&
    typedEmail.includes("@") &&
    !displayAccounts.some(
      (a) => a.email.toLowerCase() === typedEmail.toLowerCase()
    );

  const activeTypedCard: QuickCardItem | null = isCustomTyped
    ? {
        id: "active-typed",
        role: "registered",
        title: `Quick Login (${typedEmail.split("@")[0]})`,
        email: typedEmail,
        pass: password,
        icon: User,
        iconColor: "text-amber-600 dark:text-amber-400",
        iconBg:
          "bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40",
        isRegistered: true,
      }
    : null;

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* Email Address */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="pl-10 h-11"
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              className="pl-10 pr-10 h-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {/* Sign In Button */}
        <Button
          type="submit"
          disabled={loading || quickLoading !== null}
          className="mt-1 flex items-center justify-center gap-2 h-11 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
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
        className="h-11 flex items-center justify-center gap-3 border-border hover:bg-muted font-medium text-sm rounded-lg"
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

      {/* Quick Access (1-Click) Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between pb-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            <Zap className="size-3.5 text-amber-500 fill-amber-500" />
            <span>QUICK ACCESS (1-CLICK)</span>
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Instant 1-Click Login
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Active Typed User Card (if user typed their own email in the input) */}
          {activeTypedCard && (
            <button
              type="button"
              onClick={() => handleQuickLogin(activeTypedCard)}
              disabled={loading || quickLoading !== null}
              className="flex items-center justify-between w-full p-3 rounded-xl border border-amber-300/80 dark:border-amber-700/60 bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/80 transition-all text-left group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`size-9 rounded-lg ${activeTypedCard.iconBg} ${activeTypedCard.iconColor} flex items-center justify-center shrink-0 shadow-2xs`}
                >
                  <User className="size-4.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {activeTypedCard.title}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {activeTypedCard.email}
                  </span>
                </div>
              </div>

              {quickLoading === activeTypedCard.id ? (
                <LoaderCircle className="size-4 animate-spin text-amber-600 dark:text-amber-400 shrink-0" />
              ) : (
                <ArrowRight className="size-4 text-muted-foreground/70 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              )}
            </button>
          )}

          {/* Regular Quick Access Cards */}
          {displayAccounts.map((item) => {
            const Icon = item.icon;
            const isLoggingIn = quickLoading === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleQuickLogin(item)}
                disabled={loading || quickLoading !== null}
                className="flex items-center justify-between w-full p-3 rounded-xl border border-border/80 bg-card hover:bg-muted/50 hover:border-emerald-500/40 transition-all text-left group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`size-9 rounded-lg ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 shadow-2xs`}
                  >
                    <Icon className="size-4.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {item.email}
                    </span>
                  </div>
                </div>

                {isLoggingIn ? (
                  <LoaderCircle className="size-4 animate-spin text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <ArrowRight className="size-4 text-muted-foreground/70 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
