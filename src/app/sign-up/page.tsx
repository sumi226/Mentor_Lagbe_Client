import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Sign Up" };

export default async function SignUpPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join MentorLagbe as a Student, Tutor, or Admin — it only takes a minute."
      className="max-w-md"
      imageSrc="/image/sign_up.jpg"
      imageAlt="Students seated in a classroom listening to their teacher"
      footer={
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
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
