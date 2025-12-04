import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database.types";

type UserBadge = Database["public"]["Tables"]["user_badges"]["Row"];

/**
 * Badge definitions - metadata for all available badges
 */
export const BADGE_DEFINITIONS = [
  {
    name: "First Blood",
    description: "Complete your first workout",
    icon: "target",
    requirement: "Log 1 workout",
  },
  {
    name: "Iron Week",
    description: "Maintain a 7-day workout streak",
    icon: "flame",
    requirement: "7-day streak",
  },
  {
    name: "Century",
    description: "Complete 100 workouts",
    icon: "trophy",
    requirement: "Log 100 workouts",
  },
] as const;

export type BadgeName = (typeof BADGE_DEFINITIONS)[number]["name"];

interface BadgeWithStatus {
  name: string;
  description: string;
  icon: string;
  requirement: string;
  earned: boolean;
  earnedAt?: string;
}

/**
 * Get all badges for a user (earned + locked)
 * @param userId - User UUID
 * @returns Array of badges with earned status
 */
export async function getUserBadges(userId: string) {
  const supabase = createClient();

  const { data: earnedBadges, error } = await supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false });

  if (error) {
    console.error("Error fetching user badges:", error);
    return { data: null, error };
  }

  // Create a map of earned badges for quick lookup
  const earnedMap = new Map(
    earnedBadges.map((badge) => [badge.badge_name, badge])
  );

  // Combine with definitions to show all badges (earned + locked)
  const allBadges: BadgeWithStatus[] = BADGE_DEFINITIONS.map((def) => {
    const earned = earnedMap.get(def.name);
    return {
      name: def.name,
      description: def.description,
      icon: def.icon,
      requirement: def.requirement,
      earned: !!earned,
      earnedAt: earned?.earned_at,
    };
  });

  return { data: allBadges, error: null };
}

/**
 * Get only earned badges for a user
 * @param userId - User UUID
 */
export async function getEarnedBadges(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false });

  if (error) {
    console.error("Error fetching earned badges:", error);
    return { data: null, error };
  }

  // Enrich with badge definitions
  const enrichedBadges = data.map((badge) => {
    const definition = BADGE_DEFINITIONS.find(
      (def) => def.name === badge.badge_name
    );
    return {
      ...badge,
      description: definition?.description || "",
      icon: definition?.icon || "award",
      requirement: definition?.requirement || "",
    };
  });

  return { data: enrichedBadges, error: null };
}

/**
 * Check if a user has earned a specific badge
 * @param userId - User UUID
 * @param badgeName - Badge name to check
 */
export async function hasBadge(userId: string, badgeName: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_badges")
    .select("id")
    .eq("user_id", userId)
    .eq("badge_name", badgeName)
    .maybeSingle();

  if (error) {
    console.error("Error checking badge:", error);
    return { hasBadge: false, error };
  }

  return { hasBadge: !!data, error: null };
}

/**
 * Get recently earned badges (for notifications)
 * @param userId - User UUID
 * @param hours - Number of hours to look back (default: 24)
 */
export async function getRecentlyEarnedBadges(
  userId: string,
  hours: number = 24
) {
  const supabase = createClient();

  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - hours);

  const { data, error } = await supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", userId)
    .gte("earned_at", cutoffTime.toISOString())
    .order("earned_at", { ascending: false });

  if (error) {
    console.error("Error fetching recent badges:", error);
    return { data: null, error };
  }

  // Enrich with badge definitions
  const enrichedBadges = data.map((badge) => {
    const definition = BADGE_DEFINITIONS.find(
      (def) => def.name === badge.badge_name
    );
    return {
      ...badge,
      description: definition?.description || "",
      icon: definition?.icon || "award",
      requirement: definition?.requirement || "",
    };
  });

  return { data: enrichedBadges, error: null };
}

/**
 * Get badge count for a user
 * @param userId - User UUID
 */
export async function getBadgeCount(userId: string) {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("user_badges")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.error("Error counting badges:", error);
    return { count: 0, error };
  }

  return {
    count: count || 0,
    total: BADGE_DEFINITIONS.length,
    error: null,
  };
}

/**
 * Get badge progress (for badges with incremental requirements)
 * @param userId - User UUID
 */
export async function getBadgeProgress(userId: string) {
  const supabase = createClient();

  // Get workout count for Century badge
  const { count: workoutCount, error: countError } = await supabase
    .from("user_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) {
    console.error("Error fetching workout count:", countError);
    return { data: null, error: countError };
  }

  // Get streak for Iron Week badge
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("current_streak")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("Error fetching streak:", profileError);
    return { data: null, error: profileError };
  }

  // Get earned badges
  const { data: badges, error: badgesError } = await getUserBadges(userId);

  if (badgesError) {
    return { data: null, error: badgesError };
  }

  // Calculate progress for each badge
  const progress = [
    {
      name: "First Blood",
      earned: badges?.find((b) => b.name === "First Blood")?.earned || false,
      progress: Math.min((workoutCount || 0) / 1, 1),
      current: Math.min(workoutCount || 0, 1),
      required: 1,
    },
    {
      name: "Iron Week",
      earned: badges?.find((b) => b.name === "Iron Week")?.earned || false,
      progress: Math.min((profile.current_streak || 0) / 7, 1),
      current: profile.current_streak || 0,
      required: 7,
    },
    {
      name: "Century",
      earned: badges?.find((b) => b.name === "Century")?.earned || false,
      progress: Math.min((workoutCount || 0) / 100, 1),
      current: workoutCount || 0,
      required: 100,
    },
  ];

  return { data: progress, error: null };
}

/**
 * Check for new badges after a workout log
 * This is mainly for UI purposes - the actual badge awarding is handled by DB triggers
 * @param userId - User UUID
 * @param previousBadgeCount - Badge count before workout
 * @returns Newly earned badges
 */
export async function checkForNewBadges(
  userId: string,
  previousBadgeCount: number
) {
  const supabase = createClient();

  // Get current badges
  const { data: currentBadges, error } = await supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false });

  if (error) {
    console.error("Error checking for new badges:", error);
    return { data: null, error };
  }

  // If count increased, return the newest badges
  if (currentBadges.length > previousBadgeCount) {
    const newBadgesCount = currentBadges.length - previousBadgeCount;
    const newBadges = currentBadges.slice(0, newBadgesCount);

    // Enrich with definitions
    const enrichedBadges = newBadges.map((badge) => {
      const definition = BADGE_DEFINITIONS.find(
        (def) => def.name === badge.badge_name
      );
      return {
        ...badge,
        description: definition?.description || "",
        icon: definition?.icon || "award",
        requirement: definition?.requirement || "",
      };
    });

    return { data: enrichedBadges, error: null };
  }

  return { data: [], error: null };
}
