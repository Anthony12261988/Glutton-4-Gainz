/**
 * PostHog Analytics utilities
 * Provides a centralized way to track events throughout the application
 */

import posthog from "posthog-js";

/**
 * Initialize PostHog (called from app initialization)
 */
export function initPostHog() {
  if (typeof window === "undefined") {
    return;
  }

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (!posthogKey) {
    console.log("PostHog not configured - analytics disabled");
    return;
  }

  posthog.init(posthogKey, {
    api_host: posthogHost,
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") {
        console.log("PostHog initialized");
      }
    },
    capture_pageview: true,
    capture_pageleave: true,
  });
}

/**
 * Identify a user
 */
export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    posthog.identify(userId, properties);
  } catch (error) {
    // PostHog not initialized or error occurred
    console.warn("PostHog identify failed:", error);
  }
}

/**
 * Reset user identification (on logout)
 */
export function resetUser() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    posthog.reset();
  } catch (error) {
    // PostHog not initialized or error occurred
    console.warn("PostHog reset failed:", error);
  }
}

/**
 * Track an event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    posthog.capture(eventName, properties);
  } catch (error) {
    // PostHog not initialized or error occurred
    console.warn("PostHog track failed:", error);
  }
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, any>) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    posthog.setPersonProperties(properties);
  } catch (error) {
    // PostHog not initialized or error occurred
    console.warn("PostHog setUserProperties failed:", error);
  }
}
