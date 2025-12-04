import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database.types";

type UserLog = Database["public"]["Tables"]["user_logs"]["Row"];
type UserLogInsert = Database["public"]["Tables"]["user_logs"]["Insert"];

/**
 * Get all user logs for a specific user
 * @param userId - User UUID
 * @param limit - Optional limit for pagination (default: 50)
 * @param offset - Optional offset for pagination
 */
export async function getUserLogs(
  userId: string,
  limit: number = 50,
  offset?: number
) {
  const supabase = createClient();

  let query = supabase
    .from("user_logs")
    .select(`
      *,
      workouts (
        id,
        title,
        tier,
        video_url,
        sets_reps
      )
    `)
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (limit) {
    query = query.range(offset || 0, (offset || 0) + limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching user logs:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Check if user has already logged a specific workout today
 * @param userId - User UUID
 * @param workoutId - Workout UUID
 * @returns true if logged, false otherwise
 */
export async function hasLoggedToday(userId: string, workoutId: string) {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("user_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("workout_id", workoutId)
    .eq("date", today)
    .maybeSingle();

  if (error) {
    console.error("Error checking if workout logged:", error);
    return { hasLogged: false, error };
  }

  return { hasLogged: !!data, error: null };
}

/**
 * Create a new workout log entry
 * Note: Database trigger will handle XP, streak, and badge awards
 * @param logData - Workout log data
 */
export async function createUserLog(logData: UserLogInsert) {
  const supabase = createClient();

  // Ensure date is set to today if not provided
  const logWithDate: UserLogInsert = {
    ...logData,
    date: logData.date || new Date().toISOString().split("T")[0],
  };

  const { data, error } = await supabase
    .from("user_logs")
    .insert(logWithDate)
    .select()
    .single();

  if (error) {
    console.error("Error creating user log:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get user log statistics
 * @param userId - User UUID
 * @returns Total logs count, total XP (from profile), current streak
 */
export async function getUserLogStats(userId: string) {
  const supabase = createClient();

  // Get total log count
  const { count: totalLogs, error: countError } = await supabase
    .from("user_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) {
    console.error("Error fetching log count:", countError);
    return { data: null, error: countError };
  }

  // Get profile for XP and streak (which are maintained by DB triggers)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("xp, current_streak")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("Error fetching profile stats:", profileError);
    return { data: null, error: profileError };
  }

  return {
    data: {
      totalLogs: totalLogs || 0,
      totalXP: profile.xp,
      currentStreak: profile.current_streak,
    },
    error: null,
  };
}

/**
 * Get workout logs for a specific date range
 * @param userId - User UUID
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 */
export async function getUserLogsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_logs")
    .select(`
      *,
      workouts (
        id,
        title,
        tier
      )
    `)
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching logs by date range:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get the most recent workout log for a user
 * @param userId - User UUID
 */
export async function getLatestUserLog(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_logs")
    .select(`
      *,
      workouts (
        id,
        title,
        tier,
        video_url
      )
    `)
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching latest log:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Update a user log (duration or notes)
 * @param logId - Log UUID
 * @param updates - Partial log data to update
 */
export async function updateUserLog(
  logId: string,
  updates: { duration?: number; notes?: string }
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_logs")
    .update(updates)
    .eq("id", logId)
    .select()
    .single();

  if (error) {
    console.error("Error updating user log:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Delete a user log
 * @param logId - Log UUID
 */
export async function deleteUserLog(logId: string) {
  const supabase = createClient();

  const { error } = await supabase.from("user_logs").delete().eq("id", logId);

  if (error) {
    console.error("Error deleting user log:", error);
    return { success: false, error };
  }

  return { success: true, error: null };
}

/**
 * Get log count by week for consistency tracking
 * @param userId - User UUID
 * @param weeks - Number of weeks to look back (default: 4)
 */
export async function getLogCountByWeek(userId: string, weeks: number = 4) {
  const supabase = createClient();

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);

  const { data, error } = await supabase
    .from("user_logs")
    .select("date")
    .eq("user_id", userId)
    .gte("date", startDate.toISOString().split("T")[0])
    .lte("date", endDate.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching log count by week:", error);
    return { data: null, error };
  }

  // Group by week
  const weeklyData: { week: string; count: number }[] = [];
  const weekMap = new Map<number, number>();

  data.forEach((log) => {
    const logDate = new Date(log.date);
    const weekNum = Math.floor(
      (endDate.getTime() - logDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    if (weekNum >= 0 && weekNum < weeks) {
      weekMap.set(weekNum, (weekMap.get(weekNum) || 0) + 1);
    }
  });

  // Create array with all weeks (including 0 count weeks)
  for (let i = weeks - 1; i >= 0; i--) {
    weeklyData.push({
      week: `Week ${weeks - i}`,
      count: weekMap.get(i) || 0,
    });
  }

  return { data: weeklyData, error: null };
}
