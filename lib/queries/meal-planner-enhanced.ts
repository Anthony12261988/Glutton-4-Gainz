import { createClient as createClientClient } from "@/lib/supabase/client";

/**
 * Get daily macros for a user and date
 */
export async function getDailyMacros(userId: string, date: string) {
  const supabase = createClientClient();

  const { data, error } = await supabase
    .from("daily_macros")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  return { data, error };
}

/**
 * Set macro targets for a date
 */
export async function setMacroTargets(
  userId: string,
  date: string,
  targets: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }
) {
  const supabase = createClientClient();

  const { data, error } = await supabase
    .from("daily_macros")
    .upsert({
      user_id: userId,
      date,
      target_calories: targets.calories,
      target_protein: targets.protein,
      target_carbs: targets.carbs,
      target_fat: targets.fat,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Get meal templates for a user (includes public templates)
 */
export async function getMealTemplates(userId: string) {
  const supabase = createClientClient();

  const { data, error } = await supabase
    .from("meal_templates")
    .select(`
      *,
      meals:template_meals(
        *,
        recipe:recipes(*)
      )
    `)
    .or(`user_id.eq.${userId},is_public.eq.true`)
    .order("created_at", { ascending: false });

  return { data, error };
}

/**
 * Create a new meal template
 */
export async function createMealTemplate(
  userId: string,
  name: string,
  description: string,
  isPublic: boolean,
  meals: Array<{
    recipeId: string;
    dayOffset: number;
    mealNumber: number;
  }>
) {
  const supabase = createClientClient();

  // Create template
  const { data: template, error: templateError } = await supabase
    .from("meal_templates")
    .insert({
      user_id: userId,
      name,
      description,
      is_public: isPublic,
    })
    .select()
    .single();

  if (templateError || !template) return { data: null, error: templateError };

  // Add meals to template
  const templateMeals = meals.map((meal) => ({
    template_id: template.id,
    recipe_id: meal.recipeId,
    day_offset: meal.dayOffset,
    meal_number: meal.mealNumber,
  }));

  const { error: mealsError } = await supabase
    .from("template_meals")
    .insert(templateMeals);

  if (mealsError) {
    // Cleanup template if meals insert fails
    await supabase.from("meal_templates").delete().eq("id", template.id);
    return { data: null, error: mealsError };
  }

  return { data: template, error: null };
}

/**
 * Apply a template to a user's meal plan starting from a date
 */
export async function applyTemplate(
  userId: string,
  templateId: string,
  startDate: string
) {
  const supabase = createClientClient();

  // Get template meals
  const { data: templateData, error: templateError } = await supabase
    .from("meal_templates")
    .select(`meals:template_meals(*)`)
    .eq("id", templateId)
    .single();

  if (templateError || !templateData) return { error: templateError };

  // Create meal plan entries
  const mealPlans = (templateData.meals as any[]).map((meal: any) => {
    const assignedDate = new Date(startDate);
    assignedDate.setDate(assignedDate.getDate() + meal.day_offset);

    return {
      user_id: userId,
      recipe_id: meal.recipe_id,
      assigned_date: assignedDate.toISOString().split("T")[0],
      meal_number: meal.meal_number,
    };
  });

  const { data, error } = await supabase
    .from("meal_plans")
    .upsert(mealPlans, { onConflict: "user_id,assigned_date,meal_number" })
    .select();

  return { data, error };
}

/**
 * Generate shopping list from meal plans in a date range
 */
export async function generateShoppingList(
  userId: string,
  startDate: string,
  endDate: string
) {
  const supabase = createClientClient();

  // Get all meal plans in date range
  const { data: mealPlans, error: mealError } = await supabase
    .from("meal_plans")
    .select(`
      recipe:recipes(id, title, ingredients)
    `)
    .eq("user_id", userId)
    .gte("assigned_date", startDate)
    .lte("assigned_date", endDate);

  if (mealError) return { data: null, error: mealError };

  // Aggregate ingredients
  const ingredientMap = new Map();
  mealPlans?.forEach((plan: any) => {
    const ingredients = plan.recipe?.ingredients || [];
    ingredients.forEach((ing: any) => {
      const key = ing.name?.toLowerCase();
      if (key) {
        const existing = ingredientMap.get(key);
        if (existing) {
          existing.quantity = (existing.quantity || 0) + (ing.quantity || 0);
        } else {
          ingredientMap.set(key, { ...ing });
        }
      }
    });
  });

  const ingredients = Array.from(ingredientMap.values());

  // Save shopping list
  const { data, error } = await supabase
    .from("shopping_lists")
    .insert({
      user_id: userId,
      start_date: startDate,
      end_date: endDate,
      ingredients,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Get user's shopping lists
 */
export async function getShoppingLists(userId: string) {
  const supabase = createClientClient();

  const { data, error } = await supabase
    .from("shopping_lists")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  return { data, error };
}

/**
 * Delete a shopping list
 */
export async function deleteShoppingList(listId: string) {
  const supabase = createClientClient();

  const { error } = await supabase
    .from("shopping_lists")
    .delete()
    .eq("id", listId);

  return { error };
}
