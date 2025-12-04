/**
 * Utility functions for checking buddy activity status
 */

/**
 * Determines if a buddy is considered inactive
 * @param lastLogDate - ISO date string of last workout log
 * @param thresholdDays - Number of days before considered inactive (default: 3)
 * @returns true if buddy is inactive
 */
export function isBuddyInactive(
  lastLogDate: string | null | undefined,
  thresholdDays: number = 3
): boolean {
  if (!lastLogDate) return true;

  const lastLog = new Date(lastLogDate);
  const now = new Date();
  const diffTime = now.getTime() - lastLog.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays >= thresholdDays;
}

/**
 * Gets the number of days since last activity
 * @param lastLogDate - ISO date string of last workout log
 * @returns number of days since last activity, or null if never logged
 */
export function getDaysSinceLastActivity(
  lastLogDate: string | null | undefined
): number | null {
  if (!lastLogDate) return null;

  const lastLog = new Date(lastLogDate);
  const now = new Date();
  const diffTime = now.getTime() - lastLog.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Gets activity status label
 * @param lastLogDate - ISO date string of last workout log
 * @returns status label and color
 */
export function getActivityStatus(lastLogDate: string | null | undefined): {
  label: string;
  color: string;
  priority: "high" | "medium" | "low";
} {
  const days = getDaysSinceLastActivity(lastLogDate);

  if (days === null) {
    return {
      label: "Never trained",
      color: "text-steel/60",
      priority: "high",
    };
  }

  if (days === 0) {
    return {
      label: "Active today",
      color: "text-radar-green",
      priority: "low",
    };
  }

  if (days === 1) {
    return {
      label: "Active yesterday",
      color: "text-radar-green",
      priority: "low",
    };
  }

  if (days < 3) {
    return {
      label: `${days} days ago`,
      color: "text-yellow-500",
      priority: "low",
    };
  }

  if (days < 7) {
    return {
      label: `${days} days MIA`,
      color: "text-orange-500",
      priority: "medium",
    };
  }

  return {
    label: `${days} days MIA`,
    color: "text-tactical-red",
    priority: "high",
  };
}

/**
 * Checks if user should be nudged
 * Users should be nudged if:
 * - They haven't logged in 3+ days
 * - Haven't been nudged in the last 24 hours
 *
 * @param lastLogDate - ISO date string of last workout log
 * @param lastNudgeDate - ISO date string of last nudge sent
 * @returns true if should send nudge
 */
export function shouldNudgeBuddy(
  lastLogDate: string | null | undefined,
  lastNudgeDate: string | null | undefined
): boolean {
  // Check if buddy is inactive
  if (!isBuddyInactive(lastLogDate, 3)) {
    return false;
  }

  // If never nudged, allow nudge
  if (!lastNudgeDate) {
    return true;
  }

  // Check if last nudge was more than 24 hours ago
  const lastNudge = new Date(lastNudgeDate);
  const now = new Date();
  const hoursSinceNudge = (now.getTime() - lastNudge.getTime()) / (1000 * 60 * 60);

  return hoursSinceNudge >= 24;
}
