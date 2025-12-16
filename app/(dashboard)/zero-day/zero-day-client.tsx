"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { assignTier } from "@/lib/constants/tiers";
import { createClient } from "@/lib/supabase/client";
import { FitnessTestStep } from "@/components/features/onboarding/FitnessTestStep";
import { OnboardingResults } from "@/components/features/onboarding/OnboardingResults";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Step = "intro" | "pushups" | "squats" | "core" | "results";

interface ZeroDayClientProps {
  userId: string;
  currentTier: string;
}

interface ZeroDayTest {
  user_id: string;
  pushups: number;
  squats: number;
  plank_seconds: number;
  assigned_tier: string;
  previous_tier: string | null;
}

export default function ZeroDayClient({
  userId,
  currentTier,
}: ZeroDayClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [pushups, setPushups] = useState<number>(0);
  const [squats, setSquats] = useState<number>(0);
  const [plankSeconds, setPlankSeconds] = useState<number>(0);
  const [assignedTier, setAssignedTier] = useState<string>("");
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

    try {
      const newTier = assignTier(pushups);
      setAssignedTier(newTier);

      // Save test attempt to zero_day_tests table for historical tracking
      const testData: ZeroDayTest = {
        user_id: userId,
        pushups,
        squats,
        plank_seconds: plankSeconds,
        assigned_tier: newTier,
        previous_tier: currentTier,
      };

      const { error: testError } = await supabase
        .from("zero_day_tests")
        .insert(testData);

      if (testError) {
        console.error("Failed to save test results:", testError);
        // Don't block the flow, but log the error
      }

      // Update profile with new tier
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          tier: newTier,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      setStep("results");
    } catch (error: any) {
      toast({
        title: "ASSESSMENT FAILED",
        description: error.message || "Failed to update tier",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResultsContinue = () => {
    toast({
      title: "TIER UPDATED",
      description: `Your tier has been updated to ${assignedTier}`,
    });
    router.push("/dashboard");
    router.refresh();
  };

  if (step === "intro") {
    return (
      <div className="space-y-8 pb-20 md:pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
              ZERO DAY ASSESSMENT
            </h1>
            <p className="text-sm text-muted-text">
              Complete your fitness assessment to establish baseline performance
            </p>
          </div>
          <div className="rounded-sm border border-tactical-red bg-tactical-red/10 p-2">
            <Shield className="h-6 w-6 text-tactical-red" />
          </div>
        </div>

        <Card className="border-tactical-red/30 bg-gunmetal">
          <CardHeader>
            <CardTitle className="text-tactical-red">CURRENT STATUS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-text">CURRENT TIER</p>
                <p className="font-heading text-2xl font-bold text-high-vis">
                  {currentTier}
                </p>
              </div>
              <div className="rounded-sm border border-steel/30 bg-gunmetal/50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-tactical-red flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-high-vis font-semibold mb-1">
                      ASSESSMENT PROTOCOL
                    </p>
                    <p className="text-xs text-muted-text leading-relaxed">
                      Zero Day is your fitness baseline assessment. Complete the three-part test to establish your performance tier.
                      You can retake this assessment anytime to track improvement and unlock higher tiers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-steel/30 bg-gunmetal">
          <CardHeader>
            <CardTitle>ASSESSMENT OVERVIEW</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-heading text-sm font-bold uppercase text-tactical-red mb-2">
                  TEST 1: PUSHUPS
                </h3>
                <p className="text-sm text-muted-text">
                  Maximum reps in one set
                </p>
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold uppercase text-tactical-red mb-2">
                  TEST 2: JUMP SQUATS
                </h3>
                <p className="text-sm text-muted-text">
                  Maximum reps in one set
                </p>
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold uppercase text-tactical-red mb-2">
                  TEST 3: PLANK HOLD
                </h3>
                <p className="text-sm text-muted-text">
                  Maximum time held in seconds
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleStartTest}
          className="w-full py-6 text-lg bg-tactical-red hover:bg-red-700"
        >
          BEGIN ASSESSMENT
        </Button>
      </div>
    );
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

  return null;
}


