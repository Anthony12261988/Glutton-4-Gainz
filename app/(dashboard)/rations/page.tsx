import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RationsClient from "./rations-client";
import { hasPremiumAccess } from "@/lib/utils/premium-access";

export default async function RationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch Profile to enforce premium access
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, tier")
    .eq("id", user.id)
    .single();

  // Only premium (soldier/coach/admin or paid tier) can access meal planner
  if (!hasPremiumAccess(profile)) {
    redirect("/pricing");
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
    <div className="container mx-auto max-w-md px-4 py-6 md:max-w-4xl lg:max-w-7xl">
      <RationsClient
        user={user}
        initialRecipes={recipes || []}
        initialMealPlans={mealPlans || []}
      />
    </div>
  );
}
