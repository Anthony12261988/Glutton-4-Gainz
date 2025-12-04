/**
 * Tier System Constants for G4G
 * Military-themed fitness tiers based on pushup capacity
 */

export const TIERS = {
  NOVICE: '.223',
  INTERMEDIATE: '.556',
  ADVANCED: '.762',
  ELITE: '.50 Cal',
} as const

export type TierType = typeof TIERS[keyof typeof TIERS]

export interface TierInfo {
  id: TierType
  name: string
  description: string
  minPushups: number
  maxPushups: number | null
  color: string // Tailwind color class
  icon: string // Icon identifier
}

export const TIER_INFO: Record<TierType, TierInfo> = {
  [TIERS.NOVICE]: {
    id: TIERS.NOVICE,
    name: 'Novice',
    description: 'Building foundation strength',
    minPushups: 0,
    maxPushups: 9,
    color: 'text-steel',
    icon: 'shield',
  },
  [TIERS.INTERMEDIATE]: {
    id: TIERS.INTERMEDIATE,
    name: 'Intermediate',
    description: 'Developing tactical fitness',
    minPushups: 10,
    maxPushups: 25,
    color: 'text-muted-text',
    icon: 'shield-check',
  },
  [TIERS.ADVANCED]: {
    id: TIERS.ADVANCED,
    name: 'Advanced',
    description: 'Combat-ready operator',
    minPushups: 26,
    maxPushups: 50,
    color: 'text-tactical-red',
    icon: 'shield-alert',
  },
  [TIERS.ELITE]: {
    id: TIERS.ELITE,
    name: 'Elite',
    description: 'Special forces status',
    minPushups: 51,
    maxPushups: null,
    color: 'text-radar-green',
    icon: 'shield-plus',
  },
}

/**
 * Assigns tier based on pushup count (Day Zero Test)
 */
export function assignTier(pushups: number): TierType {
  if (pushups < 10) return TIERS.NOVICE
  if (pushups <= 25) return TIERS.INTERMEDIATE
  if (pushups <= 50) return TIERS.ADVANCED
  return TIERS.ELITE
}

/**
 * Gets tier info for a given tier ID
 */
export function getTierInfo(tier: TierType): TierInfo {
  return TIER_INFO[tier]
}

/**
 * Returns array of all tiers in order
 */
export function getAllTiers(): TierInfo[] {
  return [
    TIER_INFO[TIERS.NOVICE],
    TIER_INFO[TIERS.INTERMEDIATE],
    TIER_INFO[TIERS.ADVANCED],
    TIER_INFO[TIERS.ELITE],
  ]
}

/**
 * Checks if user tier meets or exceeds required tier
 */
export function meetsOrExceedsTier(userTier: TierType, requiredTier: TierType): boolean {
  const tierOrder = [TIERS.NOVICE, TIERS.INTERMEDIATE, TIERS.ADVANCED, TIERS.ELITE]
  const userIndex = tierOrder.indexOf(userTier)
  const requiredIndex = tierOrder.indexOf(requiredTier)
  return userIndex >= requiredIndex
}
