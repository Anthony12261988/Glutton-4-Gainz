import { createClient } from "@/lib/supabase/client";

/**
 * Badge definitions with their unlock conditions
 */
export const BADGE_DEFINITIONS = [
  {
    name: "First Blood",
    description: "Complete your first workout",
    icon: "target",
    requirement: { type: "workouts", count: 1 },
  },
  {
    name: "Iron Week",
    description: "Maintain a 7-day workout streak",
    icon: "flame",
    requirement: { type: "streak", count: 7 },
  },
  {
    name: "Double Digits",
    description: "Complete 10 workouts",
    icon: "zap",
    requirement: { type: "workouts", count: 10 },
  },
  {
    name: "Quarter Century",
    description: "Complete 25 workouts",
    icon: "medal",
    requirement: { type: "workouts", count: 25 },
  },
  {
    name: "Half Century",
    description: "Complete 50 workouts",
    icon: "star",
    requirement: { type: "workouts", count: 50 },
  },
  {
    name: "Century",
    description: "Complete 100 workouts",
    icon: "trophy",
    requirement: { type: "workouts", count: 100 },
  },
  {
    name: "Streak Master",
    description: "Maintain a 30-day workout streak",
    icon: "flame",
    requirement: { type: "streak", count: 30 },
  },
] as const;

export interface Badge {
  name: string;
  description: string;
  icon: string;
}

/**
 * Detects newly earned badges by comparing profile stats against badge requirements
 * Returns an array of newly earned badges
 */
export async function detectNewBadges(
  userId: string,
  previousWorkoutCount: number,
  previousStreak: number
): Promise<Badge[]> {
  const supabase = createClient();
  const newBadges: Badge[] = [];

  // Fetch current profile stats
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("workout_count, current_streak")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    console.error("Error fetching profile for badge detection:", profileError);
    return [];
  }

  // Fetch already earned badges
  const { data: earnedBadges, error: badgeError } = await supabase
    .from("user_badges")
    .select("badge_name")
    .eq("user_id", userId);

  if (badgeError) {
    console.error("Error fetching earned badges:", badgeError);
    return [];
  }

  const earnedBadgeNames = new Set(earnedBadges?.map((b) => b.badge_name) || []);

  // Check each badge definition
  for (const badge of BADGE_DEFINITIONS) {
    // Skip if already earned
    if (earnedBadgeNames.has(badge.name)) {
      continue;
    }

    let shouldEarn = false;

    // Check if badge should be earned based on requirement
    if (badge.requirement.type === "workouts") {
      const crossed =
        previousWorkoutCount < badge.requirement.count &&
        profile.workout_count >= badge.requirement.count;
      shouldEarn = crossed;
    } else if (badge.requirement.type === "streak") {
      const crossed =
        previousStreak < badge.requirement.count &&
        profile.current_streak >= badge.requirement.count;
      shouldEarn = crossed;
    }

    if (shouldEarn) {
      newBadges.push({
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
      });
    }
  }

  return newBadges;
}

/**
 * Simpler function that just checks if any new badges were earned
 * by comparing badge counts
 */
export async function checkForNewBadges(
  userId: string,
  previousBadgeCount: number
): Promise<Badge[]> {
  const supabase = createClient();

  // Get current badge count
  const { data: badges, error } = await supabase
    .from("badges")
    .select("name, earned_at")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false });

  if (error || !badges) {
    console.error("Error checking for new badges:", error);
    return [];
  }

  // If badge count increased, return the newly earned badges
  if (badges.length > previousBadgeCount) {
    const newCount = badges.length - previousBadgeCount;
    return badges.slice(0, newCount).map((b) => {
      const definition = BADGE_DEFINITIONS.find((def) => def.name === b.name);
      return {
        name: b.name,
        description: definition?.description || "Badge earned!",
        icon: definition?.icon || "award",
      };
    });
  }

  return [];
}
