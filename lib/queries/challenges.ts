import { createClient as createClientClient } from "@/lib/supabase/client";

/**
 * Get all active challenges
 */
export async function getActiveChallenges() {
  const supabase = createClientClient();

  const { data, error } = await supabase
    .from("challenges")
    .select(`
      *,
      participants_count:challenge_participants(count)
    `)
    .eq("status", "active")
    .order("start_date", { ascending: true });

  return { data, error };
}

/**
 * Join a challenge
 */
export async function joinChallenge(challengeId: string) {
  const supabase = createClientClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("challenge_participants")
    .insert({
      challenge_id: challengeId,
      user_id: user.id,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Get user's challenges (active and completed)
 */
export async function getUserChallenges(userId: string) {
  const supabase = createClientClient();

  const { data, error } = await supabase
    .from("challenge_participants")
    .select(`
      *,
      challenge:challenges(*)
    `)
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });

  return { data, error };
}

/**
 * Get challenge leaderboard (top participants)
 */
export async function getChallengeLeaderboard(
  challengeId: string
) {
  const supabase = createClientClient();

  const { data, error } = await supabase
    .from("challenge_participants")
    .select(`
      *,
      user:profiles!user_id(id, email, tier, xp, current_streak)
    `)
    .eq("challenge_id", challengeId)
    .order("progress", { ascending: false })
    .limit(50);

  return { data, error };
}

/**
 * Get user's participation in a specific challenge
 */
export async function getUserChallengeParticipation(
  userId: string,
  challengeId: string
) {
  const supabase = createClientClient();

  const { data, error } = await supabase
    .from("challenge_participants")
    .select("*")
    .eq("user_id", userId)
    .eq("challenge_id", challengeId)
    .maybeSingle();

  return { data, error };
}

/**
 * Leave a challenge (delete participation)
 */
export async function leaveChallenge(challengeId: string) {
  const supabase = createClientClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("challenge_participants")
    .delete()
    .eq("challenge_id", challengeId)
    .eq("user_id", user.id);

  return { error };
}
