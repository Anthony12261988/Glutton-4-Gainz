import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CoachDashboard from "./coach-dashboard";
import { Navigation } from "@/components/ui/navigation";
import { ShieldAlert } from "lucide-react";

export default async function BarracksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify Coach Role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "coach") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-camo-black p-4 text-center">
        <ShieldAlert className="mb-4 h-16 w-16 text-tactical-red" />
        <h1 className="font-heading text-3xl text-tactical-red">
          RESTRICTED AREA
        </h1>
        <p className="text-muted-text">Clearance Level: COACH required.</p>
        <p className="mt-2 text-sm text-steel">Return to base immediately.</p>
      </div>
    );
  }

  // Fetch Assigned Trainees
  // Note: RLS should handle filtering, but we can also be explicit
  const { data: trainees } = await supabase
    .from("profiles")
    .select("*")
    .eq("coach_id", user.id);

  return (
    <div className="min-h-screen bg-camo-black pb-24">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
            THE BARRACKS
          </h1>
          <p className="text-sm text-muted-text">
            Squad Management & Command Center
          </p>
        </div>

        <CoachDashboard coachId={user.id} initialTrainees={trainees || []} />
      </div>
      <Navigation />
    </div>
  );
}
