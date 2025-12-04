import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database.types";

type Workout = Database["public"]["Tables"]["workouts"]["Row"];
type WorkoutInsert = Database["public"]["Tables"]["workouts"]["Insert"];
type WorkoutUpdate = Database["public"]["Tables"]["workouts"]["Update"];

/**
 * Get today's workout for a specific tier
 * @param userTier - User's current tier (.223, .556, .762, .50 Cal)
 * @returns Workout object or null if no workout scheduled
 */
export async function getWorkoutForToday(userTier: string) {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("tier", userTier)
    .eq("scheduled_date", today)
    .single();

  if (error) {
    // No workout found is not an error, return null
    if (error.code === "PGRST116") {
      return { data: null, error: null };
    }
    console.error("Error fetching today's workout:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get all workouts for a specific tier
 * @param tier - Tier filter
 * @param limit - Optional limit for pagination
 * @param offset - Optional offset for pagination
 */
export async function getWorkoutsByTier(
  tier: string,
  limit?: number,
  offset?: number
) {
  const supabase = createClient();

  let query = supabase
    .from("workouts")
    .select("*")
    .eq("tier", tier)
    .order("scheduled_date", { ascending: false });

  if (limit) {
    query = query.range(offset || 0, (offset || 0) + limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching workouts by tier:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get all workouts (admin/coach use)
 * @param limit - Optional limit for pagination
 * @param offset - Optional offset for pagination
 */
export async function getAllWorkouts(limit?: number, offset?: number) {
  const supabase = createClient();

  let query = supabase
    .from("workouts")
    .select("*")
    .order("scheduled_date", { ascending: false });

  if (limit) {
    query = query.range(offset || 0, (offset || 0) + limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching all workouts:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get a single workout by ID
 * @param workoutId - Workout UUID
 */
export async function getWorkoutById(workoutId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("id", workoutId)
    .single();

  if (error) {
    console.error("Error fetching workout by ID:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Create a new workout (coach only)
 * @param workout - Workout data
 */
export async function createWorkout(workout: WorkoutInsert) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("workouts")
    .insert(workout)
    .select()
    .single();

  if (error) {
    console.error("Error creating workout:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Update an existing workout (coach only)
 * @param workoutId - Workout UUID
 * @param updates - Partial workout data to update
 */
export async function updateWorkout(
  workoutId: string,
  updates: WorkoutUpdate
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("workouts")
    .update(updates)
    .eq("id", workoutId)
    .select()
    .single();

  if (error) {
    console.error("Error updating workout:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Delete a workout (coach only)
 * @param workoutId - Workout UUID
 */
export async function deleteWorkout(workoutId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("workouts")
    .delete()
    .eq("id", workoutId);

  if (error) {
    console.error("Error deleting workout:", error);
    return { success: false, error };
  }

  return { success: true, error: null };
}

/**
 * Get workouts scheduled for a specific date
 * @param date - Date in YYYY-MM-DD format
 */
export async function getWorkoutsByDate(date: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("scheduled_date", date)
    .order("tier", { ascending: true });

  if (error) {
    console.error("Error fetching workouts by date:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get upcoming workouts for a tier (next 7 days)
 * @param tier - User's tier
 */
export async function getUpcomingWorkouts(tier: string) {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("tier", tier)
    .gte("scheduled_date", today)
    .lte("scheduled_date", nextWeekStr)
    .order("scheduled_date", { ascending: true });

  if (error) {
    console.error("Error fetching upcoming workouts:", error);
    return { data: null, error };
  }

  return { data, error: null };
}
