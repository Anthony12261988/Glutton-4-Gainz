import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AcceptInviteClient } from "./accept-invite-client";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInvitePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    redirect("/login?error=invalid_invite");
  }

  // Check if user is already logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Pass token and user status to client component
  return (
    <AcceptInviteClient
      token={token}
      isLoggedIn={!!user}
      userEmail={user?.email || null}
      userId={user?.id || null}
    />
  );
}
