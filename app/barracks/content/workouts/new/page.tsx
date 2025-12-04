import { WorkoutForm } from "@/components/coach/workout-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewWorkoutPage() {
  return (
    <div className="min-h-screen bg-camo-black pb-24 text-white">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Link href="/barracks/content/workouts" className="flex items-center text-steel hover:text-white mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Missions
        </Link>
        
        <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis mb-8">
          Create New Mission
        </h1>

        <WorkoutForm />
      </div>
    </div>
  );
}
