import { createClient } from "@/lib/supabase/server";
import { WorkoutForm } from "@/components/coach/workout-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isCoachOrAdmin = profile?.role === "coach" || profile?.role === "admin";
  if (!isCoachOrAdmin) {
    redirect("/dashboard");
  }

  const { data: workout } = await supabase
    .from("workouts")
    .select("*")
    .eq("id", id)
    .single();

  if (!workout) {
    redirect("/barracks/content/workouts");
  }

  return (
    <div className="min-h-screen pb-24 text-white">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Link
          href="/barracks/content/workouts"
          className="flex items-center text-steel hover:text-white mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Missions
        </Link>

        <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis mb-8">
          Edit Mission
        </h1>

        <WorkoutForm initialData={workout} isEditing={true} />
      </div>
    </div>
  );
}
