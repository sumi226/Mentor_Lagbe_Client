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
  KeyRound,
  LogIn,
  Copy,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Check,
  UserCheck,
} from "lucide-react";

export type QuickAccount = {
  id: string;
  role: "admin" | "tutor" | "student";
  label: string;
  email: string;
  pass: string;
  isCustom?: boolean;
};

const DEFAULT_ACCOUNTS: QuickAccount[] = [
  {
    id: "admin",
    role: "admin",
    label: "Admin",
    email: "admin@mentorlagbe.com",
    pass: "MentorLagbe123!",
  },
  {
    id: "tutor",
    role: "tutor",
    label: "Tutor",
    email: "tutor@mentorlagbe.com",
    pass: "MentorLagbe123!",
  },
  {
    id: "student",
    role: "student",
    label: "Student",
    email: "student@mentorlagbe.com",
    pass: "MentorLagbe123!",
  },
];

const STORAGE_KEY = "mentor_lagbe_quick_accounts_v2";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState<string | null>(null);

  // Quick Access Accounts
  const [accounts, setAccounts] = useState<QuickAccount[]>(DEFAULT_ACCOUNTS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPass, setEditPass] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "tutor" | "student">("student");
  const [editLabel, setEditLabel] = useState("");
  const [showEditPass, setShowEditPass] = useState(false);

  // Load saved accounts from localStorage on client mount
  useEffect(() => {
    try {
      let loadedAccounts: QuickAccount[] = [];
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedAccounts = parsed;
        }
      }

      if (loadedAccounts.length === 0) {
        loadedAccounts = [...DEFAULT_ACCOUNTS];
      }

      // Check if a user just registered or saved their account previously
      const customReg = localStorage.getItem("mentor_lagbe_custom_quick_user");
      if (customReg) {
        try {
          const regUser = JSON.parse(customReg);
          if (regUser && regUser.email && regUser.pass) {
            const exists = loadedAccounts.some(
              (a) => a.email.toLowerCase() === regUser.email.toLowerCase()
            );
            if (!exists) {
              loadedAccounts = [
                {
                  id: regUser.id || `custom-${Date.now()}`,
                  role: regUser.role || "student",
                  label: regUser.label || "My Registered Account",
                  email: regUser.email,
                  pass: regUser.pass,
                  isCustom: true,
                },
                ...loadedAccounts,
              ];
            }
          }
        } catch {}
      }

      setAccounts(loadedAccounts);
    } catch {}
  }, []);

  const saveAccountsToStorage = (newAccounts: QuickAccount[]) => {
    setAccounts(newAccounts);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAccounts));
    } catch {}
  };

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

    // Auto-save this valid login to custom quick user
    try {
      const savedUser = {
        id: `login-${Date.now()}`,
        role: "student",
        label: email.split("@")[0],
        email: email.trim(),
        pass: password,
        isCustom: true,
      };
      localStorage.setItem("mentor_lagbe_custom_quick_user", JSON.stringify(savedUser));
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

  const handleQuickLogin = async (account: QuickAccount) => {
    setQuickLoading(account.id);
    setError(null);

    const targetEmail = account.email.trim();
    const targetPass = account.pass;

    // Automatically fill the form inputs
    setEmail(targetEmail);
    setPassword(targetPass);

    try {
      // 1. Attempt direct 1-click sign in first
      let signInResult = await authClient.signIn.email({
        email: targetEmail,
        password: targetPass,
      });

      // 2. If direct login fails and it's a default/demo account, invoke quick-login endpoint and retry
      if (signInResult.error) {
        const prepRes = await fetch("/api/auth/quick-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: account.role,
            email: targetEmail,
            password: targetPass,
            name: account.label,
          }),
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
      }

      await fetchAuthToken(true);

      toast.add({
        type: "success",
        title: `Welcome, ${account.label}!`,
        description: `Signed in successfully.`,
      });

      // Navigate directly to dashboard
      window.location.href = account.role
        ? `/dashboard/${account.role}`
        : "/dashboard";
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

  // Save whatever is currently typed in the form as a Quick Access card
  const handleSaveCurrentAsQuickAccess = () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.add({
        type: "error",
        title: "Invalid Email",
        description: "Please enter a valid email address first.",
      });
      return;
    }
    if (!password || password.length < 6) {
      toast.add({
        type: "error",
        title: "Password too short",
        description: "Please enter at least 6 characters for the password.",
      });
      return;
    }

    // Determine role guess based on email or default to student
    let detectedRole: "admin" | "tutor" | "student" = "student";
    if (cleanEmail.toLowerCase().includes("admin")) detectedRole = "admin";
    else if (cleanEmail.toLowerCase().includes("tutor")) detectedRole = "tutor";

    const label = cleanEmail.split("@")[0];
    const newAccount: QuickAccount = {
      id: `custom-${Date.now()}`,
      role: detectedRole,
      label: `${label.charAt(0).toUpperCase() + label.slice(1)} (Registered)`,
      email: cleanEmail,
      pass: password,
      isCustom: true,
    };

    // Filter out if same email already in list, then prepend
    const updated = [
      newAccount,
      ...accounts.filter((a) => a.email.toLowerCase() !== cleanEmail.toLowerCase()),
    ];
    saveAccountsToStorage(updated);

    toast.add({
      type: "success",
      title: "Saved to Quick Access!",
      description: `${cleanEmail} is now available for 1-Click Login below.`,
    });
  };

  // Start editing an account
  const handleStartEdit = (account: QuickAccount) => {
    setEditingId(account.id);
    setEditEmail(account.email);
    setEditPass(account.pass);
    setEditRole(account.role);
    setEditLabel(account.label);
    setShowEditPass(false);
  };

  // Start adding a new custom registered account
  const handleStartAddNew = () => {
    setEditingId("new");
    setEditEmail(email.trim() || "");
    setEditPass(password || "");
    setEditRole("student");
    setEditLabel(email.trim() ? email.trim().split("@")[0] : "My Account");
    setShowEditPass(false);
  };

  // Save edit form
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = editEmail.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.add({
        type: "error",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      return;
    }
    if (!editPass || editPass.length < 6) {
      toast.add({
        type: "error",
        title: "Password Required",
        description: "Password must be at least 6 characters.",
      });
      return;
    }

    if (editingId === "new") {
      const newAcc: QuickAccount = {
        id: `custom-${Date.now()}`,
        role: editRole,
        label: editLabel.trim() || cleanEmail.split("@")[0],
        email: cleanEmail,
        pass: editPass,
        isCustom: true,
      };
      saveAccountsToStorage([newAcc, ...accounts]);
      toast.add({
        type: "success",
        title: "Account Added",
        description: `${cleanEmail} added to Quick Access.`,
      });
    } else {
      const updated = accounts.map((acc) => {
        if (acc.id === editingId) {
          return {
            ...acc,
            role: editRole,
            label: editLabel.trim() || cleanEmail.split("@")[0],
            email: cleanEmail,
            pass: editPass,
            isCustom: true,
          };
        }
        return acc;
      });
      saveAccountsToStorage(updated);
      toast.add({
        type: "success",
        title: "Account Updated",
        description: `Changes saved for ${cleanEmail}.`,
      });
    }

    setEditingId(null);
  };

  // Delete a custom account
  const handleDeleteAccount = (id: string, accEmail: string) => {
    const updated = accounts.filter((a) => a.id !== id);
    saveAccountsToStorage(updated);
    toast.add({
      type: "info",
      title: "Removed",
      description: `${accEmail} removed from Quick Access.`,
    });
  };

  // Reset to default accounts
  const handleResetDefaults = () => {
    saveAccountsToStorage(DEFAULT_ACCOUNTS);
    try {
      localStorage.removeItem("mentor_lagbe_custom_quick_user");
    } catch {}
    toast.add({
      type: "info",
      title: "Reset Complete",
      description: "Quick Access reset to default Demo accounts.",
    });
  };

  const handleGoogleSignIn = async () => {
    toast.add({
      type: "info",
      title: "Google Sign In",
      description: "Google OAuth provider can be connected in .env.local via Google Cloud Console.",
    });
  };

  const getRoleIcon = (role: string) => {
    if (role === "admin") return Shield;
    if (role === "tutor") return GraduationCap;
    return School;
  };

  const getRoleColors = (role: string) => {
    if (role === "admin") {
      return {
        bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
        border: "hover:border-rose-500/40",
      };
    }
    if (role === "tutor") {
      return {
        bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        border: "hover:border-emerald-500/40",
      };
    }
    return {
      bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      border: "hover:border-blue-500/40",
    };
  };

  const hasTypedCredentials = email.trim().length > 3 && password.length >= 4;

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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              {showPassword ? (
                <>
                  <EyeOff className="size-3" />
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <Eye className="size-3" />
                  <span>Show</span>
                </>
              )}
            </button>
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
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

      {/* Helper Bar: Save typed credentials to Quick Access */}
      {hasTypedCredentials && (
        <div className="p-2.5 rounded-xl border border-dashed border-primary/50 bg-primary/5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <UserCheck className="size-4 text-primary shrink-0" />
            <span className="text-xs text-foreground truncate">
              Save <strong>{email.trim()}</strong> for 1-Click login?
            </span>
          </div>
          <button
            type="button"
            onClick={handleSaveCurrentAsQuickAccess}
            className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Save className="size-3" />
            Save to Quick Access
          </button>
        </div>
      )}

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
        <div className="flex items-center justify-between pb-1.5 flex-wrap gap-2">
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            QUICK ACCESS (CUSTOMIZABLE)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartAddNew}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="size-3" />
              Add Account
            </button>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
              title="Reset Quick Access to default demo accounts"
            >
              <RotateCcw className="size-3" />
              Reset
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground pb-2.5">
          Click <strong>Auto-fill</strong> or <strong>1-Click</strong> to sign in. Click <strong>Edit (✏️)</strong> to change email or password for any registered user.
        </p>

        {/* Inline Edit / Add Account Form */}
        {editingId !== null && (
          <form
            onSubmit={handleSaveEdit}
            className="p-3.5 mb-3 rounded-xl border border-primary/50 bg-card shadow-sm flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Pencil className="size-3.5 text-primary" />
                {editingId === "new" ? "Add Registered User" : "Edit Quick Access Account"}
              </span>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <Label className="text-[11px]">Display Name</Label>
                <Input
                  type="text"
                  placeholder="e.g. Sumi (Admin)"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-[11px]">Role Dashboard</Label>
                <div className="flex items-center gap-1">
                  {(["student", "tutor", "admin"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setEditRole(r)}
                      className={`flex-1 py-1 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                        editRole === r
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/60 text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <Label className="text-[11px]">Email</Label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px]">Password</Label>
                  <button
                    type="button"
                    onClick={() => setShowEditPass(!showEditPass)}
                    className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                  >
                    {showEditPass ? <EyeOff className="size-2.5" /> : <Eye className="size-2.5" />}
                    {showEditPass ? "Hide" : "Show"}
                  </button>
                </div>
                <Input
                  type={showEditPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={editPass}
                  onChange={(e) => setEditPass(e.target.value)}
                  required
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="size-3" />
                Save Account
              </button>
            </div>
          </form>
        )}

        {/* Account Cards List */}
        <div className="flex flex-col gap-2.5">
          {accounts.map((item) => {
            const Icon = getRoleIcon(item.role);
            const colors = getRoleColors(item.role);
            const isLoggingIn = quickLoading === item.id;
            const isCurrentFilled =
              email.trim().toLowerCase() === item.email.trim().toLowerCase();

            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrentFilled
                    ? "border-primary bg-primary/5 shadow-sm"
                    : `border-border bg-card hover:bg-muted/40 ${colors.border}`
                }`}
              >
                <div className="flex items-center justify-between gap-2.5">
                  {/* Account Information */}
                  <div
                    onClick={() => handleFillCredentials(item.email, item.pass, item.label)}
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer select-none"
                    title="Click to fill email & password in the form"
                  >
                    <div
                      className={`size-9 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}
                    >
                      <Icon className="size-4.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">
                          {item.label}
                        </span>
                        {item.isCustom ? (
                          <span className="text-[10px] font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1.5 py-0.2 rounded-full">
                            Custom
                          </span>
                        ) : null}
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

                  {/* Actions: Edit, Auto-fill, 1-Click */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      disabled={loading || quickLoading !== null}
                      className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Edit email or password"
                    >
                      <Pencil className="size-3" />
                    </button>

                    {/* Auto-fill Button */}
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

                    {/* 1-Click Login Button */}
                    <button
                      type="button"
                      onClick={() => handleQuickLogin(item)}
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

                    {/* Delete Custom Account button */}
                    {item.isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAccount(item.id, item.email)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                        title="Remove custom account"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    )}
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
