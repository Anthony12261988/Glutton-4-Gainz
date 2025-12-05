import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";

export default async function WorkoutManagerPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify Coach Role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "coach") redirect("/dashboard");

  const { data: workouts } = await supabase
    .from("workouts")
    .select("*")
    .order("scheduled_date", { ascending: false });

  return (
    <div className="min-h-screen bg-camo-black pb-24 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/barracks"
              className="flex items-center text-steel hover:text-white mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Barracks
            </Link>
            <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
              Mission Control
            </h1>
            <p className="text-steel">Manage daily missions and workouts</p>
          </div>
          <Link href="/barracks/content/workouts/new">
            <Button className="bg-tactical-red hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" /> New Mission
            </Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {workouts?.map((workout) => (
            <Card key={workout.id} className="border-steel/20 bg-gunmetal">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold text-white">
                  {workout.title}
                </CardTitle>
                <div className="flex gap-2">
                  <Link href={`/barracks/content/workouts/${workout.id}`}>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4 text-steel" />
                    </Button>
                  </Link>
                  {/* Delete button would go here - needs client component or server action */}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-steel">
                  <span>Tier: {workout.tier}</span>
                  <span>
                    Date:{" "}
                    {new Date(workout.scheduled_date).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          {workouts?.length === 0 && (
            <div className="text-center py-12 text-steel">
              No missions found. Create one to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
