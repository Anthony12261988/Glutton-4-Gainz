import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/ui/navigation";
import { BuddySystem } from "@/components/social/buddy-system";
import { Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgeDisplay } from "@/components/ui/badge-display";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch Buddies
  // We want to find rows where user is sender OR receiver
  // Supabase JS client doesn't support OR across different columns easily in one go with joins for different relations
  // So let's just fetch where user_id = me (I added them) for now to keep it simple for MVP Phase 6
  // Or we can do two queries.

  const { data: sentRequests } = await supabase
    .from("buddies")
    .select(
      `
      *,
      buddy_profile:profiles!buddy_id(*)
    `
    )
    .eq("user_id", user.id);

  // Normalize for the component
  const buddies = sentRequests || [];

  return (
    <div className="min-h-screen bg-camo-black pb-24">
      <div className="container mx-auto max-w-md px-4 py-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
              DOSSIER
            </h1>
            <p className="text-sm text-muted-text">Service Record & Squad</p>
          </div>
          <div className="rounded-sm border border-tactical-red bg-tactical-red/10 p-2">
            <Shield className="h-6 w-6 text-tactical-red" />
          </div>
        </div>

        {/* Profile Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-sm border border-steel bg-gunmetal p-4 text-center">
            <p className="text-xs text-muted-text">TIER</p>
            <p className="font-heading text-xl font-bold text-tactical-red">
              {profile?.tier}
            </p>
          </div>
          <div className="rounded-sm border border-steel bg-gunmetal p-4 text-center">
            <p className="text-xs text-muted-text">XP</p>
            <p className="font-heading text-xl font-bold text-high-vis">
              {profile?.xp}
            </p>
          </div>
          <div className="rounded-sm border border-steel bg-gunmetal p-4 text-center">
            <p className="text-xs text-muted-text">STREAK</p>
            <p className="font-heading text-xl font-bold text-radar-green">
              {profile?.current_streak}
            </p>
          </div>
        </div>

        {/* Buddy System */}
        <BuddySystem userId={user.id} initialBuddies={buddies} />

        {/* Logout (Optional but good for profile) */}
        <form action="/auth/signout" method="post" className="mt-8">
          <Button
            variant="outline"
            className="w-full border-steel text-steel hover:bg-tactical-red hover:text-high-vis hover:border-tactical-red"
          >
            <LogOut className="mr-2 h-4 w-4" />
            DISCHARGE (LOGOUT)
          </Button>
        </form>
      </div>
      <Navigation />
    </div>
  );
}
