import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  current: number
  max: number
  label?: string
  showPercentage?: boolean
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, current, max, label, showPercentage = true, ...props }, ref) => {
    const percentage = Math.min(Math.max((current / max) * 100, 0), 100)

    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {label && (
          <div className="flex items-center justify-between text-sm">
            <span className="font-heading uppercase tracking-wide text-muted-text">
              {label}
            </span>
            <span className="font-bold text-high-vis">
              {current} / {max}
            </span>
          </div>
        )}
        <div className="relative h-3 w-full overflow-hidden bg-gunmetal">
          {/* Progress fill */}
          <div
            className="h-full bg-tactical-red transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
          {/* Percentage text overlay */}
          {showPercentage && (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-high-vis">
              {Math.round(percentage)}%
            </div>
          )}
        </div>
      </div>
    )
  }
)
ProgressBar.displayName = 'ProgressBar'

export { ProgressBar }
