import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";

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
          <h1 className="text-tactical-red font-heading text-2xl">
            Profile Loading Error
          </h1>
          <p className="text-muted-text">
            We're having trouble loading your profile. Please try refreshing the
            page or contact support if the issue persists.
          </p>
          {/* Optionally, log the error for debugging: console.error(profileError) */}
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

  // Fetch Today's Meal (for Daily Ration)
  const { data: mealPlan } = await supabase
    .from("meal_plans")
    .select(
      `
      *,
      recipe:recipes(*)
    `
    )
    .eq("user_id", user.id)
    .eq("assigned_date", today)
    .maybeSingle();

  // Check if user is premium (not .223 tier)
  const isPremium = profile.tier !== ".223";

  return (
    <div className="container mx-auto max-w-md px-4 py-6 md:max-w-4xl lg:max-w-7xl">
      <DashboardClient
        user={user}
        profile={profile}
        todaysWorkout={workout}
        isCompleted={isCompleted}
        todaysMeal={mealPlan?.recipe || null}
        isPremium={isPremium}
      />
    </div>
  );
}
