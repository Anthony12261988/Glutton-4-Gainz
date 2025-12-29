"use client";

import { useEffect, useMemo, useState, useRef } from "react";
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

interface LatestRecord {
  pushups: number;
  squats: number;
  plank_seconds: number;
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
  const [latestRecord, setLatestRecord] = useState<LatestRecord | null>(null);
  const [recordLoading, setRecordLoading] = useState(true);
  
  const supabaseRef = useRef(createClient());
  const hasInitializedRef = useRef(false);

  // Fetch latest assessment record on mount
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const fetchLatestRecord = async () => {
      try {
        setRecordLoading(true);
        const { data: record, error } = await supabaseRef.current
          .from("zero_day_tests")
          .select("pushups, squats, plank_seconds")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (record) {
          setLatestRecord({
            pushups: record.pushups,
            squats: record.squats,
            plank_seconds: record.plank_seconds,
          });
        }
      } catch (err) {
        console.error("Failed to fetch latest record:", err);
      } finally {
        setRecordLoading(false);
      }
    };

    fetchLatestRecord();
  }, [userId]);

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

      const { error: testError } = await supabaseRef.current
        .from("zero_day_tests")
        .insert(testData);

      if (testError) {
        console.error("Failed to save test results:", testError);
      }

      // Update profile with new tier
      const { error: profileError } = await supabaseRef.current
        .from("profiles")
        .update({
          tier: newTier,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Update latest record state for display
      setLatestRecord({
        pushups,
        squats,
        plank_seconds: plankSeconds,
      });

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
    const displayPushups = latestRecord?.pushups ?? 0;
    const displaySquats = latestRecord?.squats ?? 0;
    const displayPlank = latestRecord?.plank_seconds ?? 0;

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
            <div className="space-y-6">
              <div>
                <p className="text-xs text-muted-text uppercase tracking-wide mb-2">CURRENT TIER</p>
                <p className="font-heading text-3xl md:text-4xl font-bold text-high-vis">
                  {currentTier}
                </p>
              </div>

              {/* Assessment Results Grid */}
              <div className="grid grid-cols-3 gap-2 md:gap-4 bg-camo-black/50 rounded-lg p-4 border border-steel/30">
                {/* Pushups */}
                <div className="text-center">
                  <p className="text-xs md:text-sm text-muted-text uppercase tracking-wide mb-3">
                    Pushups
                  </p>
                  <div className="bg-gunmetal/80 rounded-lg p-3 border border-radar-green/30">
                    <p className="text-2xl md:text-3xl font-heading font-bold text-radar-green">
                      {recordLoading ? "..." : displayPushups}
                    </p>
                    <p className="text-xs text-steel mt-1">reps</p>
                  </div>
                </div>

                {/* Squats */}
                <div className="text-center">
                  <p className="text-xs md:text-sm text-muted-text uppercase tracking-wide mb-3">
                    Squats
                  </p>
                  <div className="bg-gunmetal/80 rounded-lg p-3 border border-radar-green/30">
                    <p className="text-2xl md:text-3xl font-heading font-bold text-radar-green">
                      {recordLoading ? "..." : displaySquats}
                    </p>
                    <p className="text-xs text-steel mt-1">reps</p>
                  </div>
                </div>

                {/* Plank */}
                <div className="text-center">
                  <p className="text-xs md:text-sm text-muted-text uppercase tracking-wide mb-3">
                    Plank
                  </p>
                  <div className="bg-gunmetal/80 rounded-lg p-3 border border-radar-green/30">
                    <p className="text-2xl md:text-3xl font-heading font-bold text-radar-green">
                      {recordLoading ? "..." : displayPlank}
                    </p>
                    <p className="text-xs text-steel mt-1">seconds</p>
                  </div>
                </div>
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
                      Your tier determines workout difficulty. You can retake this assessment anytime to track improvement.
                    </p>
                    <p className="text-xs text-steel mt-2">
                      Note: Premium features require Soldier upgrade (payment), not tier level.
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


