import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign In" };

export default async function SignInPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Enter your credentials to access your tuition dashboard"
      className="max-w-md"
      imageSrc="/image/sign_in.jpg"
      imageAlt="A student wearing headphones taking notes beside a laptop"
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
