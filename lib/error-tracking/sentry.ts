/**
 * Sentry error tracking utilities
 * Provides a centralized way to track errors throughout the application
 */

import * as Sentry from "@sentry/nextjs";

/**
 * Initialize Sentry (called from app initialization)
 * This is a no-op if Sentry is not configured
 */
export function initSentry() {
  // Sentry is initialized via sentry.client.config.ts and sentry.server.config.ts
  // This function exists for potential future custom initialization
}

/**
 * Capture an exception/error
 */
export function captureException(
  error: Error,
  context?: {
    level?: Sentry.SeverityLevel;
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Sentry not configured, just log to console
    console.error("Error (Sentry not configured):", error);
    return;
  }

  Sentry.captureException(error, {
    level: context?.level || "error",
    tags: context?.tags,
    extra: context?.extra,
  });
}

/**
 * Capture a message (non-error)
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info"
) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.log(`Message (Sentry not configured): ${message}`);
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUser(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context
 */
export function clearUser() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  breadcrumb: {
    message: string;
    category?: string;
    level?: Sentry.SeverityLevel;
    data?: Record<string, unknown>;
  }
) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  Sentry.addBreadcrumb({
    message: breadcrumb.message,
    category: breadcrumb.category || "default",
    level: breadcrumb.level || "info",
    data: breadcrumb.data,
  });
}
