"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import { assignTier } from "@/lib/constants/tiers";
import { createClient } from "@/lib/supabase/client";
import { OnboardingIntro } from "@/components/features/onboarding/OnboardingIntro";
import { FitnessTestStep } from "@/components/features/onboarding/FitnessTestStep";
import { OnboardingResults } from "@/components/features/onboarding/OnboardingResults";
import { TOAST_MESSAGES } from "@/lib/dictionary";

type Step = "intro" | "pushups" | "squats" | "core" | "results";

export default function OnboardingPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [checkingInvite, setCheckingInvite] = useState(true);
  const [pushups, setPushups] = useState<number>(0);
  const [squats, setSquats] = useState<number>(0);
  const [plankSeconds, setPlankSeconds] = useState<number>(0);
  const [assignedTier, setAssignedTier] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let isMounted = true;

    const interceptInvite = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!isMounted || !user?.email) {
          setCheckingInvite(false);
          return;
        }

        const { data: invite } = await supabase
          .from("coach_invites")
          .select("id")
          .eq("email", user.email)
          .eq("status", "pending")
          .maybeSingle();

        if (!isMounted) return;

        if (!invite) {
          setCheckingInvite(false);
          return;
        }

        await supabase
          .from("coach_invites")
          .update({ status: "accepted" })
          .eq("id", invite.id);

        await supabase.from("profiles").update({ role: "coach" }).eq("id", user.id);

        toast({
          title: TOAST_MESSAGES.workout.onboardingComplete.title,
          description: TOAST_MESSAGES.workout.onboardingComplete.description,
        });

        router.replace("/barracks");
        router.refresh();
      } catch (error) {
        console.error("Error checking coach invite:", error);
        if (isMounted) {
          setCheckingInvite(false);
        }
      }
    };

    interceptInvite();

    return () => {
      isMounted = false;
    };
  }, [router, supabase, toast]);

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

  const handleComplete = () => {
    toast({
      title: TOAST_MESSAGES.workout.profileUpdated.title,
      description: TOAST_MESSAGES.workout.profileUpdated.description,
    });
    router.push("/dashboard");
    router.refresh();
  };

  if (checkingInvite) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center space-y-4 text-center">
        <div className="rounded-sm border-2 border-radar-green bg-radar-green/10 p-4">
          <Shield className="h-10 w-10 text-radar-green" strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-heading text-2xl font-bold uppercase tracking-wider text-high-vis">
            Checking Orders
          </p>
          <p className="mt-2 text-sm text-muted-text">
            Scanning for officer commissions tied to your email...
          </p>
        </div>
      </div>
    );
  }

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
        onComplete={handleComplete}
      />
    );
  }

  return null;
}
