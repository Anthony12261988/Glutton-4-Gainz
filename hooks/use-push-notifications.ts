"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getExistingSubscription,
  type PushSubscriptionData,
} from "@/lib/push-notifications/web-push";

const supabase = createClient();

/**
 * Hook to manage push notification subscriptions
 */
export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check support and permission on mount
  useEffect(() => {
    const checkStatus = async () => {
      const supported = isPushSupported();
      setIsSupported(supported);

      if (supported) {
        const perm = getNotificationPermission();
        setPermission(perm);

        // Check if already subscribed
        const existing = await getExistingSubscription();
        setIsSubscribed(!!existing);
      }
    };

    checkStatus();
  }, []);

  /**
   * Subscribe to push notifications
   */
  const subscribe = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!isSupported) {
        throw new Error("Push notifications are not supported in this browser");
      }

      // Get VAPID public key from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error("VAPID public key not configured");
      }

      // Subscribe to push
      const subscriptionData = await subscribeToPush(vapidPublicKey);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Save subscription to database
      const { error: dbError } = await supabase
        .from("push_subscriptions")
        .upsert({
          user_id: user.id,
          endpoint: subscriptionData.endpoint,
          p256dh_key: subscriptionData.keys.p256dh,
          auth_key: subscriptionData.keys.auth,
          updated_at: new Date().toISOString(),
        });

      if (dbError) throw dbError;

      setIsSubscribed(true);
      setPermission("granted");

      return true;
    } catch (err: any) {
      console.error("Failed to subscribe to push notifications:", err);
      setError(err.message || "Failed to subscribe");
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported]);

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Unsubscribe from browser
      await unsubscribeFromPush();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Remove subscription from database
      const { error: dbError } = await supabase
        .from("push_subscriptions")
        .delete()
        .eq("user_id", user.id);

      if (dbError) throw dbError;

      setIsSubscribed(false);

      return true;
    } catch (err: any) {
      console.error("Failed to unsubscribe from push notifications:", err);
      setError(err.message || "Failed to unsubscribe");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    error,
    subscribe,
    unsubscribe,
  };
}
