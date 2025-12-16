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

  // Fetch Profile to check access
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, tier")
    .eq("id", user.id)
    .single();

  const isPremium = hasPremiumAccess(profile);

  // Fetch Recipes - RLS automatically filters based on user's premium status
  // Free users (.223 Recruits) only see standard_issue recipes
  // Premium users (soldiers, higher tiers, coaches, admins) see all recipes
  const { data: recipes } = await supabase
    .from("recipes")
    .select("*")
    .order("title");

  // Fetch Meal Plans for the user (only for premium users)
  const { data: mealPlans } = isPremium
    ? await supabase
        .from("meal_plans")
        .select(
          `
          *,
          recipe:recipes(*)
        `
        )
        .eq("user_id", user.id)
    : { data: null };

  return (
    <div className="container mx-auto max-w-md px-4 py-6 md:max-w-4xl lg:max-w-7xl">
      <RationsClient
        user={user}
        initialRecipes={recipes || []}
        initialMealPlans={mealPlans || []}
        isPremium={isPremium}
      />
    </div>
  );
}
