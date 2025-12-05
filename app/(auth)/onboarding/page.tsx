"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { assignTier } from "@/lib/constants/tiers";
import { createClient } from "@/lib/supabase/client";
import { OnboardingIntro } from "@/components/features/onboarding/OnboardingIntro";
import { FitnessTestStep } from "@/components/features/onboarding/FitnessTestStep";
import { OnboardingResults } from "@/components/features/onboarding/OnboardingResults";
import { OnboardingDossier } from "@/components/features/onboarding/OnboardingDossier";
import { TOAST_MESSAGES } from "@/lib/dictionary";

type Step = "intro" | "pushups" | "squats" | "core" | "results" | "dossier";

export default function OnboardingPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [pushups, setPushups] = useState<number>(0);
  const [squats, setSquats] = useState<number>(0);
  const [plankSeconds, setPlankSeconds] = useState<number>(0);
  const [assignedTier, setAssignedTier] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const handleStartTest = () => {
    setStep("pushups");
  };

  const handlePushupsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("squats");
  };

  const handleSquatsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("core");
  };

  const handleCoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Calculate tier based on pushups (primary metric)
    const tier = assignTier(pushups);
    setAssignedTier(tier);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        const { error } = await supabase
          .from("profiles")
          .update({ tier })
          .eq("id", user.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: TOAST_MESSAGES.workout.assessmentError.title,
        description: TOAST_MESSAGES.workout.assessmentError.description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setStep("results");
    }
  };

  const handleResultsContinue = () => {
    // Go to dossier step instead of dashboard
    setStep("dossier");
  };

  const handleDossierComplete = () => {
    toast({
      title: TOAST_MESSAGES.workout.profileUpdated.title,
      description: TOAST_MESSAGES.workout.profileUpdated.description,
    });
    router.push("/dashboard");
    router.refresh();
  };

  const handleDossierSkip = () => {
    toast({
      title: "DOSSIER SKIPPED",
      description: "You can complete it later from your profile.",
    });
    router.push("/dashboard");
    router.refresh();
  };

  if (step === "intro") {
    return <OnboardingIntro onStartTest={handleStartTest} />;
  }

  if (step === "pushups") {
    return (
      <FitnessTestStep
        testNumber={1}
        totalTests={3}
        title="PUSHUPS"
        subtitle="Pushups - Max Reps"
        label="Reps Completed"
        value={pushups}
        onChange={setPushups}
        onSubmit={handlePushupsSubmit}
      />
    );
  }

  if (step === "squats") {
    return (
      <FitnessTestStep
        testNumber={2}
        totalTests={3}
        title="JUMP SQUATS"
        subtitle="Jump Squats - Max Reps"
        label="Reps Completed"
        value={squats}
        onChange={setSquats}
        onSubmit={handleSquatsSubmit}
      />
    );
  }

  if (step === "core") {
    return (
      <FitnessTestStep
        testNumber={3}
        totalTests={3}
        title="PLANK HOLD"
        subtitle="Plank - Max Time"
        label="Seconds Held"
        value={plankSeconds}
        onChange={setPlankSeconds}
        onSubmit={handleCoreSubmit}
        isLoading={loading}
        isLastStep
      />
    );
  }

  if (step === "results") {
    return (
      <OnboardingResults
        pushups={pushups}
        squats={squats}
        plankSeconds={plankSeconds}
        assignedTier={assignedTier}
        onComplete={handleResultsContinue}
      />
    );
  }

  if (step === "dossier") {
    return (
      <OnboardingDossier
        userId={userId}
        onComplete={handleDossierComplete}
        onSkip={handleDossierSkip}
      />
    );
  }

  return null;
}
