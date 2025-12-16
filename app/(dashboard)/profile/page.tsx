import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BuddySystem } from "@/components/social/buddy-system";
import {
  Shield,
  LogOut,
  Award,
  Target,
  Trophy,
  ClipboardList,
  Dumbbell,
  Medal,
  Users,
  TrendingUp,
  MessageSquare,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgeDisplay, type Badge } from "@/components/ui/badge-display";
import { RankBadge } from "@/components/ui/rank-badge";
import Link from "next/link";

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

  const isCoach = profile?.role === "coach";

  // Fetch coach-specific stats if user is a coach
  let assignedSoldiers = 0;
  let totalSoldierWorkouts = 0;
  let activeSoldiers = 0;

  if (isCoach) {
    // Get soldiers assigned to this coach
    const { data: soldiers } = await supabase
      .from("profiles")
      .select("id, last_active")
      .eq("coach_id", user.id);

    assignedSoldiers = soldiers?.length || 0;

    // Count active soldiers (active in last 7 days)
    if (soldiers) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      activeSoldiers = soldiers.filter((s) => {
        const lastActive = new Date(s.last_active);
        return lastActive >= sevenDaysAgo;
      }).length;
    }

    // Get total workouts completed by assigned soldiers
    if (soldiers && soldiers.length > 0) {
      const soldierIds = soldiers.map((s) => s.id);
      const { count } = await supabase
        .from("user_logs")
        .select("*", { count: "exact", head: true })
        .in("user_id", soldierIds);

      totalSoldierWorkouts = count || 0;
    }
  }

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

  const badgeIcons: Record<string, React.ReactElement> = {
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
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
            DOSSIER
          </h1>
          <p className="text-sm text-muted-text">Service Record & Squad</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/settings">
            <Button
              variant="outline"
              size="sm"
              className="border-steel/30 hover:border-tactical-red hover:bg-tactical-red/10 min-h-[44px]"
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
          <div className="rounded-sm border border-tactical-red bg-tactical-red/10 p-2">
            <Shield className="h-6 w-6 text-tactical-red" />
          </div>
        </div>
      </div>

      {/* Profile Stats */}
      {isCoach ? (
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="rounded-sm border border-steel bg-gunmetal p-4 text-center">
            <Users className="mx-auto mb-2 h-5 w-5 text-tactical-red" />
            <p className="text-xs text-muted-text">SQUAD SIZE</p>
            <p className="font-heading text-xl font-bold text-high-vis">
              {assignedSoldiers}
            </p>
          </div>
          <div className="rounded-sm border border-steel bg-gunmetal p-4 text-center">
            <TrendingUp className="mx-auto mb-2 h-5 w-5 text-radar-green" />
            <p className="text-xs text-muted-text">ACTIVE (7D)</p>
            <p className="font-heading text-xl font-bold text-radar-green">
              {activeSoldiers}
            </p>
          </div>
          <div className="rounded-sm border border-steel bg-gunmetal p-4 text-center col-span-2 sm:col-span-1">
            <Dumbbell className="mx-auto mb-2 h-5 w-5 text-high-vis" />
            <p className="text-xs text-muted-text">SQUAD MISSIONS</p>
            <p className="font-heading text-xl font-bold text-high-vis">
              {totalSoldierWorkouts}
            </p>
          </div>
        </div>
      ) : (
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
      )}

      {/* Rank */}
      <div className="mb-8 flex justify-center">
        <RankBadge xp={profile?.xp || 0} showProgress size="md" />
      </div>

      {/* Zero Day Re-qualification Link (for non-coaches) */}
      {!isCoach && (
        <div className="mb-8">
          <Link href="/zero-day">
            <div className="rounded-sm border-2 border-tactical-red bg-tactical-red/10 p-4 hover:bg-tactical-red/20 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-tactical-red flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-heading text-sm font-bold uppercase text-tactical-red mb-1">
                    ZERO DAY RE-QUALIFICATION
                  </h3>
                  <p className="text-xs text-muted-text">
                    Re-test to unlock higher tiers. Prove you're ready for the next level.
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Quick Links */}
      {isCoach ? (
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/barracks">
            <div className="rounded-sm border border-steel/30 bg-gunmetal p-3 text-center hover:border-tactical-red/50 transition-colors">
              <Shield className="mx-auto mb-1 h-5 w-5 text-tactical-red" />
              <p className="text-xs text-muted-text">Barracks</p>
            </div>
          </Link>
          <Link href="/barracks/content/roster">
            <div className="rounded-sm border border-steel/30 bg-gunmetal p-3 text-center hover:border-tactical-red/50 transition-colors">
              <Users className="mx-auto mb-1 h-5 w-5 text-tactical-red" />
              <p className="text-xs text-muted-text">Squad Roster</p>
            </div>
          </Link>
          <Link href="/barracks/content/workouts">
            <div className="rounded-sm border border-steel/30 bg-gunmetal p-3 text-center hover:border-tactical-red/50 transition-colors">
              <Dumbbell className="mx-auto mb-1 h-5 w-5 text-tactical-red" />
              <p className="text-xs text-muted-text">Mission Control</p>
            </div>
          </Link>
          <Link href="/barracks/content/recipes">
            <div className="rounded-sm border border-steel/30 bg-gunmetal p-3 text-center hover:border-tactical-red/50 transition-colors">
              <ClipboardList className="mx-auto mb-1 h-5 w-5 text-tactical-red" />
              <p className="text-xs text-muted-text">Recipes</p>
            </div>
          </Link>
          <Link href="/barracks/content/briefing">
            <div className="rounded-sm border border-steel/30 bg-gunmetal p-3 text-center hover:border-tactical-red/50 transition-colors">
              <MessageSquare className="mx-auto mb-1 h-5 w-5 text-tactical-red" />
              <p className="text-xs text-muted-text">Briefing</p>
            </div>
          </Link>
          <Link href="/leaderboard">
            <div className="rounded-sm border border-steel/30 bg-gunmetal p-3 text-center hover:border-tactical-red/50 transition-colors">
              <Trophy className="mx-auto mb-1 h-5 w-5 text-tactical-red" />
              <p className="text-xs text-muted-text">Ranks</p>
            </div>
          </Link>
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-3 gap-3">
          <Link href="/dossier">
            <div className="rounded-sm border border-steel/30 bg-gunmetal p-3 text-center hover:border-tactical-red/50 transition-colors">
              <ClipboardList className="mx-auto mb-1 h-5 w-5 text-tactical-red" />
              <p className="text-xs text-muted-text">Dossier</p>
            </div>
          </Link>
          <Link href="/records">
            <div className="rounded-sm border border-steel/30 bg-gunmetal p-3 text-center hover:border-tactical-red/50 transition-colors">
              <Medal className="mx-auto mb-1 h-5 w-5 text-tactical-red" />
              <p className="text-xs text-muted-text">PRs</p>
            </div>
          </Link>
          <Link href="/leaderboard">
            <div className="rounded-sm border border-steel/30 bg-gunmetal p-3 text-center hover:border-tactical-red/50 transition-colors">
              <Trophy className="mx-auto mb-1 h-5 w-5 text-tactical-red" />
              <p className="text-xs text-muted-text">Ranks</p>
            </div>
          </Link>
        </div>
      )}

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
      <BuddySystem userId={user.id} initialBuddies={buddies as any} />

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
