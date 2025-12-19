"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MissionCard, type Exercise } from "@/components/ui/mission-card";
import { ZeroDayCard } from "@/components/assessments/zero-day-card";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { Shield, AlertTriangle, Dumbbell, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompleteMissionModal } from "@/components/workouts/complete-mission-modal";
import { BadgeEarnedToast } from "@/components/gamification/badge-earned-toast";
import { checkForNewBadges, type Badge } from "@/lib/utils/badge-detector";
import { TOAST_MESSAGES, BUTTON_LABELS, EMPTY_STATES } from "@/lib/dictionary";
import { DailyRation } from "@/components/nutrition/daily-ration";
import { MotivationalCorner } from "@/components/gamification/motivational-corner";
import { DossierPromptCard } from "@/components/gamification/dossier-prompt-card";
import { fireWorkoutComplete } from "@/lib/utils/confetti";
import Link from "next/link";

interface Recipe {
  id: string;
  title: string;
  image_url: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  instructions: string;
}

interface DashboardClientProps {
  user: any;
  profile: any;
  todaysWorkout: any;
  isCompleted: boolean;
  todaysMeal?: Recipe | null;
  isPremium?: boolean;
}

export default function DashboardClient({
  user,
  profile,
  todaysWorkout,
  isCompleted: initialCompleted,
  todaysMeal = null,
  isPremium = false,
}: DashboardClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Badge notification state
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [showBadgeNotification, setShowBadgeNotification] = useState(false);

  // Show badges one at a time
  useEffect(() => {
    if (newBadges.length > 0 && currentBadgeIndex < newBadges.length) {
      setShowBadgeNotification(true);
    }
  }, [newBadges, currentBadgeIndex]);

  const handleBadgeClose = () => {
    setShowBadgeNotification(false);
    // After a short delay, show the next badge if available
    setTimeout(() => {
      if (currentBadgeIndex < newBadges.length - 1) {
        setCurrentBadgeIndex(currentBadgeIndex + 1);
      } else {
        // Reset for next time
        setNewBadges([]);
        setCurrentBadgeIndex(0);
      }
    }, 500);
  };

  const handleComplete = async (duration: number, notes: string) => {
    if (!todaysWorkout) return;
    setLoading(true);

    try {
      // Get badge count before workout completion
      const { data: badgesBefore } = await supabase
        .from("user_badges")
        .select("id")
        .eq("user_id", user.id);

      const previousBadgeCount = badgesBefore?.length || 0;

      // Insert log; DB trigger will handle XP, streak, badges.
      const { error: logError } = await supabase.from("user_logs").insert({
        user_id: user.id,
        workout_id: todaysWorkout.id,
        duration,
        notes,
      });

      if (logError) throw logError;

      setIsCompleted(true);

      // Fire confetti celebration
      fireWorkoutComplete();

      toast({
        title: TOAST_MESSAGES.workout.missionComplete.title,
        description: TOAST_MESSAGES.workout.missionComplete.description,
      });

      // Check for newly earned badges after a short delay
      // (give the database trigger time to process)
      setTimeout(async () => {
        const earnedBadges = await checkForNewBadges(
          user.id,
          previousBadgeCount
        );
        if (earnedBadges.length > 0) {
          setNewBadges(earnedBadges);
          setCurrentBadgeIndex(0);
        }
      }, 1000);

      setShowModal(false);
      router.refresh();
    } catch (error: any) {
      toast({
        title: TOAST_MESSAGES.workout.missionFailed.title,
        description:
          error.message || TOAST_MESSAGES.workout.missionFailed.description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <AlertTriangle className="h-12 w-12 text-tactical-red" />
        <h2 className="font-heading text-xl text-tactical-red">
          PROFILE NOT FOUND
        </h2>
        <p className="text-muted-text">Please complete onboarding.</p>
        <Button onClick={() => router.push("/onboarding")}>
          {BUTTON_LABELS.goToOnboarding}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
            DAILY BRIEFING
          </h1>
          <p className="text-sm text-muted-text">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-sm border border-tactical-red bg-tactical-red/10 px-3 py-1">
          <Shield className="h-4 w-4 text-tactical-red" />
          <span className="font-heading font-bold text-tactical-red">
            TIER: {profile.tier}
          </span>
        </div>
      </div>

      {/* Motivational Corner - Morning Briefing (First thing they see) */}
      <MotivationalCorner />

      {/* Dossier Prompt (if not complete) */}
      {!profile.dossier_complete && <DossierPromptCard />}

      {/* Mission Card or Zero-Day Assessment Card */}
      {isPremium ? (
        // Premium users: Show daily workout
        todaysWorkout ? (
          <div className="space-y-4">
            <MissionCard
              title={todaysWorkout.title}
              description={todaysWorkout.description}
              videoUrl={todaysWorkout.video_url}
              exercises={todaysWorkout.sets_reps as Exercise[]}
              isCompleted={isCompleted}
              onComplete={!isCompleted ? () => setShowModal(true) : undefined}
            />

            {isCompleted && (
              <div className="rounded-sm border border-radar-green bg-radar-green/10 p-4 text-center">
                <p className="font-heading text-xl text-radar-green">
                  MISSION COMPLETE
                </p>
                <p className="text-sm text-muted-text">
                  Return to barracks for debrief.
                </p>
              </div>
            )}

            {!isCompleted && (
              <Button
                className="w-full py-6 text-lg"
                onClick={() => setShowModal(true)}
                disabled={loading}
              >
                {BUTTON_LABELS.completeMission}
              </Button>
            )}

            {/* Browse Library Link */}
            <Link href="/library">
              <Button variant="outline" className="w-full border-steel/30 mt-3">
                <Dumbbell className="mr-2 h-4 w-4" />
                Browse Workout Library
              </Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-sm border border-steel bg-gunmetal p-8 text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-steel" />
            <h3 className="font-heading text-xl text-high-vis">
              {EMPTY_STATES.noMission.title}
            </h3>
            <p className="mt-2 text-muted-text">
              {EMPTY_STATES.noMission.description}
            </p>
            <Link href="/library">
              <Button className="mt-4 bg-tactical-red hover:bg-red-700">
                <Dumbbell className="mr-2 h-4 w-4" />
                Browse Workout Library
              </Button>
            </Link>
          </div>
        )
      ) : (
        // Free users: Show zero-day assessment card
        <div className="space-y-4">
          <ZeroDayCard />
          
          {/* Upgrade Prompt */}
          <div className="rounded-sm border-2 border-steel/50 bg-gunmetal/80 p-4">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-steel flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-heading text-sm font-bold uppercase text-steel mb-1">
                  RECRUIT STATUS
                </h3>
                <p className="text-xs text-muted-text leading-relaxed mb-3">
                  As a Recruit, you have access to zero-day assessments to establish your tier.
                  Upgrade to Soldier rank to unlock training programs, meal planning, and advanced analytics.
                </p>
                <Link href="/pricing">
                  <Button size="sm" className="bg-tactical-red hover:bg-red-700">
                    Upgrade to Soldier
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <CompleteMissionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleComplete}
        loading={loading}
      />

      {/* Daily Ration */}
      <DailyRation recipe={todaysMeal} isPremium={isPremium} />

      {/* Badge Notification */}
      {newBadges.length > 0 && (
        <BadgeEarnedToast
          badge={newBadges[currentBadgeIndex]}
          isVisible={showBadgeNotification}
          onClose={handleBadgeClose}
        />
      )}
    </div>
  );
}
