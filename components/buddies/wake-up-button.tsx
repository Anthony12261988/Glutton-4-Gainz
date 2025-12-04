"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface WakeUpButtonProps {
  buddyId: string;
  buddyName: string;
  lastActiveDate?: string | null;
  disabled?: boolean;
}

/**
 * Button to send a wake-up nudge to an inactive buddy
 * Creates a message encouraging them to get back to training
 */
export function WakeUpButton({
  buddyId,
  buddyName,
  lastActiveDate,
  disabled = false,
}: WakeUpButtonProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleWakeUp = async () => {
    setLoading(true);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get current user's profile for name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const senderName = profile?.full_name || "Your buddy";

      // Calculate days inactive
      let daysInactive = 0;
      if (lastActiveDate) {
        const lastActive = new Date(lastActiveDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastActive.getTime());
        daysInactive = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      // Create motivational message
      const messages = [
        `${senderName} is checking in! It's been ${daysInactive} days since your last mission. Time to get back in the fight, soldier!`,
        `WAKE-UP CALL from ${senderName}! Your training is waiting. Let's get moving!`,
        `${senderName} sent a tactical nudge: ${daysInactive} days MIA is enough. Report back to base!`,
        `Hey ${buddyName}! ${senderName} wants to see you back in action. Don't let the team down!`,
        `${senderName} is rallying the troops! We need you back at ${daysInactive} days and counting. Time to complete the mission!`,
      ];

      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      // Send message to buddy
      const { error: messageError } = await supabase.from("messages").insert({
        from_user_id: user.id,
        to_user_id: buddyId,
        content: randomMessage,
      });

      if (messageError) throw messageError;

      setSent(true);
      toast({
        title: "WAKE-UP CALL SENT",
        description: `${buddyName} has been notified. Let's get them back!`,
      });

      // Reset after 30 seconds
      setTimeout(() => setSent(false), 30000);
    } catch (error: any) {
      toast({
        title: "NUDGE FAILED",
        description: error.message || "Could not send wake-up call.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="border-radar-green text-radar-green"
      >
        <Bell className="h-4 w-4 mr-2" />
        Sent!
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleWakeUp}
      disabled={loading || disabled}
      className="border-tactical-red text-tactical-red hover:bg-tactical-red hover:text-white"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Bell className="h-4 w-4 mr-2" />
          Wake Up
        </>
      )}
    </Button>
  );
}
