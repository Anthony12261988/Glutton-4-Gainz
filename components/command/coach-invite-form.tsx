"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/lib/types/database.types";
import { Loader2, MailPlus } from "lucide-react";

type Invite = Tables<"coach_invites">;

interface CoachInviteFormProps {
  invitedBy: string;
  onInviteCreated?: (invite: Invite) => void;
}

export default function CoachInviteForm({
  invitedBy,
  onInviteCreated,
}: CoachInviteFormProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) return;

    setLoading(true);
    try {
      const response = await fetch("/api/invite-coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: targetEmail,
          invited_by: invitedBy,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send invite.");
      }

      setEmail("");

      if (result.invite) {
        onInviteCreated?.(result.invite);
      }

      toast({
        title: "Draft Notice Sent",
        description: `${targetEmail} has been pinged with orders.`,
      });
    } catch (error: any) {
      console.error("[CoachInvite] Error:", error);
      toast({
        title: "TRANSMISSION FAILED",
        description: error.message || "Unable to send invite.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="text-xs font-bold uppercase tracking-wide text-muted-text">
        Email Address
      </label>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="officer@unit.com"
        required
        className="bg-gunmetal text-high-vis"
      />
      <Button
        type="submit"
        className="w-full"
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Dispatching...
          </>
        ) : (
          <>
            <MailPlus className="h-4 w-4" />
            Commission Officer
          </>
        )}
      </Button>
    </form>
  );
}
