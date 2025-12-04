/**
 * XP Calculator Utilities
 *
 * Centralized logic for XP calculations and rank progression.
 * Used across the app for consistent XP/rank displays.
 */

import { RANKS, type Rank } from './rank-system';

/**
 * Calculate XP earned from workout count
 * @param logCount - Number of completed workouts
 * @returns Total XP (100 XP per workout)
 */
export function calculateXP(logCount: number): number {
  return logCount * 100;
}

/**
 * Get current rank based on XP
 * @param xp - Total XP
 * @returns Rank name
 */
export function calculateRank(xp: number): string {
  const rank = RANKS.find(
    (r) => xp >= r.minXP && xp <= r.maxXP
  );
  return rank?.name || "Recruit";
}

/**
 * Get full rank object based on XP
 * @param xp - Total XP
 * @returns Rank object with all properties
 */
export function getRankDetails(xp: number): Rank {
  const rank = RANKS.find(
    (r) => xp >= r.minXP && xp <= r.maxXP
  );
  return rank || RANKS[0]; // Default to Recruit
}

/**
 * Calculate XP needed to reach next rank
 * @param xp - Current XP
 * @returns XP needed for next rank (0 if at max rank)
 */
export function getXPToNextRank(xp: number): number {
  const currentRank = getRankDetails(xp);
  const currentRankIndex = RANKS.findIndex(
    (r) => r.name === currentRank.name
  );

  // If at max rank, return 0
  if (currentRankIndex === RANKS.length - 1) {
    return 0;
  }

  const nextRank = RANKS[currentRankIndex + 1];
  return nextRank.minXP - xp;
}

/**
 * Get next rank name
 * @param xp - Current XP
 * @returns Next rank name (null if at max rank)
 */
export function getNextRankName(xp: number): string | null {
  const currentRank = getRankDetails(xp);
  const currentRankIndex = RANKS.findIndex(
    (r) => r.name === currentRank.name
  );

  if (currentRankIndex === RANKS.length - 1) {
    return null; // At max rank
  }

  return RANKS[currentRankIndex + 1].name;
}

/**
 * Calculate progress percentage to next rank
 * @param xp - Current XP
 * @returns Progress percentage (0-100)
 */
export function getRankProgress(xp: number): number {
  const currentRank = getRankDetails(xp);

  // If at max rank, return 100%
  if (currentRank.maxXP === Infinity) {
    return 100;
  }

  const rankXPRange = currentRank.maxXP - currentRank.minXP + 1;
  const xpInCurrentRank = xp - currentRank.minXP;
  const progress = (xpInCurrentRank / rankXPRange) * 100;

  return Math.min(Math.max(progress, 0), 100);
}

/**
 * Get workouts needed to reach next rank
 * @param xp - Current XP
 * @returns Number of workouts needed
 */
export function getWorkoutsToNextRank(xp: number): number {
  const xpNeeded = getXPToNextRank(xp);
  return Math.ceil(xpNeeded / 100);
}

/**
 * Check if user has ranked up after earning XP
 * @param previousXP - XP before earning
 * @param currentXP - XP after earning
 * @returns True if ranked up, false otherwise
 */
export function hasRankedUp(previousXP: number, currentXP: number): boolean {
  const previousRank = calculateRank(previousXP);
  const currentRank = calculateRank(currentXP);
  return previousRank !== currentRank;
}

/**
 * Get XP breakdown for display
 * @param xp - Total XP
 * @returns Object with XP display information
 */
export function getXPBreakdown(xp: number) {
  const rank = getRankDetails(xp);
  const nextRankName = getNextRankName(xp);
  const xpToNext = getXPToNextRank(xp);
  const progress = getRankProgress(xp);
  const workoutsToNext = getWorkoutsToNextRank(xp);

  return {
    totalXP: xp,
    currentRank: rank.name,
    currentRankMinXP: rank.minXP,
    currentRankMaxXP: rank.maxXP,
    nextRank: nextRankName,
    xpToNextRank: xpToNext,
    progressPercentage: progress,
    workoutsToNextRank: workoutsToNext,
    isMaxRank: rank.maxXP === Infinity,
  };
}

/**
 * Format XP for display with commas
 * @param xp - XP value
 * @returns Formatted string (e.g., "1,500 XP")
 */
export function formatXP(xp: number): string {
  return `${xp.toLocaleString()} XP`;
}

/**
 * Calculate estimated days to next rank (assuming 1 workout per day)
 * @param xp - Current XP
 * @returns Number of days (workouts) needed
 */
export function getDaysToNextRank(xp: number): number {
  return getWorkoutsToNextRank(xp);
}
