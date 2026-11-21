import { redirect } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { client, db } from "@/lib/mongodb";
import { PostTuitionForm } from "./post-tuition-form";

export const metadata = { title: "Post a Tuition · Tutor Dashboard" };

const FREE_POST_LIMIT = 2;

export default async function PostTuitionPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "tutor") redirect("/dashboard");

  await client.connect();

  const [tuitionCount, planDoc] = await Promise.all([
    db.collection("tuitions").countDocuments({
      tutorEmail: user.email,
      approvalStatus: { $ne: "rejected" },
    }),
    db.collection("users").findOne({ email: user.email }),
  ]);

  const isPro = String(planDoc?.plan ?? "free") === "pro";

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <PlusCircle className="size-4" />
          <span>New Tuition Listing</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Post a Tuition</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a validated tuition batch. It will be submitted for admin review with approval status &apos;pending&apos;.
          {isPro ? " (Pro Plan: Unlimited Posts)" : ` (Free Plan: ${tuitionCount}/${FREE_POST_LIMIT} posts used)`}
        </p>
      </div>

      <PostTuitionForm
        isPro={isPro}
        postsUsed={tuitionCount}
        freeLimit={FREE_POST_LIMIT}
      />
    </div>
  );
}
