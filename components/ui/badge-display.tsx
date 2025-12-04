'use client'

import { Lock, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Badge {
  name: string
  description: string
  icon?: React.ReactNode
  isUnlocked: boolean
  earnedAt?: Date
}

export interface BadgeDisplayProps {
  badges: Badge[]
  columns?: 2 | 3 | 4
}

export function BadgeDisplay({ badges, columns = 3 }: BadgeDisplayProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-4', gridCols[columns])}>
      {badges.map((badge) => (
        <BadgeCard key={badge.name} badge={badge} />
      ))}
    </div>
  )
}

function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center gap-3 rounded-sm border-2 p-6 transition-all',
        badge.isUnlocked
          ? 'border-radar-green bg-gunmetal shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]'
          : 'border-steel/50 bg-gunmetal/30 opacity-60'
      )}
    >
      {/* Badge Icon */}
      <div
        className={cn(
          'flex h-16 w-16 items-center justify-center rounded-sm border-2 transition-all',
          badge.isUnlocked
            ? 'border-radar-green bg-radar-green/10 text-radar-green'
            : 'border-steel/50 bg-steel/10 text-steel/50'
        )}
      >
        {badge.isUnlocked ? (
          badge.icon || <Award className="h-8 w-8" />
        ) : (
          <Lock className="h-8 w-8" />
        )}
      </div>

      {/* Badge Name */}
      <div className="text-center">
        <h3
          className={cn(
            'font-heading text-sm font-bold uppercase tracking-wide',
            badge.isUnlocked ? 'text-radar-green' : 'text-steel/70'
          )}
        >
          {badge.name}
        </h3>

        {/* Badge Description */}
        <p
          className={cn(
            'mt-1 text-xs',
            badge.isUnlocked ? 'text-muted-text' : 'text-steel/50'
          )}
        >
          {badge.description}
        </p>

        {/* Earned Date */}
        {badge.isUnlocked && badge.earnedAt && (
          <p className="mt-2 text-[10px] text-steel">
            EARNED: {new Date(badge.earnedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        )}
      </div>

      {/* Locked Overlay */}
      {!badge.isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-sm bg-camo-black/60 backdrop-blur-[2px]">
          <Lock className="h-10 w-10 text-steel/30" />
        </div>
      )}
    </div>
  )
}

export { BadgeCard }
