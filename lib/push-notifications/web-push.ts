/**
 * Web Push Notification utilities
 * Uses the Web Push API for browser notifications
 */

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Check if push notifications are supported in the browser
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isPushSupported()) return "denied";
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    throw new Error("Push notifications are not supported in this browser");
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Subscribe to push notifications
 * Returns the push subscription data to store in database
 */
export async function subscribeToPush(
  vapidPublicKey: string
): Promise<PushSubscriptionData> {
  if (!isPushSupported()) {
    throw new Error("Push notifications are not supported");
  }

  // Check permission
  const permission = await requestNotificationPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission denied");
  }

  // Get service worker registration
  const registration = await navigator.serviceWorker.ready;

  // Subscribe to push
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  // Convert subscription to JSON
  const subscriptionJSON = subscription.toJSON();

  if (!subscriptionJSON.endpoint || !subscriptionJSON.keys) {
    throw new Error("Invalid subscription data");
  }

  return {
    endpoint: subscriptionJSON.endpoint,
    keys: {
      p256dh: subscriptionJSON.keys.p256dh,
      auth: subscriptionJSON.keys.auth,
    },
  };
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    return await subscription.unsubscribe();
  }

  return false;
}

/**
 * Get existing push subscription
 */
export async function getExistingSubscription(): Promise<PushSubscriptionData | null> {
  if (!isPushSupported()) {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    return null;
  }

  const subscriptionJSON = subscription.toJSON();

  if (!subscriptionJSON.endpoint || !subscriptionJSON.keys) {
    return null;
  }

  return {
    endpoint: subscriptionJSON.endpoint,
    keys: {
      p256dh: subscriptionJSON.keys.p256dh,
      auth: subscriptionJSON.keys.auth,
    },
  };
}

/**
 * Show a local notification (doesn't require server)
 * Useful for testing or immediate feedback
 */
export async function showLocalNotification(
  title: string,
  options: NotificationOptions = {}
): Promise<void> {
  if (!isPushSupported()) {
    throw new Error("Notifications are not supported");
  }

  const permission = getNotificationPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission not granted");
  }

  const registration = await navigator.serviceWorker.ready;

  await registration.showNotification(title, {
    badge: "/icons/icon-96x96.png",
    icon: "/icons/icon-192x192.png",
    ...options,
  });
}

/**
 * Convert VAPID public key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
