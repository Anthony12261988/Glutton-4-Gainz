"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import {
  ClipboardList,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  SkipForward,
  Target,
  Dumbbell,
  Clock,
  AlertTriangle,
  User,
  Scale,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface FitnessDossierFormProps {
  userId: string;
  existingData?: {
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
  };
  onComplete?: () => void;
  onSkip?: () => void;
  /** Simplified mode shows only 2 steps (Experience/Goals + Equipment) for onboarding */
  simplified?: boolean;
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
  "Treadmill",
  "Rowing Machine",
  "Bodyweight Only",
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export function FitnessDossierForm({
  userId,
  existingData,
  onComplete,
  onSkip,
  simplified = false,
}: FitnessDossierFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  // Form state
  const [experience, setExperience] = useState(
    existingData?.fitness_experience || ""
  );
  const [goal, setGoal] = useState(existingData?.fitness_goal || "");
  const [equipment, setEquipment] = useState<string[]>(
    existingData?.available_equipment || []
  );
  const [injuries, setInjuries] = useState(
    existingData?.injuries_limitations || ""
  );
  const [duration, setDuration] = useState(
    existingData?.preferred_duration?.toString() || "45"
  );
  const [daysPerWeek, setDaysPerWeek] = useState(
    existingData?.workout_days_per_week?.toString() || "4"
  );
  const [heightFeet, setHeightFeet] = useState(
    existingData?.height_inches
      ? Math.floor(existingData.height_inches / 12).toString()
      : ""
  );
  const [heightInches, setHeightInches] = useState(
    existingData?.height_inches
      ? (existingData.height_inches % 12).toString()
      : ""
  );
  const [targetWeight, setTargetWeight] = useState(
    existingData?.target_weight?.toString() || ""
  );
  const [dob, setDob] = useState<Date | undefined>(
    existingData?.date_of_birth
      ? new Date(existingData.date_of_birth)
      : undefined
  );
  const [gender, setGender] = useState(existingData?.gender || "");

  const totalSteps = simplified ? 2 : 4;

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
      // For simplified mode, only save basic fields
      if (simplified) {
        const { error } = await supabase
          .from("profiles")
          .update({
            fitness_experience: (experience || null) as any,
            fitness_goal: (goal || null) as any,
            available_equipment: equipment.length > 0 ? equipment : null,
            dossier_complete: true,
          })
          .eq("id", userId);

        if (error) throw error;
      } else {
        // Full mode - save all fields
        const totalHeight =
          heightFeet && heightInches
            ? parseInt(heightFeet) * 12 + parseInt(heightInches)
            : null;

        const { error } = await supabase
          .from("profiles")
          .update({
            fitness_experience: (experience || null) as any,
            fitness_goal: (goal || null) as any,
            available_equipment: equipment.length > 0 ? equipment : null,
            injuries_limitations: injuries.trim() || null,
            preferred_duration: duration ? parseInt(duration) : null,
            workout_days_per_week: daysPerWeek ? parseInt(daysPerWeek) : null,
            height_inches: totalHeight,
            target_weight: targetWeight ? parseFloat(targetWeight) : null,
            date_of_birth: dob ? format(dob, "yyyy-MM-dd") : null,
            gender: (gender || null) as any,
            dossier_complete: true,
          })
          .eq("id", userId);

        if (error) throw error;
      }

      toast({
        title: simplified ? "DOSSIER FILED" : "DOSSIER COMPLETE",
        description: simplified 
          ? "Your fitness profile is on record, soldier."
          : "Your fitness profile has been saved.",
      });

      onComplete?.();
      if (!simplified) {
        router.refresh();
      }
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
      case 3:
        return duration && daysPerWeek;
      case 4:
        return true; // Optional fields
      default:
        return true;
    }
  };

  return (
    <div className={simplified ? "space-y-6" : "max-w-2xl mx-auto"}>
      {/* Header for simplified/onboarding mode */}
      {simplified && (
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
      )}

      {/* Progress Bar */}
      <div className={simplified ? "max-w-md mx-auto" : "mb-8"}>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXPERIENCE_LEVELS.map((level) => (
                  <Button
                    key={level.value}
                    type="button"
                    variant={experience === level.value ? "default" : "outline"}
                    className={`h-auto py-3 flex-col items-start text-left whitespace-normal ${
                      experience === level.value
                        ? "bg-tactical-red hover:bg-tactical-red/90"
                        : "border-steel/30"
                    }`}
                    onClick={() => setExperience(level.value)}
                  >
                    <span className="font-bold">{level.label}</span>
                    <span className="text-xs opacity-80 break-words">{level.desc}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Primary Goal */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-steel">
                What's your primary goal?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FITNESS_GOALS.map((g) => (
                  <Button
                    key={g.value}
                    type="button"
                    variant={goal === g.value ? "default" : "outline"}
                    className={`h-auto py-3 whitespace-normal ${
                      goal === g.value ? "bg-tactical-red hover:bg-tactical-red/90" : "border-steel/30"
                    }`}
                    onClick={() => setGoal(g.value)}
                  >
                    <span className="mr-2">{g.icon}</span>
                    {g.label}
                  </Button>
                ))}
              </div>
            </div>
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
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-text">
              Select all equipment you have access to:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {EQUIPMENT_OPTIONS.map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant={equipment.includes(item) ? "default" : "outline"}
                  className={`h-auto py-3 text-sm min-h-[44px] ${
                    equipment.includes(item)
                      ? "bg-tactical-red"
                      : "border-steel/30"
                  }`}
                  onClick={() => toggleEquipment(item)}
                >
                  {equipment.includes(item) && (
                    <Check className="mr-1 h-3 w-3" />
                  )}
                  {item}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Schedule */}
      {step === 3 && (
        <Card className="border-steel/20 bg-gunmetal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-high-vis">
              <Clock className="h-5 w-5 text-tactical-red" />
              Training Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preferred Duration */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-steel">
                Preferred Workout Duration (minutes)
              </label>
              <div className="flex gap-3">
                {["30", "45", "60", "90"].map((d) => (
                  <Button
                    key={d}
                    type="button"
                    variant={duration === d ? "default" : "outline"}
                    className={
                      duration === d ? "bg-tactical-red" : "border-steel/30"
                    }
                    onClick={() => setDuration(d)}
                  >
                    {d} min
                  </Button>
                ))}
              </div>
            </div>

            {/* Days Per Week */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-steel">
                Workout Days Per Week
              </label>
              <div className="flex gap-2">
                {["2", "3", "4", "5", "6", "7"].map((d) => (
                  <Button
                    key={d}
                    type="button"
                    variant={daysPerWeek === d ? "default" : "outline"}
                    className={`w-12 ${
                      daysPerWeek === d ? "bg-tactical-red" : "border-steel/30"
                    }`}
                    onClick={() => setDaysPerWeek(d)}
                  >
                    {d}
                  </Button>
                ))}
              </div>
            </div>

            {/* Injuries */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-steel">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Injuries or Limitations (optional)
              </label>
              <Textarea
                value={injuries}
                onChange={(e) => setInjuries(e.target.value)}
                placeholder="e.g., Lower back issues, knee problems..."
                className="bg-black/20 border-steel/30"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Personal Info */}
      {step === 4 && (
        <Card className="border-steel/20 bg-gunmetal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-high-vis">
              <User className="h-5 w-5 text-tactical-red" />
              Personal Details (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Gender */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-steel">Gender</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GENDER_OPTIONS.map((g) => (
                  <Button
                    key={g.value}
                    type="button"
                    variant={gender === g.value ? "default" : "outline"}
                    className={
                      gender === g.value ? "bg-tactical-red" : "border-steel/30"
                    }
                    onClick={() => setGender(g.value)}
                  >
                    {g.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-steel">
                Date of Birth
              </label>
              <DatePicker
                date={dob}
                onDateChange={setDob}
                placeholder="Select your birth date"
              />
            </div>

            {/* Height */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-steel">Height</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Feet"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    className="bg-black/20 border-steel/30"
                    min="3"
                    max="8"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Inches"
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    className="bg-black/20 border-steel/30"
                    min="0"
                    max="11"
                  />
                </div>
              </div>
            </div>

            {/* Target Weight */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-steel">
                <Scale className="h-4 w-4" />
                Target Weight (lbs)
              </label>
              <Input
                type="number"
                placeholder="e.g., 180"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="bg-black/20 border-steel/30"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          className="border-steel/30"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {step < totalSteps ? (
          <Button
            className="bg-tactical-red hover:bg-red-700"
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
          >
            Continue
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="bg-radar-green hover:bg-green-700"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Complete Dossier
              </>
            )}
          </Button>
        )}
      </div>

      {/* Skip Option - only in simplified/onboarding mode */}
      {simplified && onSkip && (
        <div className="text-center mt-6">
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
      )}
    </div>
  );
}
