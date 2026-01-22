'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Lock } from 'lucide-react'

export interface Exercise {
  exercise: string
  reps: string
}

export interface MissionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  videoUrl?: string
  exercises: Exercise[]
  isLocked?: boolean
  isCompleted?: boolean
  onComplete?: () => void
}

const MissionCard = React.forwardRef<HTMLDivElement, MissionCardProps>(
  (
    {
      className,
      title,
      description,
      videoUrl,
      exercises,
      isLocked = false,
      isCompleted = false,
      onComplete,
      ...props
    },
    ref
  ) => {
    const getYouTubeId = (value?: string) => {
      if (!value) return null

      if (!value.startsWith('http') && !value.includes('/')) {
        return value
      }

      try {
        if (value.includes('youtu.be/')) {
          return value.split('youtu.be/')[1]?.split(/[?&]/)[0] || null
        }
        if (value.includes('youtube.com')) {
          const url = new URL(value)
          return url.searchParams.get('v')
        }
      } catch {
        return null
      }

      return null
    }

    const youTubeId = getYouTubeId(videoUrl)
    const isVideoFileUrl = Boolean(videoUrl && !youTubeId)

    return (
      <Card
        ref={ref}
        className={cn(
          'relative border-tactical-red transition-all hover:shadow-2xl',
          isLocked && 'opacity-60',
          className
        )}
        {...props}
      >
        {/* Locked Overlay */}
        {isLocked && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-sm bg-camo-black/90 backdrop-blur-sm">
            <Lock className="mb-4 h-12 w-12 text-tactical-red" />
            <p className="font-heading text-2xl font-bold uppercase tracking-wider text-tactical-red">
              CLASSIFIED
            </p>
            <p className="mt-2 text-sm text-muted-text">
              UPGRADE YOUR TIER TO UNLOCK
            </p>
          </div>
        )}

        <CardHeader>
          <CardTitle className="text-tactical-red">{title}</CardTitle>
          {description && (
            <CardDescription className="text-muted-text">{description}</CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Video Preview */}
          {videoUrl && youTubeId && (
            <div className="relative aspect-video overflow-hidden rounded-sm bg-camo-black">
              <iframe
                src={`https://www.youtube.com/embed/${youTubeId}`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          )}
          {videoUrl && isVideoFileUrl && (
            <div className="relative aspect-video overflow-hidden rounded-sm bg-camo-black">
              <video
                className="absolute inset-0 h-full w-full"
                src={videoUrl}
                controls
                playsInline
              />
            </div>
          )}

          {/* Exercise List */}
          {exercises && exercises.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-muted-text">
                MISSION OBJECTIVES
              </h3>
              <ul className="space-y-2">
                {exercises.map((ex, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 border-l-2 border-tactical-red pl-4"
                  >
                    <span className="font-heading mt-0.5 text-tactical-red">▸</span>
                    <div className="flex-1">
                      <p className="font-semibold text-high-vis">{ex.exercise}</p>
                      <p className="text-sm text-muted-text">{ex.reps}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>

        <CardFooter>
          {isCompleted ? (
            <div className="w-full rounded-sm bg-radar-green/20 border border-radar-green px-6 py-3 text-center">
              <p className="font-heading text-sm font-bold uppercase tracking-wide text-radar-green">
                ✓ MISSION COMPLETE
              </p>
            </div>
          ) : (
            <Button
              onClick={onComplete}
              disabled={isLocked}
              size="lg"
              className="w-full"
            >
              COMPLETE MISSION
            </Button>
          )}
        </CardFooter>
      </Card>
    )
  }
)
MissionCard.displayName = 'MissionCard'

export { MissionCard }
