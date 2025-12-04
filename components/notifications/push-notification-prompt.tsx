"use client";

import { useState } from "react";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, BellOff, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Component to prompt users to enable push notifications
 */
export function PushNotificationPrompt() {
  const [dismissed, setDismissed] = useState(false);
  const { toast } = useToast();
  const {
    isSupported,
    permission,
    isSubscribed,
    loading,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  // Don't show if not supported, already subscribed, or dismissed
  if (!isSupported || isSubscribed || dismissed || permission === "denied") {
    return null;
  }

  const handleEnable = async () => {
    const success = await subscribe();
    if (success) {
      toast({
        title: "NOTIFICATIONS ENABLED",
        description: "You'll receive alerts for messages, badges, and reminders.",
      });
    } else {
      toast({
        title: "NOTIFICATION SETUP FAILED",
        description: error || "Could not enable notifications. Try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Store dismissal in localStorage
    localStorage.setItem("push-notification-prompt-dismissed", "true");
  };

  return (
    <Card className="border-tactical-red/20 bg-tactical-red/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-tactical-red" />
            <CardTitle className="text-base">Enable Notifications</CardTitle>
          </div>
          <button
            onClick={handleDismiss}
            className="text-steel/60 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <CardDescription>
          Get notified about new messages, badge achievements, and workout reminders
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button
            onClick={handleEnable}
            disabled={loading}
            className="flex-1 bg-tactical-red hover:bg-red-700"
          >
            {loading ? "Enabling..." : "Enable Notifications"}
          </Button>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            className="flex-1"
          >
            Maybe Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Toggle component for notification settings
 */
export function PushNotificationToggle() {
  const { toast } = useToast();
  const {
    isSupported,
    permission,
    isSubscribed,
    loading,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="text-sm text-steel/60">
        Push notifications are not supported in this browser
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="text-sm text-steel/60">
        Notifications are blocked. Please enable them in your browser settings.
      </div>
    );
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      const success = await unsubscribe();
      if (success) {
        toast({
          title: "NOTIFICATIONS DISABLED",
          description: "You won't receive push notifications anymore.",
        });
      }
    } else {
      const success = await subscribe();
      if (success) {
        toast({
          title: "NOTIFICATIONS ENABLED",
          description: "You'll receive alerts for messages, badges, and reminders.",
        });
      } else {
        toast({
          title: "NOTIFICATION SETUP FAILED",
          description: error || "Could not enable notifications.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-white">Push Notifications</p>
        <p className="text-xs text-steel/60">
          {isSubscribed
            ? "Receive alerts for messages, badges, and reminders"
            : "Enable to stay updated on your progress"}
        </p>
      </div>

      <Button
        onClick={handleToggle}
        disabled={loading}
        variant={isSubscribed ? "outline" : "default"}
        size="sm"
        className={isSubscribed ? "border-tactical-red text-tactical-red" : "bg-tactical-red"}
      >
        {loading ? (
          "Processing..."
        ) : isSubscribed ? (
          <>
            <BellOff className="h-4 w-4 mr-2" />
            Disable
          </>
        ) : (
          <>
            <Bell className="h-4 w-4 mr-2" />
            Enable
          </>
        )}
      </Button>
    </div>
  );
}
