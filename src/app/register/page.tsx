import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Sign Up" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Join MentorLagbe as a Student or a Tutor — it only takes a minute."
      footer={
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign In
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
