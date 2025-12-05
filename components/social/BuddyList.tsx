"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Loader2, BellOff } from "lucide-react";

interface BuddyProfile {
  id: string;
  email: string;
  avatar_url?: string | null;
  tier: string;
  last_active: string | null;
}

interface NormalizedRelation {
  id: string;
  status: "pending" | "accepted";
  isIncoming: boolean;
  other: BuddyProfile;
}

interface BuddyListProps {
  relations: NormalizedRelation[];
  actingId: string | null;
  onAccept: (id: string) => Promise<void>;
  onWakeUp: (buddy: BuddyProfile, relationId: string) => Promise<void>;
}

export function BuddyList({
  relations,
  actingId,
  onAccept,
  onWakeUp,
}: BuddyListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-tactical-red" />
          MY SQUAD
        </CardTitle>
      </CardHeader>
      <CardContent>
        {relations.length === 0 ? (
          <p className="text-center text-sm text-muted-text">
            No buddies recruited yet.
          </p>
        ) : (
          <div className="space-y-3">
            {relations.map((relation) => {
              const lastActive = relation.other.last_active
                ? new Date(relation.other.last_active).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric" }
                  )
                : "Unknown";
              const isPending = relation.status === "pending";

              return (
                <div
                  key={relation.id}
                  className="flex items-center justify-between border-b border-steel/20 pb-2 last:border-0"
                >
                  <div>
                    <p className="font-bold text-high-vis">
                      {relation.other.email}
                    </p>
                    <p className="text-xs text-muted-text">
                      Tier: {relation.other.tier} • Last active: {lastActive}
                    </p>
                  </div>
                  {isPending ? (
                    relation.isIncoming ? (
                      <Button
                        size="sm"
                        onClick={() => onAccept(relation.id)}
                        disabled={actingId === relation.id}
                      >
                        {actingId === relation.id ? "Accepting..." : "Accept"}
                      </Button>
                    ) : (
                      <div className="rounded-sm bg-yellow-500/20 px-2 py-1 text-[10px] text-yellow-500">
                        WAITING
                      </div>
                    )
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onWakeUp(relation.other, relation.id)}
                      disabled={actingId === relation.id}
                    >
                      {actingId === relation.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <BellOff className="h-4 w-4 mr-2" />
                      )}
                      Wake Up
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
