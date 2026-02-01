import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import UsersPageClient from "./users-client";

export default async function UsersAccountManagement() {
  const supabase = await createClient();

  // Get the current user
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

  // Fetch all users from Supabase Auth Admin API
  const adminClient = createAdminClient();
  const { data: authData } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  // Map auth users to our UserProfile shape
  const users = (authData?.users || []).map((authUser) => {
    const meta = authUser.user_metadata || {};
    const statusValue = (meta.status as string) || "Active";
    const profileStatusValue = (meta.profile_status as string) || "Verified";
    return {
      id: authUser.id,
      full_name: (meta.full_name as string) || null,
      avatar_url: (meta.avatar_url as string) || (meta.picture as string) || null,
      role: (meta.role as string) || "Member",
      status: (statusValue === "Active" || statusValue === "Inactive" ? statusValue : "Active") as "Active" | "Inactive",
      profile_status: (["Verified", "Not Verified", "Completed", "Active"].includes(profileStatusValue) ? profileStatusValue : "Verified") as "Verified" | "Not Verified" | "Completed" | "Active",
      email: authUser.email || null,
      phone: (meta.phone as string) || null,
      gender: (meta.gender as string) || null,
      country: (meta.country as string) || null,
      nationality: (meta.nationality as string) || null,
      created_at: authUser.created_at || null,
    };
  });

  // Sort by created_at descending (newest first)
  users.sort((a, b) => {
    if (!a.created_at || !b.created_at) return 0;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Get current user's metadata for the sidebar
  const currentUserMeta = user.user_metadata || {};

  return (
    <UsersPageClient
      users={users}
      currentUser={{
        email: user.email,
        full_name: (currentUserMeta.full_name as string) ?? null,
        avatar_url: (currentUserMeta.avatar_url as string) || (currentUserMeta.picture as string) || null,
      }}
    />
  );
}
