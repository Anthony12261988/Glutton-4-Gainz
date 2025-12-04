import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RationsClient from "./rations-client";
import { Navigation } from "@/components/ui/navigation";

export default async function RationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch Recipes
  const { data: recipes } = await supabase
    .from("recipes")
    .select("*")
    .order("title");

  // Fetch Meal Plans for the user (future optimization: filter by date range)
  const { data: mealPlans } = await supabase
    .from("meal_plans")
    .select(
      `
      *,
      recipe:recipes(*)
    `
    )
    .eq("user_id", user.id);

  return (
    <div className="min-h-screen bg-camo-black">
      <div className="container mx-auto max-w-md px-4 py-6">
        <RationsClient
          user={user}
          initialRecipes={recipes || []}
          initialMealPlans={mealPlans || []}
        />
      </div>
      <Navigation />
    </div>
  );
}
