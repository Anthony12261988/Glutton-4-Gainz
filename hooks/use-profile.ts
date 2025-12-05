"use client";

import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

/**
 * Fetcher for user profile
 */
async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetcher for user badges
 */
async function fetchBadges(userId: string) {
  const { data, error } = await supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Hook to fetch and cache user profile
 */
export function useProfile(userId: string) {
  const { data, error, mutate, isLoading } = useSWR(
    userId ? `profile-${userId}` : null,
    () => fetchProfile(userId),
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
      dedupingInterval: 30000,
    }
  );

  return {
    profile: data,
    error,
    isLoading,
    refetch: mutate,
  };
}

/**
 * Hook to fetch and cache user badges
 */
export function useBadges(userId: string) {
  const { data, error, mutate, isLoading } = useSWR(
    userId ? `badges-${userId}` : null,
    () => fetchBadges(userId),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  return {
    badges: data || [],
    error,
    isLoading,
    refetch: mutate,
  };
}
