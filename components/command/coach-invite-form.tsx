"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
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
  const supabase = createClient();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) return;

    setLoading(true);
    try {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("email", targetEmail)
        .maybeSingle();

      if (existingProfile) {
        toast({
          title: "ALREADY ENLISTED",
          description: "That recruit is already in the ranks.",
          variant: "destructive",
        });
        return;
      }

      const { data: existingInvite } = await supabase
        .from("coach_invites")
        .select("*")
        .eq("email", targetEmail)
        .maybeSingle();

      if (existingInvite?.status === "accepted") {
        toast({
          title: "COMMISSION ACCEPTED",
          description: "This officer already accepted their orders.",
        });
        return;
      }

      let inviteRecord = existingInvite ?? null;

      if (!inviteRecord) {
        const { data, error } = await supabase
          .from("coach_invites")
          .insert({
            email: targetEmail,
            status: "pending",
            invited_by: invitedBy,
          })
          .select("*")
          .single();

        if (error) throw error;
        inviteRecord = data;
      } else if (inviteRecord.invited_by !== invitedBy) {
        const { data } = await supabase
          .from("coach_invites")
          .update({ invited_by: invitedBy })
          .eq("id", inviteRecord.id)
          .select("*")
          .single();

        inviteRecord = data ?? inviteRecord;
      }

      const inviteToken = inviteRecord?.token ?? inviteRecord?.id;
      if (!inviteToken) {
        throw new Error("Invite token missing for this record.");
      }

      const response = await fetch("/api/invite-coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: targetEmail,
          invite_token: inviteToken,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Failed to dispatch invite.");
      }

      setEmail("");
      if (inviteRecord) {
        onInviteCreated?.(inviteRecord);
      }

      toast({
        title: "Draft Notice Sent",
        description: `${targetEmail} has been pinged with orders.`,
      });
    } catch (error: any) {
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
