import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/session";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Update your name and avatar — it shows up on your dashboard and in
        every message you send.
      </p>
      <div className="mt-6 max-w-xl">
        <ProfileForm
          initial={{
            name: user.name,
            email: user.email,
            image: user.image ?? "",
            role: user.role,
          }}
        />
      </div>
    </div>
  );
}
