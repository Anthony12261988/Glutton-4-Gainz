import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import CoachDashboard from "./coach-dashboard";
import { ShieldAlert, Dumbbell, ChefHat, ArrowRight } from "lucide-react";
import { CoachProfilePrompt } from "@/components/coach/coach-profile-prompt";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function BarracksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify Coach or Admin Role and get full profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, avatar_url")
    .eq("id", user.id)
    .single();

  const isCoachOrAdmin = profile?.role === "coach" || profile?.role === "admin";

  if (!isCoachOrAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <ShieldAlert className="mb-4 h-16 w-16 text-tactical-red" />
        <h1 className="font-heading text-3xl text-tactical-red">
          RESTRICTED AREA
        </h1>
        <p className="text-muted-text">
          Clearance Level: COACH or ADMIN required.
        </p>
        <p className="mt-2 text-sm text-steel">Return to base immediately.</p>
      </div>
    );
  }

  // Check if profile is incomplete (no avatar for coaches)
  const isProfileIncomplete = !profile?.avatar_url;

  // Fetch Assigned Trainees
  const { data: trainees } = await supabase
    .from("profiles")
    .select("*")
    .eq("coach_id", user.id);

  // Calculate squad stats
  const squadSize = trainees?.length || 0;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const activeTrainees =
    trainees?.filter((t) => {
      const lastActive = new Date(t.last_active);
      return lastActive >= sevenDaysAgo;
    }).length || 0;

  // Get total workouts from all squad members
  let totalSquadWorkouts = 0;
  if (trainees && trainees.length > 0) {
    const traineeIds = trainees.map((t) => t.id);
    const { count } = await supabase
      .from("user_logs")
      .select("*", { count: "exact", head: true })
      .in("user_id", traineeIds);

    totalSquadWorkouts = count || 0;
  }

  // Get content counts for coach guidance
  const { count: workoutCount } = await supabase
    .from("workouts")
    .select("*", { count: "exact", head: true });

  const { count: recipeCount } = await supabase
    .from("recipes")
    .select("*", { count: "exact", head: true });

  const hasWorkouts = (workoutCount || 0) > 0;
  const hasRecipes = (recipeCount || 0) > 0;
  const needsContent = !hasWorkouts || !hasRecipes;

  return (
    <div className="container mx-auto px-4 py-6 md:max-w-7xl pb-20 md:pb-8">
      {/* Coach Profile Prompt */}
      {isProfileIncomplete && profile?.role === "coach" && (
        <CoachProfilePrompt />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
          THE BARRACKS
        </h1>
        <p className="text-sm text-muted-text">
          Squad Management & Command Center
        </p>
      </div>

      {/* Squad Stats Overview */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-sm border border-steel/30 bg-gunmetal p-4">
          <p className="text-xs text-muted-text uppercase tracking-wide mb-2">
            Squad Size
          </p>
          <p className="font-heading text-3xl font-bold text-high-vis">
            {squadSize}
          </p>
          <p className="text-xs text-steel mt-1">Total assigned soldiers</p>
        </div>
        <div className="rounded-sm border border-steel/30 bg-gunmetal p-4">
          <p className="text-xs text-muted-text uppercase tracking-wide mb-2">
            Active (7D)
          </p>
          <p className="font-heading text-3xl font-bold text-radar-green">
            {activeTrainees}
          </p>
          <p className="text-xs text-steel mt-1">Active in last 7 days</p>
        </div>
        <div className="rounded-sm border border-steel/30 bg-gunmetal p-4">
          <p className="text-xs text-muted-text uppercase tracking-wide mb-2">
            Squad Missions
          </p>
          <p className="font-heading text-3xl font-bold text-tactical-red">
            {totalSquadWorkouts}
          </p>
          <p className="text-xs text-steel mt-1">Total completed workouts</p>
        </div>
      </div>

      {/* Content Management Quick Access */}
      {needsContent && (
        <div className="mb-8 rounded-sm border-2 border-dashed border-tactical-red/50 bg-tactical-red/5 p-6">
          <h3 className="font-heading text-lg font-bold uppercase text-high-vis mb-2">
            ⚠️ CONTENT REQUIRED
          </h3>
          <p className="text-sm text-muted-text mb-4">
            Your soldiers need content to train! Create workouts and recipes so
            they can start their missions.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`rounded-sm border p-4 relative overflow-hidden ${
                hasWorkouts
                  ? "border-radar-green/30 bg-radar-green/5"
                  : "border-tactical-red/30 bg-gunmetal"
              }`}
            >
              {/* Background icon watermark */}
              <div className="absolute -right-8 -top-8 opacity-10">
                <Image
                  src="/imageAssests/Branding/Glutton4Gainz FF_Highlight Icon Workout.png"
                  alt=""
                  width={120}
                  height={120}
                />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Dumbbell
                      className={`h-5 w-5 ${
                        hasWorkouts ? "text-radar-green" : "text-tactical-red"
                      }`}
                    />
                    <span className="font-bold text-high-vis">Workouts</span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-sm ${
                      hasWorkouts
                        ? "bg-radar-green/20 text-radar-green"
                        : "bg-tactical-red/20 text-tactical-red"
                    }`}
                  >
                    {workoutCount || 0} created
                  </span>
                </div>
                <p className="text-xs text-muted-text mb-3">
                  {hasWorkouts
                    ? "Great! Soldiers can see your workouts in the Library."
                    : "Create workouts for soldiers to complete as daily missions."}
                </p>
                <Link href="/barracks/content/workouts">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-steel/30"
                  >
                    {hasWorkouts ? "Manage Workouts" : "Create First Workout"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div
              className={`rounded-sm border p-4 relative overflow-hidden ${
                hasRecipes
                  ? "border-radar-green/30 bg-radar-green/5"
                  : "border-tactical-red/30 bg-gunmetal"
              }`}
            >
              {/* Background icon watermark */}
              <div className="absolute -right-8 -top-8 opacity-10">
                <Image
                  src="/imageAssests/Branding/Glutton4Gainz FF_Highlight Icon Mindset.png"
                  alt=""
                  width={120}
                  height={120}
                />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ChefHat
                      className={`h-5 w-5 ${
                        hasRecipes ? "text-radar-green" : "text-tactical-red"
                      }`}
                    />
                    <span className="font-bold text-high-vis">Recipes</span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-sm ${
                      hasRecipes
                        ? "bg-radar-green/20 text-radar-green"
                        : "bg-tactical-red/20 text-tactical-red"
                    }`}
                  >
                    {recipeCount || 0} created
                  </span>
                </div>
                <p className="text-xs text-muted-text mb-3">
                  {hasRecipes
                    ? "Great! Soldiers can plan meals in the Rations section."
                    : "Create recipes for soldiers to add to their meal plans."}
                </p>
                <Link href="/barracks/content/recipes">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-steel/30"
                  >
                    {hasRecipes ? "Manage Recipes" : "Create First Recipe"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Management - Always visible */}
      {!needsContent && (
        <div className="mb-8 rounded-sm border border-steel/30 bg-gunmetal p-6">
          <h3 className="font-heading text-lg font-bold uppercase text-high-vis mb-4">
            CONTENT MANAGEMENT
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/barracks/content/workouts">
              <Button
                variant="outline"
                className="w-full border-steel/30 h-auto py-4 flex flex-col items-center gap-2"
              >
                <Dumbbell className="h-5 w-5 text-tactical-red" />
                <span>Manage Workouts</span>
                <span className="text-xs text-muted-text">{workoutCount || 0} created</span>
              </Button>
            </Link>
            <Link href="/barracks/content/recipes">
              <Button
                variant="outline"
                className="w-full border-steel/30 h-auto py-4 flex flex-col items-center gap-2"
              >
                <ChefHat className="h-5 w-5 text-tactical-red" />
                <span>Manage Recipes</span>
                <span className="text-xs text-muted-text">{recipeCount || 0} created</span>
              </Button>
            </Link>
            <Link href="/barracks/content/workouts/new">
              <Button
                className="w-full bg-tactical-red hover:bg-red-700 h-auto py-4 flex flex-col items-center gap-2"
              >
                <Dumbbell className="h-5 w-5" />
                <span>New Workout</span>
              </Button>
            </Link>
            <Link href="/barracks/content/recipes/new">
              <Button
                className="w-full bg-tactical-red hover:bg-red-700 h-auto py-4 flex flex-col items-center gap-2"
              >
                <ChefHat className="h-5 w-5" />
                <span>New Recipe</span>
              </Button>
            </Link>
          </div>
        </div>
      )}

      <CoachDashboard
        coachId={user.id}
        initialTrainees={(trainees || []) as any}
      />
    </div>
  );
}
