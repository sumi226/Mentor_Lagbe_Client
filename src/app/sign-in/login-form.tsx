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
import { LoaderCircle } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // Explicit validation: required fields, email format, password length.
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

    // JWT integration: grab a token now so the first protected API request
    // already carries `Authorization: Bearer <jwt>`.
    await fetchAuthToken(true);

    toast.add({
      type: "success",
      title: "Welcome back!",
      description: "You are signed in.",
    });

    router.push("/dashboard");
    router.refresh();
  };

  return (
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

      <Button type="submit" disabled={loading} className="mt-2">
        {loading ? <LoaderCircle className="animate-spin" /> : null}
        Sign In
      </Button>
    </form>
  );
}
