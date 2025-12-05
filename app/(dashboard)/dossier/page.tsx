import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DossierPageClient } from "./dossier-client";

export default async function FitnessDossierPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
      fitness_experience,
      fitness_goal,
      available_equipment,
      injuries_limitations,
      preferred_duration,
      workout_days_per_week,
      height_inches,
      target_weight,
      date_of_birth,
      gender,
      dossier_complete
    `
    )
    .eq("id", user.id)
    .single();

  return (
    <div className="container mx-auto max-w-md px-4 py-6 md:max-w-4xl lg:max-w-7xl">
      <DossierPageClient userId={user.id} existingData={profile} />
    </div>
  );
}
