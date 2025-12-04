import { createClient } from "@/lib/supabase/client";

/**
 * Get consistency data for a user (workout count by week)
 * @param userId - User UUID
 * @param weeks - Number of weeks to look back (default: 4)
 */
export async function getConsistencyData(userId: string, weeks: number = 4) {
  const supabase = createClient();

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);

  const { data: logs, error } = await supabase
    .from("user_logs")
    .select("date")
    .eq("user_id", userId)
    .gte("date", startDate.toISOString().split("T")[0])
    .lte("date", endDate.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching consistency data:", error);
    return { data: null, error };
  }

  // Group by week
  const weeklyData: { week: string; count: number }[] = [];
  const weekMap = new Map<number, number>();

  logs.forEach((log) => {
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

/**
 * Get body metrics (weight tracking) for a user
 * @param userId - User UUID
 * @param limit - Optional limit for number of entries (default: all)
 */
export async function getBodyMetrics(userId: string, limit?: number) {
  const supabase = createClient();

  let query = supabase
    .from("body_metrics")
    .select("*")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: true });

  if (limit) {
    // Get the most recent N entries
    const { data: allData, error: countError } = await supabase
      .from("body_metrics")
      .select("*")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false })
      .limit(limit);

    if (countError) {
      console.error("Error fetching body metrics:", countError);
      return { data: null, error: countError };
    }

    // Reverse to get chronological order
    return { data: allData?.reverse() || [], error: null };
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching body metrics:", error);
    return { data: null, error };
  }

  // Format for chart: { date: string, weight: number }
  const chartData =
    data?.map((metric) => ({
      date: new Date(metric.recorded_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      weight: Number(metric.weight),
    })) || [];

  return { data: chartData, error: null };
}

/**
 * Add a body metric entry (weight)
 * @param userId - User UUID
 * @param weight - Weight value
 * @param recordedAt - Optional date (defaults to today)
 */
export async function addBodyMetric(
  userId: string,
  weight: number,
  recordedAt?: string
) {
  const supabase = createClient();

  const date = recordedAt || new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("body_metrics")
    .insert({
      user_id: userId,
      weight,
      recorded_at: date,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding body metric:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Update a body metric entry
 * @param metricId - Metric UUID
 * @param weight - New weight value
 */
export async function updateBodyMetric(metricId: string, weight: number) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("body_metrics")
    .update({ weight })
    .eq("id", metricId)
    .select()
    .single();

  if (error) {
    console.error("Error updating body metric:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Delete a body metric entry
 * @param metricId - Metric UUID
 */
export async function deleteBodyMetric(metricId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("body_metrics")
    .delete()
    .eq("id", metricId);

  if (error) {
    console.error("Error deleting body metric:", error);
    return { success: false, error };
  }

  return { success: true, error: null };
}

/**
 * Get XP progression data for charts
 * @param userId - User UUID
 * @returns Array of { date, xp } showing XP accumulation over time
 */
export async function getXPProgressionData(userId: string) {
  const supabase = createClient();

  // Get all user logs with dates
  const { data: logs, error } = await supabase
    .from("user_logs")
    .select("date")
    .eq("user_id", userId)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching XP progression:", error);
    return { data: null, error };
  }

  // Calculate cumulative XP (100 XP per workout)
  let cumulativeXP = 0;
  const xpData = logs.map((log) => {
    cumulativeXP += 100;
    return {
      date: new Date(log.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      xp: cumulativeXP,
    };
  });

  return { data: xpData, error: null };
}

/**
 * Get dashboard summary statistics
 * @param userId - User UUID
 */
export async function getDashboardStats(userId: string) {
  const supabase = createClient();

  // Get profile data (XP, streak)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("xp, current_streak, tier")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    return { data: null, error: profileError };
  }

  // Get total workout count
  const { count: totalWorkouts, error: countError } = await supabase
    .from("user_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) {
    console.error("Error counting workouts:", countError);
    return { data: null, error: countError };
  }

  // Get badge count
  const { count: badgeCount, error: badgeError } = await supabase
    .from("user_badges")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (badgeError) {
    console.error("Error counting badges:", badgeError);
    return { data: null, error: badgeError };
  }

  return {
    data: {
      xp: profile.xp,
      currentStreak: profile.current_streak,
      tier: profile.tier,
      totalWorkouts: totalWorkouts || 0,
      badgesEarned: badgeCount || 0,
    },
    error: null,
  };
}

/**
 * Get average workouts per week
 * @param userId - User UUID
 * @param weeks - Number of weeks to calculate average (default: 4)
 */
export async function getAverageWorkoutsPerWeek(
  userId: string,
  weeks: number = 4
) {
  const supabase = createClient();

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);

  const { count, error } = await supabase
    .from("user_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("date", startDate.toISOString().split("T")[0])
    .lte("date", endDate.toISOString().split("T")[0]);

  if (error) {
    console.error("Error calculating average workouts:", error);
    return { data: null, error };
  }

  const average = count ? (count / weeks).toFixed(1) : "0.0";

  return { data: { average: parseFloat(average), totalWeeks: weeks }, error: null };
}
