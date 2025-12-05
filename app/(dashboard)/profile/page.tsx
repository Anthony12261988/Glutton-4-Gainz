import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BuddySystem } from "@/components/social/buddy-system";
import { Shield, LogOut, Award, Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgeDisplay, type Badge } from "@/components/ui/badge-display";
import { RankBadge } from "@/components/ui/rank-badge";

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

  // Fetch Badges
  const { data: badges } = await supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: true });

  // Fetch Buddies
  // We want to find rows where user is sender OR receiver
  // Supabase JS client doesn't support OR across different columns easily in one go with joins for different relations
  // So let's just fetch where user_id = me (I added them) for now to keep it simple for MVP Phase 6
  // Or we can do two queries.

  const { data: buddyRelations } = await supabase
    .from("buddies")
    .select(
      `
      id,
      status,
      user_id,
      buddy_id,
      user_profile:profiles!user_id(*),
      buddy_profile:profiles!buddy_id(*)
    `
    )
    .or(`user_id.eq.${user.id},buddy_id.eq.${user.id}`);

  const buddies = buddyRelations || [];

  const badgeIcons: Record<string, JSX.Element> = {
    "First Blood": <Award className="h-6 w-6" />,
    "Iron Week": <Target className="h-6 w-6" />,
    Century: <Trophy className="h-6 w-6" />,
  };

  const badgeDisplay: Badge[] =
    badges?.map((b) => ({
      name: b.badge_name.toUpperCase(),
      description: b.badge_name,
      icon: badgeIcons[b.badge_name] || <Award className="h-6 w-6" />,
      isUnlocked: true,
      earnedAt: b.earned_at ? new Date(b.earned_at) : undefined,
    })) || [];

  return (
    <div className="container mx-auto max-w-md px-4 py-6 md:max-w-4xl lg:max-w-7xl">
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

      {/* Rank */}
      <div className="mb-8 flex justify-center">
        <RankBadge xp={profile?.xp || 0} showProgress size="md" />
      </div>

      {/* Badges */}
      <div className="mb-8">
        <h3 className="mb-3 font-heading text-sm font-bold uppercase text-muted-text">
          ACHIEVEMENTS
        </h3>
        {badgeDisplay.length > 0 ? (
          <BadgeDisplay badges={badgeDisplay} columns={2} />
        ) : (
          <p className="text-center text-sm text-muted-text">
            No badges earned yet. Complete missions to unlock.
          </p>
        )}
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
  );
}
