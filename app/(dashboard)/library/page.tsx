import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WorkoutLibraryClient } from "./library-client";

export default async function WorkoutLibraryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user's profile for tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("tier")
    .eq("id", user.id)
    .single();

  // Fetch all workouts
  const { data: workouts } = await supabase
    .from("workouts")
    .select("*")
    .order("scheduled_date", { ascending: false });

  // Get unique tiers
  const tiers = [...new Set(workouts?.map((w) => w.tier) || [])].sort();

  return (
    <div className="container mx-auto max-w-md px-4 py-6 md:max-w-4xl lg:max-w-7xl">
      <WorkoutLibraryClient
        workouts={workouts || []}
        userTier={profile?.tier || ".223"}
        tiers={tiers}
      />
    </div>
  );
}
