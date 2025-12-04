/**
 * Rank System Definitions
 *
 * Defines all ranks, their XP requirements, and associated metadata.
 * Extracted from RankBadge component for reusability across the app.
 */

export interface Rank {
  name: string;
  minXP: number;
  maxXP: number;
  icon: string;
  color: string;
  description: string;
}

/**
 * All available ranks in the G4G system
 * Ordered from lowest to highest
 */
export const RANKS: Rank[] = [
  {
    name: "Recruit",
    minXP: 0,
    maxXP: 999,
    icon: "shield",
    color: "text-steel",
    description: "Just starting your journey. Every mission counts.",
  },
  {
    name: "Soldier",
    minXP: 1000,
    maxXP: 4999,
    icon: "shield-check",
    color: "text-tactical-red",
    description: "Proven warrior. You've earned your stripes.",
  },
  {
    name: "Commander",
    minXP: 5000,
    maxXP: Infinity,
    icon: "shield-alert",
    color: "text-radar-green",
    description: "Elite operator. You lead by example.",
  },
];

/**
 * Get rank by name
 * @param rankName - Rank name
 * @returns Rank object or undefined
 */
export function getRankByName(rankName: string): Rank | undefined {
  return RANKS.find((r) => r.name === rankName);
}

/**
 * Get rank index (0-based)
 * @param rankName - Rank name
 * @returns Index in RANKS array, or -1 if not found
 */
export function getRankIndex(rankName: string): number {
  return RANKS.findIndex((r) => r.name === rankName);
}

/**
 * Check if rank A is higher than rank B
 * @param rankA - First rank name
 * @param rankB - Second rank name
 * @returns True if rankA is higher than rankB
 */
export function isRankHigher(rankA: string, rankB: string): boolean {
  const indexA = getRankIndex(rankA);
  const indexB = getRankIndex(rankB);
  return indexA > indexB;
}

/**
 * Get all rank names
 * @returns Array of rank names
 */
export function getAllRankNames(): string[] {
  return RANKS.map((r) => r.name);
}

/**
 * Get rank count
 * @returns Total number of ranks
 */
export function getRankCount(): number {
  return RANKS.length;
}

/**
 * Get rank color class for display
 * @param rankName - Rank name
 * @returns Tailwind color class
 */
export function getRankColor(rankName: string): string {
  const rank = getRankByName(rankName);
  return rank?.color || "text-steel";
}

/**
 * Get rank icon name
 * @param rankName - Rank name
 * @returns Icon name (Lucide icon)
 */
export function getRankIcon(rankName: string): string {
  const rank = getRankByName(rankName);
  return rank?.icon || "shield";
}

/**
 * Get rank description
 * @param rankName - Rank name
 * @returns Rank description
 */
export function getRankDescription(rankName: string): string {
  const rank = getRankByName(rankName);
  return rank?.description || "";
}
