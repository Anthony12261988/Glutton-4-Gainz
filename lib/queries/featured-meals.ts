import { createClient as createClientClient } from "@/lib/supabase/client";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database.types";

type FeaturedMeal = Database["public"]["Tables"]["featured_meals"]["Row"];
type FeaturedMealInsert = Database["public"]["Tables"]["featured_meals"]["Insert"];

/**
 * Get today's featured meal (Meal of the Day)
 * Available to all users including free recruits
 * Works on both server and client side
 */
export async function getTodaysFeaturedMeal(isServer = true) {
  const supabase = isServer ? await createServerClient() : createClientClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("featured_meals")
    .select(`
      *,
      recipe:recipes(*)
    `)
    .eq("featured_date", today)
    .maybeSingle();

  if (error) {
    console.error("Error fetching today's featured meal:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get featured meal for a specific date
 */
export async function getFeaturedMealForDate(date: string, isServer = true) {
  const supabase = isServer ? await createServerClient() : createClientClient();

  const { data, error } = await supabase
    .from("featured_meals")
    .select(`
      *,
      recipe:recipes(*)
    `)
    .eq("featured_date", date)
    .maybeSingle();

  if (error) {
    console.error("Error fetching featured meal:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Set featured meal for a date (admin/coach only)
 */
export async function setFeaturedMeal(recipeId: string, date: string, isServer = false) {
  const supabase = isServer ? await createServerClient() : createClientClient();

  // Check if featured meal already exists for this date
  const { data: existing } = await supabase
    .from("featured_meals")
    .select("id")
    .eq("featured_date", date)
    .maybeSingle();

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from("featured_meals")
      .update({ recipe_id: recipeId })
      .eq("id", existing.id)
      .select(`
        *,
        recipe:recipes(*)
      `)
      .single();

    return { data, error };
  } else {
    // Insert new
    const { data, error } = await supabase
      .from("featured_meals")
      .insert({
        recipe_id: recipeId,
        featured_date: date,
      })
      .select(`
        *,
        recipe:recipes(*)
      `)
      .single();

    return { data, error };
  }
}

/**
 * Get upcoming featured meals (next 7 days)
 */
export async function getUpcomingFeaturedMeals(isServer = true) {
  const supabase = isServer ? await createServerClient() : createClientClient();

  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("featured_meals")
    .select(`
      *,
      recipe:recipes(*)
    `)
    .gte("featured_date", today)
    .lte("featured_date", nextWeekStr)
    .order("featured_date", { ascending: true });

  if (error) {
    console.error("Error fetching upcoming featured meals:", error);
    return { data: null, error };
  }

  return { data, error: null };
}
