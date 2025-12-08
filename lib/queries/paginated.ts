import { createClient } from "@/lib/supabase/client";

/**
 * Get paginated workout history for a user
 */
export async function getPaginatedWorkoutHistory(
  userId: string,
  page: number,
  pageSize: number
) {
  const supabase = createClient();
  const offset = (page - 1) * pageSize;

  // Get total count
  const { count, error: countError } = await supabase
    .from("user_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) throw countError;

  // Get paginated data
  const { data, error } = await supabase
    .from("user_logs")
    .select(
      `
      *,
      workout:workout_id (
        id,
        title,
        tier
      )
    `
    )
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) throw error;

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

/**
 * Get paginated roster for coach (all soldiers)
 */
export async function getPaginatedRoster(
  coachId: string,
  page: number,
  pageSize: number,
  searchQuery?: string
) {
  const supabase = createClient();
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .eq("coach_id", coachId) // Only get soldiers assigned to this coach
    .order("email", { ascending: true });

  // Apply search filter if provided
  if (searchQuery && searchQuery.trim()) {
    query = query.ilike("email", `%${searchQuery}%`);
  }

  // Get total count
  const { count, error: countError } = await query;

  if (countError) throw countError;

  // Get paginated data with range
  query = supabase
    .from("profiles")
    .select("*")
    .eq("coach_id", coachId)
    .order("email", { ascending: true });

  if (searchQuery && searchQuery.trim()) {
    query = query.ilike("email", `%${searchQuery}%`);
  }

  const { data, error } = await query.range(offset, offset + pageSize - 1);

  if (error) throw error;

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

/**
 * Get paginated messages for a conversation
 */
export async function getPaginatedConversation(
  userId: string,
  otherUserId: string,
  page: number,
  pageSize: number
) {
  const supabase = createClient();
  const offset = (page - 1) * pageSize;

  // Get total count
  const { count, error: countError } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .or(
      `and(from_user_id.eq.${userId},to_user_id.eq.${otherUserId}),and(from_user_id.eq.${otherUserId},to_user_id.eq.${userId})`
    );

  if (countError) throw countError;

  // Get paginated data (most recent first, but will be reversed in UI)
  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      from_user:from_user_id (
        id,
        full_name,
        role
      ),
      to_user:to_user_id (
        id,
        full_name,
        role
      )
    `
    )
    .or(
      `and(from_user_id.eq.${userId},to_user_id.eq.${otherUserId}),and(from_user_id.eq.${otherUserId},to_user_id.eq.${userId})`
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) throw error;

  return {
    data: (data || []).reverse(), // Reverse to show oldest first
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

/**
 * Get paginated buddies list
 */
export async function getPaginatedBuddies(
  userId: string,
  page: number,
  pageSize: number
) {
  const supabase = createClient();
  const offset = (page - 1) * pageSize;

  // Get total count of accepted buddies
  const { count, error: countError } = await supabase
    .from("buddies")
    .select("*", { count: "exact", head: true })
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .eq("status", "accepted");

  if (countError) throw countError;

  // Get paginated buddy data
  const { data, error } = await supabase
    .from("buddies")
    .select(
      `
      *,
      user1:user1_id (
        id,
        email,
        tier,
        role,
        current_streak,
        workout_count
      ),
      user2:user2_id (
        id,
        email,
        tier,
        role,
        current_streak,
        workout_count
      )
    `
    )
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .eq("status", "accepted")
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) throw error;

  // Transform data to return the buddy (not the current user)
  const buddies = (data || []).map((relation: any) => {
    const buddy = relation.user_id === userId ? relation.buddy : relation.user;
    return {
      ...buddy,
      buddyship_created_at: relation.created_at,
    };
  });

  return {
    data: buddies,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

/**
 * Get paginated recipes
 */
export async function getPaginatedRecipes(
  page: number,
  pageSize: number,
  searchQuery?: string
) {
  const supabase = createClient();
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("recipes")
    .select("*", { count: "exact" })
    .order("title", { ascending: true });

  // Apply search filter if provided
  if (searchQuery && searchQuery.trim()) {
    query = query.ilike("title", `%${searchQuery}%`);
  }

  // Get total count
  const { count, error: countError } = await query;

  if (countError) throw countError;

  // Get paginated data
  query = supabase
    .from("recipes")
    .select("*")
    .order("title", { ascending: true });

  if (searchQuery && searchQuery.trim()) {
    query = query.ilike("title", `%${searchQuery}%`);
  }

  const { data, error } = await query.range(offset, offset + pageSize - 1);

  if (error) throw error;

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}
