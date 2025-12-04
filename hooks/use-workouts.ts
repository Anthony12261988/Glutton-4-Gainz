"use client";

import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

/**
 * Fetcher for today's workout
 */
async function fetchTodaysWorkout(userId: string, tier: string) {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("tier", tier)
    .eq("scheduled_date", today)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

/**
 * Fetcher for workout history
 */
async function fetchWorkoutHistory(userId: string, limit: number = 10) {
  const { data, error } = await supabase
    .from("user_logs")
    .select(
      `
      *,
      workout:workout_id (
        id,
        title,
        tier
      )
    `
    )
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Hook to fetch today's workout with caching
 */
export function useTodaysWorkout(userId: string, tier: string) {
  const { data, error, mutate, isLoading } = useSWR(
    userId && tier ? `todays-workout-${userId}-${tier}` : null,
    () => fetchTodaysWorkout(userId, tier),
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
      dedupingInterval: 30000,
    }
  );

  return {
    workout: data,
    error,
    isLoading,
    refetch: mutate,
  };
}

/**
 * Hook to fetch workout history with caching
 */
export function useWorkoutHistory(userId: string, limit: number = 10) {
  const { data, error, mutate, isLoading } = useSWR(
    userId ? `workout-history-${userId}-${limit}` : null,
    () => fetchWorkoutHistory(userId, limit),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  return {
    history: data || [],
    error,
    isLoading,
    refetch: mutate,
  };
}
