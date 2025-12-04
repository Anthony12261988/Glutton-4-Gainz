"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useUser } from "@/hooks/use-user";

export default function SuccessPage() {
  const router = useRouter();
  const { profile, refreshProfile } = useUser();
  const [checking, setChecking] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [upgradeComplete, setUpgradeComplete] = useState(false);
  const [error, setError] = useState(false);

  const MAX_ATTEMPTS = 15; // 30 seconds max (15 * 2s)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkUpgrade = async () => {
      if (attempts >= MAX_ATTEMPTS) {
        // Max attempts reached - show error state
        setChecking(false);
        setError(true);
        return;
      }

      // Refresh profile from database
      await refreshProfile();

      // Check if user has been upgraded
      if (profile?.role === "soldier") {
        setChecking(false);
        setUpgradeComplete(true);

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push("/dashboard?upgraded=true");
        }, 2000);
      } else {
        // Not upgraded yet, try again
        setAttempts((prev) => prev + 1);
        timeoutId = setTimeout(checkUpgrade, 2000); // Poll every 2 seconds
      }
    };

    if (checking && profile) {
      checkUpgrade();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [attempts, checking, profile, refreshProfile, router]);

  // Still checking for upgrade
  if (checking) {
    return (
      <div className="container max-w-md mx-auto py-24 px-4 text-center">
        <div className="flex justify-center mb-6">
          <Loader2 className="h-24 w-24 text-tactical-red animate-spin" />
        </div>

        <h1 className="text-3xl font-black uppercase tracking-tight mb-4 text-white">
          Processing Upgrade
        </h1>

        <p className="text-steel mb-4">
          Payment successful! Processing your upgrade to Soldier status...
        </p>

        <div className="bg-gunmetal-light rounded-sm p-4 border border-steel/20 mb-8">
          <p className="text-xs text-steel/60 uppercase tracking-wide mb-2">
            STATUS
          </p>
          <p className="text-sm text-tactical-red font-medium">
            Verifying subscription • Attempt {attempts + 1}/{MAX_ATTEMPTS}
          </p>
        </div>

        <p className="text-xs text-steel/40">
          This usually takes a few seconds...
        </p>
      </div>
    );
  }

  // Upgrade verification failed
  if (error) {
    return (
      <div className="container max-w-md mx-auto py-24 px-4 text-center">
        <div className="flex justify-center mb-6">
          <AlertCircle className="h-24 w-24 text-yellow-500" />
        </div>

        <h1 className="text-3xl font-black uppercase tracking-tight mb-4 text-white">
          Payment Received
        </h1>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-sm p-4 mb-6">
          <p className="text-sm text-yellow-400 mb-2">
            Your payment was successful, but we're still processing your upgrade.
          </p>
          <p className="text-xs text-steel/80">
            This can take up to a few minutes. Your account will be automatically
            upgraded shortly.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => {
              setChecking(true);
              setAttempts(0);
              setError(false);
            }}
            className="w-full bg-tactical-red hover:bg-red-700 font-bold tracking-wider"
          >
            CHECK AGAIN
          </Button>

          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="w-full text-steel hover:text-white"
            >
              CONTINUE TO DASHBOARD
            </Button>
          </Link>
        </div>

        <p className="text-xs text-steel/40 mt-6">
          If your account isn't upgraded within 5 minutes, please contact support.
        </p>
      </div>
    );
  }

  // Upgrade complete!
  return (
    <div className="container max-w-md mx-auto py-24 px-4 text-center">
      <div className="flex justify-center mb-6">
        <CheckCircle className="h-24 w-24 text-radar-green animate-pulse" />
      </div>

      <h1 className="text-3xl font-black uppercase tracking-tight mb-4 text-white">
        Upgrade Complete
      </h1>

      <div className="bg-radar-green/10 border border-radar-green/20 rounded-sm p-6 mb-8">
        <p className="text-2xl font-bold text-radar-green mb-2">
          SOLDIER STATUS ACTIVATED
        </p>
        <p className="text-sm text-steel">
          You now have full access to all tactical resources, including the meal
          planner, advanced analytics, and all workout tiers.
        </p>
      </div>

      <div className="space-y-4">
        <Link href="/rations">
          <Button className="w-full bg-tactical-red hover:bg-red-700 font-bold tracking-wider">
            ACCESS MEAL PLANNER
          </Button>
        </Link>

        <Link href="/dashboard">
          <Button
            variant="ghost"
            className="w-full text-steel hover:text-white"
          >
            RETURN TO DASHBOARD
          </Button>
        </Link>
      </div>

      <p className="text-xs text-steel/60 mt-6">
        Redirecting to dashboard in a moment...
      </p>
    </div>
  );
}
