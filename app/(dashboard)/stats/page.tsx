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
    .select("date")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .order("date", { ascending: true });

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
    .select("recorded_at, weight")
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

  return (
    <div className="container mx-auto max-w-md px-4 py-6 md:max-w-4xl lg:max-w-7xl">
      <StatsClient
        consistencyData={consistencyData}
        weightData={weightData}
        xpData={xpData}
        userId={user.id}
      />
    </div>
  );
}
