/**
 * Utility functions for sending push notifications
 * These should be called from server-side code or API routes
 */

export interface SendPushNotificationParams {
  userId: string;
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
}

/**
 * Send a push notification to a user
 * Calls the internal API route
 */
export async function sendPushNotification(
  params: SendPushNotificationParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || "Failed to send notification" };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}

/**
 * Send notification when user receives a new message
 */
export async function sendNewMessageNotification(
  recipientId: string,
  senderName: string,
  messagePreview: string
) {
  return sendPushNotification({
    userId: recipientId,
    title: `New message from ${senderName}`,
    body: messagePreview.slice(0, 100),
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    data: {
      type: "new_message",
      senderName,
    },
  });
}

/**
 * Send notification when user earns a new badge
 */
export async function sendBadgeEarnedNotification(
  userId: string,
  badgeName: string,
  badgeDescription: string
) {
  return sendPushNotification({
    userId,
    title: `🏆 Badge Earned: ${badgeName}`,
    body: badgeDescription,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    data: {
      type: "badge_earned",
      badgeName,
    },
  });
}

/**
 * Send workout reminder notification
 */
export async function sendWorkoutReminderNotification(
  userId: string,
  workoutTitle?: string
) {
  return sendPushNotification({
    userId,
    title: "🎯 Time for Your Daily Mission!",
    body: workoutTitle
      ? `Today's workout: ${workoutTitle}`
      : "Don't forget to complete your workout today!",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    data: {
      type: "workout_reminder",
    },
  });
}

/**
 * Send streak about to break notification
 */
export async function sendStreakWarningNotification(
  userId: string,
  currentStreak: number
) {
  return sendPushNotification({
    userId,
    title: "🔥 Don't Break Your Streak!",
    body: `You have a ${currentStreak}-day streak. Complete a workout today to keep it alive!`,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    data: {
      type: "streak_warning",
      currentStreak,
    },
  });
}

/**
 * Send buddy nudge notification
 */
export async function sendBuddyNudgeNotification(
  userId: string,
  buddyName: string
) {
  return sendPushNotification({
    userId,
    title: `${buddyName} sent you a wake-up call!`,
    body: "Your buddy wants to see you back in action. Time to get moving!",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    data: {
      type: "buddy_nudge",
      buddyName,
    },
  });
}
