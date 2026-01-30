import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EventsPageClient from "./events-client";

export default async function EventsManagement() {
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

  const currentUserMeta = user.user_metadata || {};

  return (
    <EventsPageClient
      currentUser={{
        email: user.email,
        full_name: (currentUserMeta.full_name as string) ?? null,
        avatar_url: (currentUserMeta.avatar_url as string) ?? null,
      }}
    />
  );
}
