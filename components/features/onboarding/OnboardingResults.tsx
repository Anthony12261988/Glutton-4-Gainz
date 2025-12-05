"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TIERS } from "@/lib/constants/tiers";

interface OnboardingResultsProps {
  pushups: number;
  squats: number;
  plankSeconds: number;
  assignedTier: string;
  onComplete: () => void;
}

const getTierDescription = (tier: string): string => {
  switch (tier) {
    case TIERS.NOVICE:
      return "Foundation phase. Master the basics and build consistency.";
    case TIERS.INTERMEDIATE:
      return "Solid foundation. Ready for increased intensity.";
    case TIERS.ADVANCED:
      return "Strong performance. Elite-level workouts unlocked.";
    case TIERS.ELITE:
      return "Exceptional readiness. Maximum difficulty unlocked.";
    default:
      return "Your fitness journey begins now.";
  }
};

export function OnboardingResults({
  pushups,
  squats,
  plankSeconds,
  assignedTier,
  onComplete,
}: OnboardingResultsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-radar-green">
          ASSESSMENT COMPLETE
        </h1>
        <p className="mt-2 text-sm text-muted-text">
          Your tier has been assigned
        </p>
      </div>

      <Card className="border-2 border-radar-green shadow-[0_0_20px_rgba(16,185,129,0.3)]">
        <CardHeader>
          <CardTitle>YOUR RESULTS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-text">PUSHUPS</p>
              <p className="font-heading text-2xl font-bold text-high-vis">
                {pushups}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-text">SQUATS</p>
              <p className="font-heading text-2xl font-bold text-high-vis">
                {squats}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-text">PLANK</p>
              <p className="font-heading text-2xl font-bold text-high-vis">
                {plankSeconds}s
              </p>
            </div>
          </div>

          {/* Tier Assignment */}
          <div className="rounded-sm border-2 border-radar-green bg-radar-green/10 p-6 text-center">
            <p className="text-xs uppercase text-muted-text">ASSIGNED TIER</p>
            <p className="mt-2 font-heading text-4xl font-bold uppercase tracking-widest text-radar-green">
              {assignedTier}
            </p>
          </div>

          {/* Tier Description */}
          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-text">
              {getTierDescription(assignedTier)}
            </p>
          </div>

          <Button onClick={onComplete} className="w-full" size="lg">
            ENTER THE ARENA
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
