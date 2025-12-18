"use client";

import { useState } from "react";
import { FitnessDossierForm } from "@/components/features/onboarding/FitnessDossierForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Check, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

interface DossierPageClientProps {
  userId: string;
  existingData: {
    fitness_experience?: string | null;
    fitness_goal?: string | null;
    available_equipment?: string[] | null;
    injuries_limitations?: string | null;
    preferred_duration?: number | null;
    workout_days_per_week?: number | null;
    height_inches?: number | null;
    target_weight?: number | null;
    date_of_birth?: string | null;
    gender?: string | null;
    dossier_complete?: boolean | null;
  } | null;
}

const GOAL_LABELS: Record<string, string> = {
  lose_fat: "Lose Fat",
  build_muscle: "Build Muscle",
  get_stronger: "Get Stronger",
  improve_endurance: "Improve Endurance",
  general_fitness: "General Fitness",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  athlete: "Athlete",
};

export function DossierPageClient({
  userId,
  existingData,
}: DossierPageClientProps) {
  const [isEditing, setIsEditing] = useState(!existingData?.dossier_complete);
  const router = useRouter();

  const formatHeight = (inches: number | null | undefined) => {
    if (!inches) return "Not set";
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`;
  };

  if (isEditing) {
    return (
      <div className="space-y-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
              FITNESS DOSSIER
            </h1>
            <p className="text-sm text-muted-text">
              Complete your soldier profile
            </p>
          </div>
          <div className="rounded-sm border border-tactical-red bg-tactical-red/10 p-2">
            <ClipboardList className="h-6 w-6 text-tactical-red" />
          </div>
        </div>

        <FitnessDossierForm
          userId={userId}
          existingData={existingData || undefined}
          onComplete={() => {
            setIsEditing(false);
            router.refresh();
          }}
        />
      </div>
    );
  }

  // View Mode - Show completed dossier
  return (
    <div className="space-y-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
            FITNESS DOSSIER
          </h1>
          <p className="text-sm text-muted-text">Your soldier profile</p>
        </div>
        <Button
          variant="outline"
          className="border-steel/30"
          onClick={() => setIsEditing(true)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      {/* Status */}
      <Card className="border-radar-green/30 bg-radar-green/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-radar-green bg-radar-green/20 p-2">
              <Check className="h-5 w-5 text-radar-green" />
            </div>
            <div>
              <p className="font-heading font-bold text-radar-green">
                DOSSIER COMPLETE
              </p>
              <p className="text-sm text-muted-text">
                Your fitness profile is on file
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Experience & Goal */}
        <Card className="border-steel/20 bg-gunmetal">
          <CardContent className="py-4">
            <h3 className="font-heading text-sm font-bold uppercase text-steel mb-3">
              Training Profile
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-text">Experience</span>
                <span className="text-high-vis">
                  {EXPERIENCE_LABELS[existingData?.fitness_experience || ""] ||
                    "Not set"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-text">Primary Goal</span>
                <span className="text-high-vis">
                  {GOAL_LABELS[existingData?.fitness_goal || ""] || "Not set"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card className="border-steel/20 bg-gunmetal">
          <CardContent className="py-4">
            <h3 className="font-heading text-sm font-bold uppercase text-steel mb-3">
              Training Schedule
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-text">Workout Duration</span>
                <span className="text-high-vis">
                  {existingData?.preferred_duration
                    ? `${existingData.preferred_duration} min`
                    : "Not set"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-text">Days Per Week</span>
                <span className="text-high-vis">
                  {existingData?.workout_days_per_week || "Not set"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipment */}
        <Card className="border-steel/20 bg-gunmetal">
          <CardContent className="py-4">
            <h3 className="font-heading text-sm font-bold uppercase text-steel mb-3">
              Available Equipment
            </h3>
            {existingData?.available_equipment &&
            existingData.available_equipment.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {existingData.available_equipment.map((item) => (
                  <span
                    key={item}
                    className="rounded-sm bg-tactical-red/10 px-2 py-1 text-xs text-tactical-red"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-text text-sm">Not specified</p>
            )}
          </CardContent>
        </Card>

        {/* Physical Stats */}
        <Card className="border-steel/20 bg-gunmetal">
          <CardContent className="py-4">
            <h3 className="font-heading text-sm font-bold uppercase text-steel mb-3">
              Physical Stats
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-text">Height</span>
                <span className="text-high-vis">
                  {formatHeight(existingData?.height_inches)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-text">Target Weight</span>
                <span className="text-high-vis">
                  {existingData?.target_weight
                    ? `${existingData.target_weight} lbs`
                    : "Not set"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-text">Gender</span>
                <span className="text-high-vis capitalize">
                  {existingData?.gender?.replace(/_/g, " ") || "Not set"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Injuries */}
      {existingData?.injuries_limitations && (
        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardContent className="py-4">
            <h3 className="font-heading text-sm font-bold uppercase text-orange-500 mb-2">
              ⚠️ Injuries / Limitations
            </h3>
            <p className="text-sm text-high-vis">
              {existingData.injuries_limitations}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
