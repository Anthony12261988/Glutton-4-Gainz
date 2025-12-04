import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database.types";

type Recipe = Database["public"]["Tables"]["recipes"]["Row"];
type RecipeInsert = Database["public"]["Tables"]["recipes"]["Insert"];
type RecipeUpdate = Database["public"]["Tables"]["recipes"]["Update"];

/**
 * Get all recipes
 * @param limit - Optional limit for pagination
 * @param offset - Optional offset for pagination
 */
export async function getAllRecipes(limit?: number, offset?: number) {
  const supabase = createClient();

  let query = supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.range(offset || 0, (offset || 0) + limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching recipes:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get a single recipe by ID
 * @param recipeId - Recipe UUID
 */
export async function getRecipeById(recipeId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", recipeId)
    .single();

  if (error) {
    console.error("Error fetching recipe:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Create a new recipe (coach only)
 * @param recipe - Recipe data
 */
export async function createRecipe(recipe: RecipeInsert) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("recipes")
    .insert(recipe)
    .select()
    .single();

  if (error) {
    console.error("Error creating recipe:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Update an existing recipe (coach only)
 * @param recipeId - Recipe UUID
 * @param updates - Partial recipe data to update
 */
export async function updateRecipe(recipeId: string, updates: RecipeUpdate) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("recipes")
    .update(updates)
    .eq("id", recipeId)
    .select()
    .single();

  if (error) {
    console.error("Error updating recipe:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Delete a recipe (coach only)
 * @param recipeId - Recipe UUID
 */
export async function deleteRecipe(recipeId: string) {
  const supabase = createClient();

  const { error } = await supabase.from("recipes").delete().eq("id", recipeId);

  if (error) {
    console.error("Error deleting recipe:", error);
    return { success: false, error };
  }

  return { success: true, error: null };
}

/**
 * Search recipes by title
 * @param searchTerm - Search term
 * @param limit - Optional limit
 */
export async function searchRecipes(searchTerm: string, limit?: number) {
  const supabase = createClient();

  let query = supabase
    .from("recipes")
    .select("*")
    .ilike("title", `%${searchTerm}%`)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error searching recipes:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Filter recipes by macro ranges
 * @param filters - Macro filter ranges
 */
export async function filterRecipesByMacros(filters: {
  minCalories?: number;
  maxCalories?: number;
  minProtein?: number;
  maxProtein?: number;
  minCarbs?: number;
  maxCarbs?: number;
  minFat?: number;
  maxFat?: number;
}) {
  const supabase = createClient();

  let query = supabase.from("recipes").select("*");

  if (filters.minCalories !== undefined) {
    query = query.gte("calories", filters.minCalories);
  }
  if (filters.maxCalories !== undefined) {
    query = query.lte("calories", filters.maxCalories);
  }
  if (filters.minProtein !== undefined) {
    query = query.gte("protein", filters.minProtein);
  }
  if (filters.maxProtein !== undefined) {
    query = query.lte("protein", filters.maxProtein);
  }
  if (filters.minCarbs !== undefined) {
    query = query.gte("carbs", filters.minCarbs);
  }
  if (filters.maxCarbs !== undefined) {
    query = query.lte("carbs", filters.maxCarbs);
  }
  if (filters.minFat !== undefined) {
    query = query.gte("fat", filters.minFat);
  }
  if (filters.maxFat !== undefined) {
    query = query.lte("fat", filters.maxFat);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Error filtering recipes by macros:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get high-protein recipes
 * @param minProtein - Minimum protein grams (default: 30)
 * @param limit - Optional limit
 */
export async function getHighProteinRecipes(
  minProtein: number = 30,
  limit?: number
) {
  const supabase = createClient();

  let query = supabase
    .from("recipes")
    .select("*")
    .gte("protein", minProtein)
    .order("protein", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching high-protein recipes:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get recipe count
 */
export async function getRecipeCount() {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("recipes")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error counting recipes:", error);
    return { count: 0, error };
  }

  return { count: count || 0, error: null };
}

/**
 * Get random recipes
 * @param count - Number of random recipes to fetch
 */
export async function getRandomRecipes(count: number = 3) {
  const supabase = createClient();

  // First get total count
  const { count: total, error: countError } = await supabase
    .from("recipes")
    .select("*", { count: "exact", head: true });

  if (countError || !total) {
    console.error("Error getting recipe count:", countError);
    return { data: null, error: countError };
  }

  // Generate random offsets
  const randomOffsets: number[] = [];
  while (randomOffsets.length < Math.min(count, total)) {
    const offset = Math.floor(Math.random() * total);
    if (!randomOffsets.includes(offset)) {
      randomOffsets.push(offset);
    }
  }

  // Fetch recipes at random offsets
  const recipes: Recipe[] = [];
  for (const offset of randomOffsets) {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .range(offset, offset)
      .single();

    if (!error && data) {
      recipes.push(data);
    }
  }

  return { data: recipes, error: null };
}
