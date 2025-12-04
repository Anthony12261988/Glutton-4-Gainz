import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database.types";

type MealPlan = Database["public"]["Tables"]["meal_plans"]["Row"];
type MealPlanInsert = Database["public"]["Tables"]["meal_plans"]["Insert"];

/**
 * Get meal plans for a specific week
 * @param userId - User UUID
 * @param startDate - Start date of the week (YYYY-MM-DD)
 * @returns Array of meal plans for the week
 */
export async function getMealPlansForWeek(userId: string, startDate: string) {
  const supabase = createClient();

  // Calculate end date (7 days from start)
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const endDate = end.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("meal_plans")
    .select(`
      *,
      recipe:recipes(*)
    `)
    .eq("user_id", userId)
    .gte("assigned_date", startDate)
    .lte("assigned_date", endDate)
    .order("assigned_date", { ascending: true });

  if (error) {
    console.error("Error fetching meal plans for week:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get meal plan for today
 * @param userId - User UUID
 */
export async function getTodaysMeal(userId: string) {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("meal_plans")
    .select(`
      *,
      recipe:recipes(*)
    `)
    .eq("user_id", userId)
    .eq("assigned_date", today)
    .maybeSingle();

  if (error) {
    console.error("Error fetching today's meal:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get meal plan for a specific date
 * @param userId - User UUID
 * @param date - Date in YYYY-MM-DD format
 */
export async function getMealForDate(userId: string, date: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("meal_plans")
    .select(`
      *,
      recipe:recipes(*)
    `)
    .eq("user_id", userId)
    .eq("assigned_date", date)
    .maybeSingle();

  if (error) {
    console.error("Error fetching meal for date:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Assign a meal to a specific day
 * @param userId - User UUID
 * @param recipeId - Recipe UUID
 * @param date - Date in YYYY-MM-DD format
 */
export async function assignMealToDay(
  userId: string,
  recipeId: string,
  date: string
) {
  const supabase = createClient();

  // Check if meal already exists for this date
  const { data: existing } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("user_id", userId)
    .eq("assigned_date", date)
    .maybeSingle();

  if (existing) {
    // Update existing meal
    const { data, error } = await supabase
      .from("meal_plans")
      .update({ recipe_id: recipeId })
      .eq("id", existing.id)
      .select(`
        *,
        recipe:recipes(*)
      `)
      .single();

    if (error) {
      console.error("Error updating meal plan:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } else {
    // Insert new meal
    const { data, error } = await supabase
      .from("meal_plans")
      .insert({
        user_id: userId,
        recipe_id: recipeId,
        assigned_date: date,
      })
      .select(`
        *,
        recipe:recipes(*)
      `)
      .single();

    if (error) {
      console.error("Error assigning meal:", error);
      return { data: null, error };
    }

    return { data, error: null };
  }
}

/**
 * Remove meal from a specific day
 * @param userId - User UUID
 * @param date - Date in YYYY-MM-DD format
 */
export async function removeMealFromDay(userId: string, date: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("meal_plans")
    .delete()
    .eq("user_id", userId)
    .eq("assigned_date", date);

  if (error) {
    console.error("Error removing meal:", error);
    return { success: false, error };
  }

  return { success: true, error: null };
}

/**
 * Get all meal plans for a user (for history/overview)
 * @param userId - User UUID
 * @param limit - Optional limit for pagination
 * @param offset - Optional offset for pagination
 */
export async function getAllMealPlans(
  userId: string,
  limit?: number,
  offset?: number
) {
  const supabase = createClient();

  let query = supabase
    .from("meal_plans")
    .select(`
      *,
      recipe:recipes(*)
    `)
    .eq("user_id", userId)
    .order("assigned_date", { ascending: false });

  if (limit) {
    query = query.range(offset || 0, (offset || 0) + limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching all meal plans:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get upcoming meal plans (next 7 days)
 * @param userId - User UUID
 */
export async function getUpcomingMeals(userId: string) {
  const supabase = createClient();

  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("meal_plans")
    .select(`
      *,
      recipe:recipes(*)
    `)
    .eq("user_id", userId)
    .gte("assigned_date", today)
    .lte("assigned_date", nextWeekStr)
    .order("assigned_date", { ascending: true });

  if (error) {
    console.error("Error fetching upcoming meals:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Clear all meal plans for a week
 * @param userId - User UUID
 * @param startDate - Start date of the week (YYYY-MM-DD)
 */
export async function clearWeekMeals(userId: string, startDate: string) {
  const supabase = createClient();

  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const endDate = end.toISOString().split("T")[0];

  const { error } = await supabase
    .from("meal_plans")
    .delete()
    .eq("user_id", userId)
    .gte("assigned_date", startDate)
    .lte("assigned_date", endDate);

  if (error) {
    console.error("Error clearing week meals:", error);
    return { success: false, error };
  }

  return { success: true, error: null };
}

/**
 * Get meal plan count
 * @param userId - User UUID
 */
export async function getMealPlanCount(userId: string) {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("meal_plans")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.error("Error counting meal plans:", error);
    return { count: 0, error };
  }

  return { count: count || 0, error: null };
}
