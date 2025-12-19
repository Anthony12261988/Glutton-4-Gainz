'use client'

import { Lock, Shield, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface TierLockOverlayProps {
  requiredTier: '.223' | '.556' | '.762' | '.50 Cal'
  currentTier?: '.223' | '.556' | '.762' | '.50 Cal'
  isPremiumFeature?: boolean
  onUpgrade?: () => void
  className?: string
}

const TIER_HIERARCHY = {
  '.223': 1,
  '.556': 2,
  '.762': 3,
  '.50 Cal': 4,
}

export function TierLockOverlay({
  requiredTier,
  currentTier,
  isPremiumFeature = false,
  onUpgrade,
  className,
}: TierLockOverlayProps) {
  const isLocked = currentTier ? TIER_HIERARCHY[currentTier] < TIER_HIERARCHY[requiredTier] : true

  if (!isLocked && !isPremiumFeature) {
    return null // Not locked, don't show overlay
  }

  return (
    <div
      className={cn(
        'absolute inset-0 z-10 flex flex-col items-center justify-center rounded-sm bg-camo-black/90 backdrop-blur-sm',
        className
      )}
    >
      {/* Lock Icon with Glow */}
      <div className="relative">
        <div className="absolute inset-0 animate-pulse rounded-full bg-tactical-red/30 blur-xl" />
        <div className="relative rounded-sm border-2 border-tactical-red/50 bg-gunmetal p-6">
          <Lock className="h-16 w-16 text-tactical-red" strokeWidth={2.5} />
        </div>
      </div>

      {/* Classified Text */}
      <div className="mt-6 text-center">
        <h3 className="font-heading text-2xl font-bold uppercase tracking-widest text-tactical-red">
          CLASSIFIED
        </h3>

        {isPremiumFeature ? (
          <>
            <p className="mt-2 text-sm text-muted-text">
              Premium Feature - Upgrade to Soldier Rank
            </p>
            <div className="mt-1 flex items-center justify-center gap-2 text-xs text-steel">
              <Shield className="h-4 w-4" />
              <span>SOLDIER UPGRADE REQUIRED</span>
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-text">
              Tier <span className="font-heading font-bold text-tactical-red">{requiredTier}</span> Required
            </p>
            <div className="mt-1 flex items-center justify-center gap-2 text-xs text-steel">
              <AlertTriangle className="h-4 w-4" />
              <span>
                CURRENT TIER:{' '}
                <span className="font-heading font-bold text-radar-green">{currentTier || '.223'}</span>
              </span>
            </div>
          </>
        )}
      </div>

      {/* Unlock Message */}
      <div className="mt-4 max-w-xs text-center text-xs text-muted-text">
        {isPremiumFeature ? (
          <p>
            Upgrade to Soldier rank (paid) to access training programs, meal planning, premium recipes, and advanced analytics.
          </p>
        ) : (
          <p>
            This content requires tier {requiredTier}. Complete the Zero Day Test to increase your tier.
            Note: Tiers are assigned via assessment, but training programs require Soldier upgrade.
          </p>
        )}
      </div>

      {/* Upgrade Button */}
      {onUpgrade && (
        <Button onClick={onUpgrade} className="mt-6" size="lg">
          {isPremiumFeature ? 'UPGRADE NOW' : 'RETAKE TEST'}
        </Button>
      )}

      {/* Decorative Elements */}
      <div className="mt-6 flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-1 w-1 rounded-full bg-tactical-red/50" />
        ))}
      </div>
    </div>
  )
}

// Wrapper component for easy use
export interface LockedContentProps {
  children: React.ReactNode
  requiredTier: '.223' | '.556' | '.762' | '.50 Cal'
  currentTier?: '.223' | '.556' | '.762' | '.50 Cal'
  isPremiumFeature?: boolean
  onUpgrade?: () => void
  showContent?: boolean // Show blurred content behind overlay
}

export function LockedContent({
  children,
  requiredTier,
  currentTier,
  isPremiumFeature = false,
  onUpgrade,
  showContent = true,
}: LockedContentProps) {
  const isLocked = currentTier ? TIER_HIERARCHY[currentTier] < TIER_HIERARCHY[requiredTier] : true

  if (!isLocked && !isPremiumFeature) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {/* Content (blurred if showContent is true) */}
      {showContent && <div className="blur-sm">{children}</div>}

      {/* Overlay */}
      <TierLockOverlay
        requiredTier={requiredTier}
        currentTier={currentTier}
        isPremiumFeature={isPremiumFeature}
        onUpgrade={onUpgrade}
      />
    </div>
  )
}
