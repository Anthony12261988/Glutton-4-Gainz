'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MissionCard } from '@/components/ui/mission-card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Navigation } from '@/components/ui/navigation'
import { BadgeDisplay, type Badge } from '@/components/ui/badge-display'
import { RankBadge } from '@/components/ui/rank-badge'
import { ConsistencyChart, WeightChart, XPChart } from '@/components/ui/stats-chart'
import { LockedContent } from '@/components/ui/tier-lock-overlay'
import { useToast } from '@/hooks/use-toast'
import { Award, Target, Flame, Trophy } from 'lucide-react'

export default function Home() {
  const { toast } = useToast()

  const sampleExercises = [
    { exercise: 'Pushups', reps: '4 sets x 15-20 reps' },
    { exercise: 'Jump Squats', reps: '4 sets x 12 reps' },
    { exercise: 'Mountain Climbers', reps: '4 sets x 20 reps' },
    { exercise: 'Plank Hold', reps: '3 sets x 45 seconds' },
  ]

  const handleComplete = () => {
    toast({
      title: 'MISSION COMPLETE',
      description: '+100 XP earned! Outstanding work, soldier.',
      variant: 'default',
    })
  }

  // Sample badge data
  const sampleBadges: Badge[] = [
    {
      name: 'FIRST BLOOD',
      description: 'Complete your first workout',
      icon: <Award className="h-8 w-8" />,
      isUnlocked: true,
      earnedAt: new Date('2024-01-15'),
    },
    {
      name: 'IRON WEEK',
      description: '7-day workout streak',
      icon: <Target className="h-8 w-8" />,
      isUnlocked: true,
      earnedAt: new Date('2024-02-01'),
    },
    {
      name: 'CENTURY',
      description: 'Complete 100 workouts',
      icon: <Trophy className="h-8 w-8" />,
      isUnlocked: false,
    },
    {
      name: 'INFERNO',
      description: '30-day workout streak',
      icon: <Flame className="h-8 w-8" />,
      isUnlocked: false,
    },
  ]

  // Sample chart data
  const consistencyData = [
    { week: 'Week 1', workouts: 3 },
    { week: 'Week 2', workouts: 5 },
    { week: 'Week 3', workouts: 4 },
    { week: 'Week 4', workouts: 6 },
  ]

  const weightData = [
    { date: 'Jan 1', weight: 180 },
    { date: 'Jan 15', weight: 178 },
    { date: 'Feb 1', weight: 176 },
    { date: 'Feb 15', weight: 175 },
    { date: 'Mar 1', weight: 173 },
  ]

  const xpData = [
    { date: 'Week 1', xp: 200 },
    { date: 'Week 2', xp: 700 },
    { date: 'Week 3', xp: 1400 },
    { date: 'Week 4', xp: 2200 },
  ]

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-20">
      <Navigation />

      <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="mb-2 font-heading text-5xl font-bold uppercase tracking-wider text-tactical-red md:text-6xl">
            GLUTTON4GAMES
          </h1>
          <p className="text-lg text-muted-text">
            Military-Themed Fitness PWA - Component Showcase
          </p>
          <p className="mt-2 text-sm text-steel">
            Phase 2: Design System - IN PROGRESS
          </p>
        </div>

        {/* Component Showcase */}
        <div className="space-y-6">
          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Tactical Buttons</CardTitle>
              <CardDescription>Military-styled button components</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button>Default Button</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button size="lg">Large</Button>
              <Button size="sm">Small</Button>
            </CardContent>
          </Card>

          {/* Progress Bar */}
          <Card>
            <CardHeader>
              <CardTitle>XP Progress Bar</CardTitle>
              <CardDescription>Track your experience points</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProgressBar current={750} max={1000} label="Rank: Recruit" />
              <ProgressBar current={3500} max={5000} label="Rank: Soldier" />
              <ProgressBar current={8200} max={10000} label="Rank: Commander" />
            </CardContent>
          </Card>

          {/* Mission Card - Active */}
          <MissionCard
            title="STANDARD PATROL"
            description="Intermediate intensity circuit. Focus on controlled movement and breathing."
            videoUrl="dQw4w9WgXcQ"
            exercises={sampleExercises}
            onComplete={handleComplete}
          />

          {/* Mission Card - Completed */}
          <MissionCard
            title="COMPLETED MISSION"
            description="This mission has been completed today."
            exercises={sampleExercises}
            isCompleted={true}
          />

          {/* Mission Card - Locked */}
          <MissionCard
            title="ASSAULT PROTOCOL"
            description="High-intensity advanced workout. Locked until you reach Advanced tier."
            exercises={sampleExercises}
            isLocked={true}
          />

          {/* Test Toast Button */}
          <Card>
            <CardHeader>
              <CardTitle>Toast Notifications</CardTitle>
              <CardDescription>Test the notification system</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button
                onClick={() =>
                  toast({
                    title: 'Mission Assigned',
                    description: 'New workout available for your tier.',
                  })
                }
              >
                Show Toast
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast({
                    title: 'XP Gained!',
                    description: '+100 XP for completing your workout.',
                  })
                }
              >
                XP Toast
              </Button>
            </CardContent>
          </Card>

          {/* Rank Badge */}
          <Card>
            <CardHeader>
              <CardTitle>Rank Badge System</CardTitle>
              <CardDescription>Visual rank indicators with XP progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <RankBadge xp={500} showProgress size="md" />
                <RankBadge xp={2500} showProgress size="md" />
                <RankBadge xp={7500} showProgress size="md" />
              </div>
            </CardContent>
          </Card>

          {/* Badge Display */}
          <Card>
            <CardHeader>
              <CardTitle>Achievement Badges</CardTitle>
              <CardDescription>Locked and unlocked badge states with glow effects</CardDescription>
            </CardHeader>
            <CardContent>
              <BadgeDisplay badges={sampleBadges} columns={4} />
            </CardContent>
          </Card>

          {/* Stats Charts */}
          <ConsistencyChart data={consistencyData} />
          <WeightChart data={weightData} />
          <XPChart data={xpData} />

          {/* Tier Lock Overlay Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Tier Lock System</CardTitle>
              <CardDescription>Content gating for different tiers and premium features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative h-64 rounded-sm border border-steel bg-gunmetal/30">
                <LockedContent
                  requiredTier=".762"
                  currentTier=".556"
                  showContent={false}
                >
                  <div className="p-8">
                    <h3 className="font-heading text-xl font-bold uppercase">Advanced Content</h3>
                    <p className="mt-2 text-muted-text">This content requires Advanced tier (.762)</p>
                  </div>
                </LockedContent>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Footer */}
        <div className="rounded-sm border border-steel bg-gunmetal/50 p-6 text-center">
          <p className="font-heading text-sm uppercase tracking-wide text-radar-green">
            ✓ Phase 0: Foundation Complete
          </p>
          <p className="mt-2 font-heading text-sm uppercase tracking-wide text-radar-green">
            ✓ Phase 1: Supabase Backend - Migrations Ready
          </p>
          <p className="mt-2 font-heading text-sm uppercase tracking-wide text-radar-green">
            ✓ Phase 2: Design System - COMPLETE
          </p>
          <p className="mt-4 text-xs text-muted-text">
            All UI components built. Auth pages ready at{' '}
            <code className="rounded bg-camo-black px-2 py-1">/login</code>,{' '}
            <code className="rounded bg-camo-black px-2 py-1">/signup</code>, and{' '}
            <code className="rounded bg-camo-black px-2 py-1">/onboarding</code>
          </p>
          <p className="mt-2 text-xs text-steel">
            Next: Set up Supabase and implement Phase 3 (Authentication)
          </p>
        </div>
      </div>
    </div>
  )
}
