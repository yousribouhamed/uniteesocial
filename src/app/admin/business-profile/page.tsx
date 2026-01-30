import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BusinessProfileClient from "./business-profile-client";

export default async function BusinessProfilePage() {
  const supabase = await createClient();

  let user;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    redirect("/login");
  }

  if (!user) {
    redirect("/login");
  }

  // Get current user's profile for the sidebar
  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <BusinessProfileClient
      currentUser={{
        email: user.email,
        full_name: currentUserProfile?.full_name ?? null,
        avatar_url: currentUserProfile?.avatar_url ?? null,
      }}
    />
  );
}
