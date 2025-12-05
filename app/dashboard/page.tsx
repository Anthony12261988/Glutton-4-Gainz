import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";
import { Navigation } from "@/components/ui/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch Profile with error handling
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // If there's an RLS error, don't redirect - show error instead
  if (profileError) {
    // Don't redirect on error - this prevents infinite loops
    return (
      <div className="min-h-screen bg-camo-black flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-tactical-red font-heading text-2xl">DATABASE ERROR</h1>
          <p className="text-muted-text">Error: {profileError.message}</p>
          <p className="text-muted-text text-sm">Please check your Supabase RLS policies.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    redirect("/onboarding");
  }

  // Fetch Today's Workout
  // Logic: Get workout for today's date AND user's tier
  const today = new Date().toISOString().split("T")[0];

  const { data: workout } = await supabase
    .from("workouts")
    .select("*")
    .eq("tier", profile.tier)
    .eq("scheduled_date", today)
    .single();

  // Check if already completed
  let isCompleted = false;
  if (workout) {
    const { data: log } = await supabase
      .from("user_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("workout_id", workout.id)
      .eq("date", today)
      .single();

    if (log) isCompleted = true;
  }

  return (
    <div className="min-h-screen bg-camo-black pb-20">
      <div className="container mx-auto max-w-md px-4 py-6">
        <DashboardClient
          user={user}
          profile={profile}
          todaysWorkout={workout}
          isCompleted={isCompleted}
        />
      </div>
      <Navigation />
    </div>
  );
}
