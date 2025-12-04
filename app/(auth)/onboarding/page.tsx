"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Shield, ChevronRight, Target, Zap, Flame } from "lucide-react";
import { assignTier, TIERS } from "@/lib/constants/tiers";
import { createClient } from "@/lib/supabase/client";

type Step = "intro" | "pushups" | "squats" | "core" | "results";

export default function OnboardingPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [pushups, setPushups] = useState<number>(0);
  const [squats, setSquats] = useState<number>(0);
  const [plankSeconds, setPlankSeconds] = useState<number>(0);
  const [assignedTier, setAssignedTier] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

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
        title: "ERROR SAVING RESULTS",
        description:
          "Your tier was calculated but not saved. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setStep("results");
    }
  };

  const handleComplete = () => {
    toast({
      title: "PROFILE UPDATED",
      description: "Redirecting to your dashboard...",
    });
    router.push("/dashboard");
    router.refresh();
  };

  if (step === "intro") {
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

            <Button onClick={handleStartTest} className="w-full" size="lg">
              BEGIN TEST
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "pushups") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold uppercase tracking-wider text-tactical-red">
            TEST 1 OF 3
          </h1>
          <p className="mt-1 text-sm text-muted-text">Pushups - Max Reps</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>PUSHUPS</CardTitle>
            <CardDescription>
              Enter the total number of pushups completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePushupsSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="pushups"
                  className="text-xs font-bold uppercase tracking-wide text-muted-text"
                >
                  Reps Completed
                </label>
                <Input
                  id="pushups"
                  type="number"
                  min="0"
                  max="500"
                  placeholder="0"
                  value={pushups || ""}
                  onChange={(e) => setPushups(Number(e.target.value))}
                  className="text-2xl font-bold"
                  required
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                NEXT TEST
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "squats") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold uppercase tracking-wider text-tactical-red">
            TEST 2 OF 3
          </h1>
          <p className="mt-1 text-sm text-muted-text">Jump Squats - Max Reps</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>JUMP SQUATS</CardTitle>
            <CardDescription>
              Enter the total number of jump squats completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSquatsSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="squats"
                  className="text-xs font-bold uppercase tracking-wide text-muted-text"
                >
                  Reps Completed
                </label>
                <Input
                  id="squats"
                  type="number"
                  min="0"
                  max="500"
                  placeholder="0"
                  value={squats || ""}
                  onChange={(e) => setSquats(Number(e.target.value))}
                  className="text-2xl font-bold"
                  required
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                NEXT TEST
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "core") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold uppercase tracking-wider text-tactical-red">
            TEST 3 OF 3
          </h1>
          <p className="mt-1 text-sm text-muted-text">Plank Hold - Time</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>PLANK HOLD</CardTitle>
            <CardDescription>
              Enter the total seconds held in plank position
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCoreSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="plank"
                  className="text-xs font-bold uppercase tracking-wide text-muted-text"
                >
                  Seconds Held
                </label>
                <Input
                  id="plank"
                  type="number"
                  min="0"
                  max="600"
                  placeholder="0"
                  value={plankSeconds || ""}
                  onChange={(e) => setPlankSeconds(Number(e.target.value))}
                  className="text-2xl font-bold"
                  required
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                VIEW RESULTS
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "results") {
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
                {assignedTier === TIERS.NOVICE &&
                  "Foundation phase. Master the basics and build consistency."}
                {assignedTier === TIERS.INTERMEDIATE &&
                  "Solid foundation. Ready for increased intensity."}
                {assignedTier === TIERS.ADVANCED &&
                  "Strong performance. Elite-level workouts unlocked."}
                {assignedTier === TIERS.ELITE &&
                  "Exceptional readiness. Maximum difficulty unlocked."}
              </p>
            </div>

            <Button onClick={handleComplete} className="w-full" size="lg">
              ENTER THE ARENA
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
