import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";
import { hasPremiumAccess } from "@/lib/utils/premium-access";
import { getTodaysFeaturedMeal } from "@/lib/queries/featured-meals";

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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-tactical-red font-heading text-2xl">
            Profile Loading Error
          </h1>
          <p className="text-muted-text">
            We're having trouble loading your profile. Please try refreshing the
            page or contact support if the issue persists.
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    redirect("/onboarding");
  }

  // Admins should go to command, not dashboard
  if (profile.role === "admin") {
    redirect("/command");
  }

  // Coaches should go to barracks, not dashboard
  if (profile.role === "coach") {
    redirect("/barracks");
  }

  // If regular user hasn't completed onboarding, redirect to onboarding
  // (Only applies to soldiers/recruits, not admin/coach)
  if (!profile.onboarding_completed) {
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

  // Check if user is premium (role-based only - tiers no longer grant premium)
  const isPremium = hasPremiumAccess(profile);

  // Fetch Today's Meal
  let todaysMeal: any = null;

  if (isPremium) {
    // Premium users: fetch their meal plan
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

    todaysMeal = mealPlan?.recipe || null;
  } else {
    // Free users: show featured meal of the day
    const { data: featuredMeal } = await getTodaysFeaturedMeal();
    todaysMeal = featuredMeal?.recipe || null;
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-6 md:max-w-4xl lg:max-w-7xl">
      <DashboardClient
        user={user}
        profile={profile}
        todaysWorkout={workout}
        isCompleted={isCompleted}
        todaysMeal={todaysMeal}
        isPremium={isPremium}
      />
    </div>
  );
}
