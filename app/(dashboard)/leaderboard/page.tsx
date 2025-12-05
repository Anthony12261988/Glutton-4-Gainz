import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LeaderboardClient } from "./leaderboard-client";

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is premium (only premium can access leaderboard)
  const { data: profile } = await supabase
    .from("profiles")
    .select("tier, xp")
    .eq("id", user.id)
    .single();

  const isPremium = profile?.tier !== ".223";

  // Fetch top 50 users by XP
  const { data: leaderboard } = await supabase
    .from("profiles")
    .select("id, email, xp, tier, current_streak, avatar_url")
    .order("xp", { ascending: false })
    .limit(50);

  // Find current user's rank
  const userRank = leaderboard?.findIndex((p) => p.id === user.id) ?? -1;

  return (
    <div className="container mx-auto max-w-md px-4 py-6 md:max-w-4xl lg:max-w-7xl">
      <LeaderboardClient
        leaderboard={leaderboard || []}
        currentUserId={user.id}
        userRank={userRank}
        isPremium={isPremium}
        userXp={profile?.xp || 0}
      />
    </div>
  );
}
