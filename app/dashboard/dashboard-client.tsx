"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MissionCard, type Exercise } from "@/components/ui/mission-card";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardClientProps {
  user: any;
  profile: any;
  todaysWorkout: any;
  isCompleted: boolean;
}

export default function DashboardClient({
  user,
  profile,
  todaysWorkout,
  isCompleted: initialCompleted,
}: DashboardClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  const handleCompleteMission = async () => {
    if (!todaysWorkout) return;
    setLoading(true);

    try {
      // 1. Log the workout
      const { error: logError } = await supabase.from("user_logs").insert({
        user_id: user.id,
        workout_id: todaysWorkout.id,
        duration: 45, // Default duration, could be input
        notes: "Mission Accomplished",
      });

      if (logError) throw logError;

      // 2. Update Profile (XP and Streak)
      // Note: Triggers might handle some of this, but let's be explicit or rely on triggers if they exist.
      // The migration 011 has calculate_streak function but not an auto-update trigger for XP on log insert.
      // Let's update XP manually for now as per requirements "Wire up 'Complete Mission' -> Save to user_logs -> Add 100XP"

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          xp: (profile.xp || 0) + 100,
          last_active: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      setIsCompleted(true);
      toast({
        title: "MISSION ACCOMPLISHED",
        description: "100 XP Awarded. Strong work, soldier.",
      });

      router.refresh();
    } catch (error: any) {
      toast({
        title: "MISSION FAILED",
        description: error.message || "Could not log mission.",
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
          GO TO ONBOARDING
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
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

      {/* Mission Card */}
      {todaysWorkout ? (
        <div className="space-y-4">
          <MissionCard
            title={todaysWorkout.title}
            description={todaysWorkout.description}
            videoUrl={todaysWorkout.video_url}
            exercises={todaysWorkout.sets_reps as Exercise[]}
            isCompleted={isCompleted}
            onComplete={!isCompleted ? handleCompleteMission : undefined}
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
              onClick={handleCompleteMission}
              disabled={loading}
            >
              {loading ? "LOGGING..." : "COMPLETE MISSION"}
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-sm border border-steel bg-gunmetal p-8 text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-steel" />
          <h3 className="font-heading text-xl text-high-vis">
            NO MISSION INTEL
          </h3>
          <p className="mt-2 text-muted-text">
            Rest day or awaiting orders from HQ.
          </p>
        </div>
      )}
    </div>
  );
}
