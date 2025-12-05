import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StatsClient from "./stats-client";

export default async function StatsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - 27); // last 4 weeks
  const startDate = start.toISOString().split("T")[0];

  // Fetch User Logs for Consistency
  // Only last 4 weeks
  const { data: logs } = await supabase
    .from("user_logs")
    .select("id, date, duration, notes, workout_id")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .order("date", { ascending: true });

  // Fetch workout titles for the logs
  const workoutIds = [...new Set(logs?.map((l) => l.workout_id).filter(Boolean) || [])];
  const { data: workoutsData } = workoutIds.length > 0
    ? await supabase
        .from("workouts")
        .select("id, title")
        .in("id", workoutIds)
    : { data: [] };

  const workoutTitleMap = new Map(workoutsData?.map((w) => [w.id, w.title]) || []);

  // Raw logs for history
  const rawLogs = logs?.map((log) => ({
    ...log,
    workout_title: log.workout_id ? workoutTitleMap.get(log.workout_id) || "Unknown" : "Unknown",
  })) || [];

  // Process logs into weekly consistency
  const consistencyMap = new Map<string, number>();
  logs?.forEach((log) => {
    const date = new Date(log.date);
    // Get start of week (Sunday)
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekStart = new Date(date.setDate(diff));
    const weekKey = weekStart.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    consistencyMap.set(weekKey, (consistencyMap.get(weekKey) || 0) + 1);
  });

  const consistencyData = Array.from(consistencyMap.entries()).map(
    ([week, workouts]) => ({
      week,
      workouts,
    })
  );

  // XP progression (cumulative, 100 per log)
  let cumulative = 0;
  const xpData =
    logs?.map((log) => {
      cumulative += 100;
      return {
        date: new Date(log.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        xp: cumulative,
      };
    }) || [];

  // Fetch Body Metrics
  const { data: metrics } = await supabase
    .from("body_metrics")
    .select("id, recorded_at, weight")
    .eq("user_id", user.id)
    .order("recorded_at", { ascending: true });

  const weightData =
    metrics?.map((m) => ({
      date: new Date(m.recorded_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      weight: m.weight,
    })) || [];

  // Raw metrics for edit/delete
  const rawMetrics = metrics || [];

  return (
    <div className="container mx-auto max-w-md px-4 py-6 md:max-w-4xl lg:max-w-7xl">
      <StatsClient
        consistencyData={consistencyData}
        weightData={weightData}
        xpData={xpData}
        userId={user.id}
        rawMetrics={rawMetrics}
        rawLogs={rawLogs}
      />
    </div>
  );
}
