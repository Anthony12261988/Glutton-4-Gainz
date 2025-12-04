import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StatsClient from "./stats-client";
import { Navigation } from "@/components/ui/navigation";

export default async function StatsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch User Logs for Consistency
  // We want to group by week. For simplicity in this MVP, let's fetch last 30 days logs
  // and process them on the client or here.
  const { data: logs } = await supabase
    .from("user_logs")
    .select("date")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  // Process logs into weekly consistency
  // This is a simplified implementation. In a real app, use a DB view or more robust date math.
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
    <div className="min-h-screen bg-camo-black">
      <div className="container mx-auto max-w-md px-4 py-6">
        <StatsClient
          consistencyData={consistencyData}
          weightData={weightData}
          xpData={[]}
        />
      </div>
      <Navigation />
    </div>
  );
}
