"use client";

import { useState } from "react";
import { PricingCard } from "@/components/pricing/pricing-card";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const { user, profile, loading } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      router.push("/login?redirect=/pricing");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Validate URL before redirecting
      if (!url) {
        throw new Error("No checkout URL returned from server");
      }

      window.location.href = url;
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
      });

      const { url, error } = await response.json();

      if (error) throw new Error(error);

      window.location.href = url;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Could not access subscription portal.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const isSoldier =
    profile?.role === "soldier" ||
    profile?.role === "coach" ||
    profile?.role === "admin";
  const isAdmin = profile?.role === "admin";
  const isCoach = profile?.role === "coach";

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <div className="h-8 w-48 bg-gunmetal animate-pulse rounded-sm mb-6" />
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="h-80 rounded-sm border border-steel/30 bg-gunmetal animate-pulse" />
          <div className="h-80 rounded-sm border border-steel/30 bg-gunmetal animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 text-white">
          Choose Your <span className="text-tactical-red">Loadout</span>
        </h1>
        <p className="text-xl text-steel max-w-2xl mx-auto">
          Upgrade to Soldier tier to unlock training programs, advanced analytics, meal planning,
          and all premium features.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <PricingCard
          title="Recruit"
          price="Free"
          description="Basic access to start your journey."
          buttonText={isSoldier ? "CURRENT PLAN" : "CURRENT PLAN"}
          onButtonClick={() => {}} // No action for free plan
          features={[
            { text: "Zero-Day Assessment Only", included: true },
            { text: "Basic Stats Tracking", included: true },
            { text: "XP & Badge System", included: true },
            { text: "Community Access", included: true },
            { text: "Training Programs", included: false },
            { text: "Meal Planner", included: false },
            { text: "Advanced Analytics", included: false },
          ]}
        />

        <PricingCard
          title="Soldier"
          price="$9.99"
          description="Full tactical advantage for serious gains."
          buttonText={
            isAdmin
              ? "ADMIN ACCESS"
              : isCoach
              ? "COACH ACCESS"
              : isSoldier
              ? "MANAGE SUBSCRIPTION"
              : "UPGRADE NOW"
          }
          isPopular={true}
          isLoading={isProcessing}
          onButtonClick={
            isAdmin || isCoach
              ? () => {}
              : isSoldier
              ? handleManageSubscription
              : handleUpgrade
          }
          features={[
            { text: "All Training Programs (.556, .762, .50 Cal)", included: true },
            { text: "Zero-Day Assessment Access", included: true },
            { text: "Advanced Stats & Charts", included: true },
            { text: "XP & Badge System", included: true },
            { text: "Community Access", included: true },
            { text: "Full Meal Planner", included: true },
            { text: "Weight & Body Metrics", included: true },
          ]}
        />
      </div>

      <div className="mt-16 text-center">
        <p className="text-steel text-sm">
          Secure payment processing by Stripe. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
