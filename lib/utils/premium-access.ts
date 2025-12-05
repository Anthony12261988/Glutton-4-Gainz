/**
 * Premium Access Helper
 *
 * Determines if a user has premium access based on their tier and role.
 * Admin and Coach roles always have premium access.
 */

type UserRole = "admin" | "coach" | "soldier" | "user";

interface ProfileForPremiumCheck {
  tier?: string | null;
  role?: UserRole | null;
}

/**
 * Check if user has premium access
 * Premium access is granted if:
 * - User is admin or coach (always premium)
 * - User is soldier (paid tier)
 * - User has a tier above .223
 */
export function hasPremiumAccess(
  profile: ProfileForPremiumCheck | null
): boolean {
  if (!profile) return false;

  // Admin and Coach always have full access
  if (profile.role === "admin" || profile.role === "coach") {
    return true;
  }

  // Soldier role means paid subscription
  if (profile.role === "soldier") {
    return true;
  }

  // Check tier - anything above .223 is premium
  if (profile.tier && profile.tier !== ".223") {
    return true;
  }

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
  const tierOrder = [".223", ".308", ".50 Cal"];
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
