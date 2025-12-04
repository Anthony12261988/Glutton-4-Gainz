'use client'

import { Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RankBadgeProps {
  xp: number
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
}

interface Rank {
  name: string
  minXp: number
  maxXp: number
  color: string
  glowColor: string
}

const RANKS: Rank[] = [
  { name: 'RECRUIT', minXp: 0, maxXp: 999, color: 'text-steel', glowColor: 'rgba(74,74,74,0.3)' },
  { name: 'SOLDIER', minXp: 1000, maxXp: 4999, color: 'text-radar-green', glowColor: 'rgba(16,185,129,0.3)' },
  { name: 'COMMANDER', minXp: 5000, maxXp: 9999, color: 'text-tactical-red', glowColor: 'rgba(211,47,47,0.3)' },
  { name: 'LEGEND', minXp: 10000, maxXp: Infinity, color: 'text-yellow-500', glowColor: 'rgba(234,179,8,0.4)' },
]

function getRank(xp: number): Rank {
  return RANKS.find((rank) => xp >= rank.minXp && xp <= rank.maxXp) || RANKS[0]
}

function getNextRank(xp: number): Rank | null {
  const currentRankIndex = RANKS.findIndex((rank) => xp >= rank.minXp && xp <= rank.maxXp)
  return currentRankIndex < RANKS.length - 1 ? RANKS[currentRankIndex + 1] : null
}

function getProgressToNextRank(xp: number): number {
  const currentRank = getRank(xp)
  const nextRank = getNextRank(xp)

  if (!nextRank) return 100 // Max rank achieved

  const xpInCurrentRank = xp - currentRank.minXp
  const xpNeededForNextRank = nextRank.minXp - currentRank.minXp

  return Math.min(100, (xpInCurrentRank / xpNeededForNextRank) * 100)
}

export function RankBadge({ xp, showProgress = false, size = 'md' }: RankBadgeProps) {
  const rank = getRank(xp)
  const nextRank = getNextRank(xp)
  const progress = getProgressToNextRank(xp)

  const sizes = {
    sm: {
      container: 'h-12 w-12',
      icon: 'h-6 w-6',
      text: 'text-[8px]',
      border: 'border-2',
    },
    md: {
      container: 'h-20 w-20',
      icon: 'h-10 w-10',
      text: 'text-[10px]',
      border: 'border-2',
    },
    lg: {
      container: 'h-32 w-32',
      icon: 'h-16 w-16',
      text: 'text-xs',
      border: 'border-4',
    },
  }

  const sizeConfig = sizes[size]

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Rank Badge Icon */}
      <div
        className={cn(
          'relative flex items-center justify-center rounded-sm bg-gunmetal transition-all',
          sizeConfig.container,
          sizeConfig.border,
          rank.color.replace('text-', 'border-')
        )}
        style={{
          boxShadow: `0 0 20px ${rank.glowColor}`,
        }}
      >
        <Shield className={cn(sizeConfig.icon, rank.color)} strokeWidth={2.5} />

        {/* Rank Name Overlay */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-camo-black px-2 py-0.5">
          <span className={cn('font-heading font-bold tracking-wider', sizeConfig.text, rank.color)}>
            {rank.name}
          </span>
        </div>
      </div>

      {/* Progress Info */}
      {showProgress && (
        <div className="w-full space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-text">
            <span>{xp.toLocaleString()} XP</span>
            {nextRank && (
              <span className="text-steel">
                {nextRank.minXp.toLocaleString()} XP to {nextRank.name}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {nextRank && (
            <div className="h-2 w-full overflow-hidden rounded-sm border border-steel/50 bg-gunmetal">
              <div
                className={cn('h-full transition-all duration-500', rank.color.replace('text-', 'bg-'))}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {!nextRank && (
            <p className="text-center text-xs font-bold uppercase tracking-wide text-yellow-500">
              MAX RANK ACHIEVED
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// Export utilities for use in other components
export { getRank, getNextRank, getProgressToNextRank, RANKS }
