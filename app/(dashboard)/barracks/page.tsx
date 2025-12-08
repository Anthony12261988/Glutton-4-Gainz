import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CoachDashboard from "./coach-dashboard";
import { ShieldAlert } from "lucide-react";
import { CoachProfilePrompt } from "@/components/coach/coach-profile-prompt";

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
      <div className="flex min-h-screen flex-col items-center justify-center bg-camo-black p-4 text-center">
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

  const activeTrainees = trainees?.filter((t) => {
    const lastActive = new Date(t.last_active);
    return lastActive >= sevenDaysAgo;
  }).length || 0;

  // Get total workouts from all squad members
  let totalSquadWorkouts = 0;
  if (trainees && trainees.length > 0) {
    const traineeIds = trainees.map((t) => t.id);
    const { count } = await supabase
      .from("workout_logs")
      .select("*", { count: "exact", head: true })
      .in("user_id", traineeIds);

    totalSquadWorkouts = count || 0;
  }

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
          <p className="text-xs text-muted-text uppercase tracking-wide mb-2">Squad Size</p>
          <p className="font-heading text-3xl font-bold text-high-vis">{squadSize}</p>
          <p className="text-xs text-steel mt-1">Total assigned soldiers</p>
        </div>
        <div className="rounded-sm border border-steel/30 bg-gunmetal p-4">
          <p className="text-xs text-muted-text uppercase tracking-wide mb-2">Active (7D)</p>
          <p className="font-heading text-3xl font-bold text-radar-green">{activeTrainees}</p>
          <p className="text-xs text-steel mt-1">Active in last 7 days</p>
        </div>
        <div className="rounded-sm border border-steel/30 bg-gunmetal p-4">
          <p className="text-xs text-muted-text uppercase tracking-wide mb-2">Squad Missions</p>
          <p className="font-heading text-3xl font-bold text-tactical-red">{totalSquadWorkouts}</p>
          <p className="text-xs text-steel mt-1">Total completed workouts</p>
        </div>
      </div>

      <CoachDashboard
        coachId={user.id}
        initialTrainees={(trainees || []) as any}
      />
    </div>
  );
}
