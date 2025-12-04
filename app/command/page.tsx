import { createClient } from "@/lib/supabase/server";
import { Navigation } from "@/components/ui/navigation";
import { redirect } from "next/navigation";
import CommandCenterClient from "./command-center-client";

export default async function CommandCenterPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: troops } = await supabase
    .from("profiles")
    .select("id, email, tier, role, last_active, banned")
    .order("last_active", { ascending: false });

  const { data: coaches } = await supabase
    .from("profiles")
    .select("id, email, tier, role, last_active, banned")
    .eq("role", "coach")
    .order("last_active", { ascending: false });

  const { data: invites } = await supabase
    .from("coach_invites")
    .select("id, email, status, created_at, token")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-camo-black pb-24">
      <div className="container mx-auto px-4 py-8">
        <CommandCenterClient
          currentUserId={user.id}
          troops={troops ?? []}
          coaches={coaches ?? []}
          invites={invites ?? []}
        />
      </div>
      <Navigation />
    </div>
  );
}
