/**
 * Premium Access Helper
 *
 * Determines if a user has premium access based on their tier and role.
 * 
 * Role Hierarchy:
 * - Recruit (role: "user"): Free user, assigned a tier (.223, .556, .762, .50 Cal) via Zero Day test
 * - Soldier (role: "soldier"): Paid user, has premium access
 * - Coach (role: "coach"): Admin/trainer, always has premium access
 * - Admin (role: "admin"): System admin, always has premium access
 * 
 * Note: Recruit is a status/role (Free User), not a tier. 
 * Tiers (.223, .556, .762, .50 Cal) are assigned based on Zero Day test performance.
 */

type UserRole = "admin" | "coach" | "soldier" | "user"; // "user" = Recruit (Free User)

interface ProfileForPremiumCheck {
  tier?: string | null;
  role?: string | null;
}

/**
 * Check if user has premium access
 * Premium access is granted ONLY if:
 * - User is admin or coach (always premium)
 * - User is soldier (PAID subscription - ONLY way for regular users to get premium)
 *
 * NOTE: Tier (.223, .556, .762, .50 Cal) NO LONGER grants premium access.
 * Tiers are now purely for workout assignment and Zero Day achievements.
 *
 * Recruits (role: "user") do NOT have premium access regardless of tier.
 * They must upgrade to Soldier role (payment) to access premium features.
 */
export function hasPremiumAccess(
  profile: ProfileForPremiumCheck | null
): boolean {
  if (!profile) return false;

  // Admin and Coach always have full access
  if (profile.role === "admin" || profile.role === "coach") {
    return true;
  }

  // Soldier role means paid subscription - ONLY premium path for regular users
  if (profile.role === "soldier") {
    return true;
  }

  // Recruits (role: "user") do NOT have premium access
  // regardless of their tier
  return false;
}

/**
 * Check if user has access to a specific tier's content
 * Admin/Coach have access to all tiers
 */
export function hasTierAccess(
  profile: ProfileForPremiumCheck | null,
  requiredTier: string
): boolean {
  if (!profile) return false;

  // Admin and Coach always have full access
  if (profile.role === "admin" || profile.role === "coach") {
    return true;
  }

  // Tier hierarchy: .223 < .308 < .50 Cal
  const tierOrder = [".223", ".556", ".762", ".50 Cal"];
  const userTierIndex = tierOrder.indexOf(profile.tier || ".223");
  const requiredTierIndex = tierOrder.indexOf(requiredTier);

  return userTierIndex >= requiredTierIndex;
}

/**
 * Check if user is admin
 */
export function isAdmin(profile: ProfileForPremiumCheck | null): boolean {
  return profile?.role === "admin";
}

/**
 * Check if user is coach or admin
 */
export function isCoachOrAdmin(
  profile: ProfileForPremiumCheck | null
): boolean {
  return profile?.role === "admin" || profile?.role === "coach";
}

/**
 * Check if user is a free recruit (no premium access)
 */
export function isFreeRecruit(
  profile: ProfileForPremiumCheck | null
): boolean {
  return profile?.role === "user";
}

/**
 * Check if user has access to meal planning feature
 * (Same as hasPremiumAccess but more explicit)
 */
export function hasMealPlanningAccess(
  profile: ProfileForPremiumCheck | null
): boolean {
  return hasPremiumAccess(profile);
}
