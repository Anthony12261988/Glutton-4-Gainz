"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ClipboardList,
  ChevronRight,
  ChevronLeft,
  Target,
  Dumbbell,
  SkipForward,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OnboardingDossierProps {
  userId: string;
  onComplete: () => void;
  onSkip: () => void;
}

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner", desc: "New to fitness (0-6 months)" },
  {
    value: "intermediate",
    label: "Intermediate",
    desc: "Some experience (6-24 months)",
  },
  { value: "advanced", label: "Advanced", desc: "Experienced (2-5 years)" },
  { value: "athlete", label: "Athlete", desc: "Elite level (5+ years)" },
];

const FITNESS_GOALS = [
  { value: "lose_fat", label: "Lose Fat", icon: "🔥" },
  { value: "build_muscle", label: "Build Muscle", icon: "💪" },
  { value: "get_stronger", label: "Get Stronger", icon: "🏋️" },
  { value: "improve_endurance", label: "Improve Endurance", icon: "🏃" },
  { value: "general_fitness", label: "General Fitness", icon: "⚡" },
];

const EQUIPMENT_OPTIONS = [
  "Dumbbells",
  "Barbell",
  "Kettlebells",
  "Pull-up Bar",
  "Resistance Bands",
  "Bench",
  "Squat Rack",
  "Cable Machine",
  "Bodyweight Only",
];

export function OnboardingDossier({
  userId,
  onComplete,
  onSkip,
}: OnboardingDossierProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  // Form state - simplified for onboarding (2 steps instead of 4)
  const [experience, setExperience] = useState("");
  const [goal, setGoal] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);

  const totalSteps = 2;

  const toggleEquipment = (item: string) => {
    if (equipment.includes(item)) {
      setEquipment(equipment.filter((e) => e !== item));
    } else {
      setEquipment([...equipment, item]);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // Ensure we have a userId - fallback to fetching from auth if not provided
      let currentUserId = userId;
      if (!currentUserId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("No authenticated user found");
        }
        currentUserId = user.id;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          fitness_experience: (experience || null) as any,
          fitness_goal: (goal || null) as any,
          available_equipment: equipment.length > 0 ? equipment : null,
          dossier_complete: true,
        })
        .eq("id", currentUserId);

      if (error) throw error;

      toast({
        title: "DOSSIER FILED",
        description: "Your fitness profile is on record, soldier.",
      });

      onComplete();
    } catch (err) {
      console.error("Failed to save dossier:", err);
      toast({
        title: "SAVE FAILED",
        description: "Unable to save your profile. Please retry.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return experience && goal;
      case 2:
        return equipment.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 rounded-sm border-2 border-tactical-red bg-tactical-red/10 p-3 w-fit">
          <ClipboardList className="h-8 w-8 text-tactical-red" />
        </div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
          FITNESS DOSSIER
        </h1>
        <p className="mt-2 text-sm text-muted-text">
          Help us personalize your training program
        </p>
      </div>

      {/* Progress */}
      <div className="max-w-md mx-auto">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-muted-text">
            Step {step} of {totalSteps}
          </span>
          <span className="text-sm text-tactical-red">
            {Math.round((step / totalSteps) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-gunmetal rounded-full overflow-hidden">
          <div
            className="h-full bg-tactical-red transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Experience & Goals */}
      {step === 1 && (
        <Card className="border-steel/20 bg-gunmetal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-high-vis">
              <Target className="h-5 w-5 text-tactical-red" />
              Experience & Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Experience Level */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-steel">
                What's your fitness experience?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {EXPERIENCE_LEVELS.map((level) => (
                  <Button
                    key={level.value}
                    type="button"
                    variant={experience === level.value ? "default" : "outline"}
                    className={`h-auto py-3 flex-col items-start ${
                      experience === level.value
                        ? "bg-tactical-red hover:bg-tactical-red/90"
                        : "border-steel/30"
                    }`}
                    onClick={() => setExperience(level.value)}
                  >
                    <span className="font-bold">{level.label}</span>
                    <span className="text-xs opacity-80">{level.desc}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Primary Goal */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-steel">
                What's your primary goal?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {FITNESS_GOALS.map((g) => (
                  <Button
                    key={g.value}
                    type="button"
                    variant={goal === g.value ? "default" : "outline"}
                    className={`h-auto py-3 ${
                      goal === g.value
                        ? "bg-tactical-red hover:bg-tactical-red/90"
                        : "border-steel/30"
                    }`}
                    onClick={() => setGoal(g.value)}
                  >
                    <span className="mr-2">{g.icon}</span>
                    {g.label}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!canProceed()}
              className="w-full"
            >
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Equipment */}
      {step === 2 && (
        <Card className="border-steel/20 bg-gunmetal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-high-vis">
              <Dumbbell className="h-5 w-5 text-tactical-red" />
              Available Equipment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-steel">
                What equipment do you have access to?
              </label>
              <p className="text-xs text-muted-text">Select all that apply</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EQUIPMENT_OPTIONS.map((item) => (
                  <Button
                    key={item}
                    type="button"
                    variant={equipment.includes(item) ? "default" : "outline"}
                    className={`justify-center text-center h-auto py-3 px-2 text-xs sm:text-sm whitespace-normal ${
                      equipment.includes(item)
                        ? "bg-tactical-red hover:bg-tactical-red/90"
                        : "border-steel/30"
                    }`}
                    onClick={() => toggleEquipment(item)}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="border-steel/30"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || saving}
                className="flex-1"
              >
                {saving ? "Saving..." : "Complete Dossier"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skip Option */}
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={onSkip}
          className="text-muted-text hover:text-high-vis"
        >
          <SkipForward className="mr-2 h-4 w-4" />
          Skip for now
        </Button>
        <p className="text-xs text-muted-text mt-1">
          You can complete this later from your profile
        </p>
      </div>
    </div>
  );
}
