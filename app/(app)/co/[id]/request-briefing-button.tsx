"use client";

import { useUser } from "@/hooks/use-user";
import { Lock, MessageSquare } from "lucide-react";
import Link from "next/link";

interface RequestBriefingButtonProps {
  coachId: string;
}

export function RequestBriefingButton({
  coachId,
}: RequestBriefingButtonProps) {
  const { user, loading } = useUser();

  if (loading) return null;

  if (!user) {
    return (
      <Link
        href={`/login?redirect=${encodeURIComponent(`/formation?dm=${coachId}`)}`}
        className="inline-flex items-center gap-2 rounded-sm border border-tactical-red/40 bg-tactical-red/10 px-4 py-2 text-sm font-heading font-bold uppercase tracking-wide text-tactical-red hover:bg-tactical-red/20 transition-colors shrink-0"
      >
        <Lock className="h-4 w-4" />
        Authenticate to Request Briefing
      </Link>
    );
  }

  // Don't show if viewer is the CO themselves
  if (user.id === coachId) return null;

  return (
    <Link
      href={`/formation?dm=${coachId}`}
      className="inline-flex items-center gap-2 rounded-sm bg-tactical-red px-4 py-2 text-sm font-heading font-bold uppercase tracking-wide text-white hover:bg-red-700 transition-colors shrink-0"
    >
      <MessageSquare className="h-4 w-4" />
      Request Briefing
    </Link>
  );
}
