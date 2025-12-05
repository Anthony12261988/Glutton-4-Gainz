"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CoachInviteForm from "@/components/command/coach-invite-form";
import { Sword } from "lucide-react";
import type { Tables } from "@/lib/types/database.types";

type Invite = Tables<"coach_invites">;

interface InviteListProps {
  currentUserId: string;
  pendingInvites: Invite[];
  onInviteCreated: (invite: Invite) => void;
}

function formatTimestamp(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InviteList({
  currentUserId,
  pendingInvites,
  onInviteCreated,
}: InviteListProps) {
  return (
    <div className="space-y-6">
      <Card className="border-steel/40 bg-gradient-to-b from-gunmetal to-camo-black">
        <CardHeader>
          <CardTitle>COMMISSION OFFICER</CardTitle>
          <CardDescription>
            Send classified orders via Resend. Invitees will bypass the Day
            Zero gauntlet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CoachInviteForm
            invitedBy={currentUserId}
            onInviteCreated={onInviteCreated}
          />
        </CardContent>
      </Card>

      <Card className="border-steel/40 bg-gunmetal">
        <CardHeader>
          <CardTitle>PENDING COMMISSIONS</CardTitle>
          <CardDescription>
            Draft notices awaiting acceptance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingInvites.length === 0 && (
            <p className="text-sm text-muted-text">
              No pending invitations. Issue a draft to fill the ranks.
            </p>
          )}
          {pendingInvites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between rounded-sm border border-steel/30 bg-camo-black px-3 py-2"
            >
              <div>
                <p className="font-medium text-high-vis">{invite.email}</p>
                <p className="text-xs text-muted-text">
                  Issued {formatTimestamp(invite.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2 text-radar-green">
                <Sword className="h-4 w-4" />
                Awaiting acceptance
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
