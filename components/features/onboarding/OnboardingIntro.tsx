"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, ChevronRight, Target, Zap, Flame } from "lucide-react";
import { TIERS } from "@/lib/constants/tiers";

interface OnboardingIntroProps {
  onStartTest: () => void;
}

export function OnboardingIntro({ onStartTest }: OnboardingIntroProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-sm border-2 border-tactical-red bg-gunmetal p-4">
            <Shield
              className="h-12 w-12 text-tactical-red"
              strokeWidth={2.5}
            />
          </div>
        </div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-tactical-red">
          DAY ZERO TEST
        </h1>
        <p className="mt-2 text-sm text-muted-text">
          Assess your combat readiness
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>MISSION BRIEFING</CardTitle>
          <CardDescription>
            Complete this fitness assessment to determine your starting tier
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-sm border border-tactical-red bg-tactical-red/10 p-2">
                <Target className="h-5 w-5 text-tactical-red" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold uppercase text-high-vis">
                  Pushups (Max Reps)
                </h3>
                <p className="text-xs text-muted-text">
                  Complete as many pushups as you can with proper form
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-sm border border-tactical-red bg-tactical-red/10 p-2">
                <Zap className="h-5 w-5 text-tactical-red" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold uppercase text-high-vis">
                  Jump Squats (Max Reps)
                </h3>
                <p className="text-xs text-muted-text">
                  Explosive squats with full extension at the top
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-sm border border-tactical-red bg-tactical-red/10 p-2">
                <Flame className="h-5 w-5 text-tactical-red" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold uppercase text-high-vis">
                  Plank Hold (Seconds)
                </h3>
                <p className="text-xs text-muted-text">
                  Hold plank position with proper form until failure
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-radar-green/30 bg-radar-green/10 p-4">
            <p className="text-center text-xs text-radar-green">
              <strong>Your performance determines your tier:</strong>
              <br />
              {TIERS.NOVICE} • {TIERS.INTERMEDIATE} • {TIERS.ADVANCED} •{" "}
              {TIERS.ELITE}
            </p>
          </div>

          <Button onClick={onStartTest} className="w-full" size="lg">
            BEGIN TEST
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
