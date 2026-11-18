import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign In" };

export default function SignInPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your MentorLagbe account."
      footer={
        <p className="text-muted-foreground">
          Don’t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-primary hover:underline"
          >
            Sign Up
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
