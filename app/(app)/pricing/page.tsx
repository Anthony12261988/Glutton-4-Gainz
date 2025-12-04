"use client";

import { useState } from "react";
import { PricingCard } from "@/components/pricing/pricing-card";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/components/ui/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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

      const { sessionId, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load");

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
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

  const isSoldier = profile?.role === 'soldier' || profile?.role === 'coach';

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 text-white">
          Choose Your <span className="text-tactical-red">Loadout</span>
        </h1>
        <p className="text-xl text-steel max-w-2xl mx-auto">
          Upgrade to Soldier tier to unlock advanced analytics, meal planning, and priority support.
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
            { text: "Tier 1 Workouts", included: true },
            { text: "Basic Stats Tracking", included: true },
            { text: "XP & Badge System", included: true },
            { text: "Community Access", included: true },
            { text: "Meal Planner", included: false },
            { text: "Advanced Analytics", included: false },
            { text: "Coach Messaging", included: false },
          ]}
        />

        <PricingCard
          title="Soldier"
          price="$9.99"
          description="Full tactical advantage for serious gains."
          buttonText={isSoldier ? "MANAGE SUBSCRIPTION" : "UPGRADE NOW"}
          isPopular={true}
          isLoading={isProcessing}
          onButtonClick={isSoldier ? handleManageSubscription : handleUpgrade}
          features={[
            { text: "All Tier Workouts", included: true },
            { text: "Advanced Stats & Charts", included: true },
            { text: "XP & Badge System", included: true },
            { text: "Community Access", included: true },
            { text: "Full Meal Planner", included: true },
            { text: "Weight & Body Metrics", included: true },
            { text: "Priority Support", included: true },
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
