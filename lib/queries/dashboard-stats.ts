import { createClient as createClientClient } from "@/lib/supabase/client";

/**
 * Get recent activity (workout logs) for a user
 */
export async function getRecentActivity(userId: string, days = 7) {
  const supabase = createClientClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from("user_logs")
    .select("date")
    .eq("user_id", userId)
    .gte("date", startDate.toISOString().split("T")[0])
    .order("date", { ascending: true });

  return { data, error };
}

/**
 * Get XP trend over time
 */
export async function getXPTrend(userId: string, days = 30) {
  const supabase = createClientClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Calculate XP progression from workout logs
  const { data, error } = await supabase
    .from("user_logs")
    .select("date")
    .eq("user_id", userId)
    .gte("date", startDate.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (error) return { data: null, error };

  // Calculate cumulative XP
  let cumulativeXP = 0;
  const xpData = data.map((log) => {
    cumulativeXP += 100; // 100 XP per workout
    return {
      date: log.date,
      xp: cumulativeXP,
    };
  });

  return { data: xpData, error: null };
}

/**
 * Get weight trend over time
 */
export async function getWeightTrend(userId: string, days = 30) {
  const supabase = createClientClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from("body_metrics")
    .select("recorded_at, weight")
    .eq("user_id", userId)
    .gte("recorded_at", startDate.toISOString())
    .order("recorded_at", { ascending: true });

  return { data, error };
}

/**
 * Get streak history for sparkline
 */
export async function getStreakHistory(userId: string, days = 30) {
  const supabase = createClientClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from("user_logs")
    .select("date")
    .eq("user_id", userId)
    .gte("date", startDate.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (error) return { data: null, error };

  // Fill in missing dates to show gaps
  const logs = data || [];
  const filledData = [];
  const start = new Date(startDate);
  const today = new Date();

  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const hasLog = logs.some((log) => log.date === dateStr);
    filledData.push({
      date: dateStr,
      completed: hasLog ? 1 : 0,
    });
  }

  return { data: filledData, error: null };
}
