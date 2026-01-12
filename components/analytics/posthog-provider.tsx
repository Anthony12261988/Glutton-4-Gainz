"use client";

import { useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { initPostHog, identifyUser, resetUser } from "@/lib/analytics/posthog";

/**
 * PostHog Analytics Provider
 * Initializes PostHog and identifies users
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useUser();

  useEffect(() => {
    // Initialize PostHog on mount
    initPostHog();
  }, []);

  useEffect(() => {
    // Identify user when they log in
    if (user && profile) {
      identifyUser(user.id, {
        email: user.email,
        role: profile.role,
        tier: profile.tier,
        xp: profile.xp,
        current_streak: profile.current_streak,
      });
    } else {
      // Reset user when they log out
      resetUser();
    }
  }, [user, profile]);

  return <>{children}</>;
}
