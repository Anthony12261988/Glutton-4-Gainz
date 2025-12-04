"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  UserPlus,
  Users,
  Check,
  Loader2,
  BellOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BuddyProfile {
  id: string;
  email: string;
  avatar_url?: string;
  tier: string;
  last_active: string | null;
}

interface BuddyRelation {
  id: string;
  status: "pending" | "accepted";
  user_id: string;
  buddy_id: string;
  user_profile?: BuddyProfile | null;
  buddy_profile?: BuddyProfile | null;
}

interface BuddySystemProps {
  userId: string;
  initialBuddies: BuddyRelation[];
}

export function BuddySystem({ userId, initialBuddies }: BuddySystemProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<BuddyProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [buddies, setBuddies] = useState(initialBuddies);
  const [actingId, setActingId] = useState<string | null>(null);

  const normalized = useMemo(() => {
    return buddies
      .map((relation) => {
        const other =
          relation.user_id === userId
            ? relation.buddy_profile
            : relation.user_profile;
        if (!other) return null;
        return {
          id: relation.id,
          status: relation.status,
          isIncoming: relation.status === "pending" && relation.buddy_id === userId,
          other,
        };
      })
      .filter(Boolean) as {
      id: string;
      status: "pending" | "accepted";
      isIncoming: boolean;
      other: BuddyProfile;
    }[];
  }, [buddies, userId]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, tier, avatar_url, last_active")
        .eq("email", searchEmail)
        .neq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setSearchResults([data]);
      } else {
        setSearchResults([]);
        toast({
          title: "NO INTEL FOUND",
          description: "User not found with that email.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "SEARCH FAILED",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddBuddy = async (buddyId: string) => {
    try {
      const { error, data } = await supabase
        .from("buddies")
        .insert({
          user_id: userId,
          buddy_id: buddyId,
          status: "pending",
        })
        .select(
          `
          id,
          status,
          user_id,
          buddy_id,
          user_profile:profiles!user_id(*),
          buddy_profile:profiles!buddy_id(*)
        `
        )
        .single();

      if (error) throw error;

      if (data) {
        setBuddies((prev) => [...prev, data]);
      }

      toast({
        title: "REQUEST SENT",
        description: "Buddy request deployed.",
      });
      setSearchResults([]);
      setSearchEmail("");
    } catch (error: any) {
      toast({
        title: "DEPLOYMENT FAILED",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAccept = async (id: string) => {
    setActingId(id);
    try {
      const { error } = await supabase
        .from("buddies")
        .update({ status: "accepted" })
        .eq("id", id);
      if (error) throw error;
      setBuddies((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "accepted" } : b))
      );
      toast({
        title: "BUDDY CONFIRMED",
        description: "Request accepted.",
      });
    } catch (error: any) {
      toast({
        title: "ACTION FAILED",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActingId(null);
    }
  };

  const handleWakeUp = async (buddy: BuddyProfile, relationId: string) => {
    setActingId(relationId);
    try {
      // Optional: check inactivity > 24h
      if (buddy.last_active) {
        const hours =
          (Date.now() - new Date(buddy.last_active).getTime()) / 36e5;
        if (hours < 24) {
          toast({
            title: "Buddy active recently",
            description: "They were active within the last 24h.",
          });
          setActingId(null);
          return;
        }
      }

      const { error } = await supabase.from("messages").insert({
        sender_id: userId,
        receiver_id: buddy.id,
        content: "WAKE UP! Your squad is waiting.",
      });
      if (error) throw error;

      toast({
        title: "NUDGE SENT",
        description: "Wake up alert delivered.",
      });
    } catch (error: any) {
      toast({
        title: "NUDGE FAILED",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-tactical-red" />
            RECRUIT BUDDY
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Enter email address..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="bg-gunmetal"
            />
            <Button type="submit" disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </form>

          {searchResults.length > 0 && (
            <div className="rounded-sm border border-steel bg-gunmetal p-3 space-y-3">
              {searchResults.map((buddy) => (
                <div
                  key={buddy.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-high-vis">{buddy.email}</p>
                    <p className="text-xs text-tactical-red">
                      Tier: {buddy.tier}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => handleAddBuddy(buddy.id)}>
                    ADD
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-tactical-red" />
            MY SQUAD
          </CardTitle>
        </CardHeader>
        <CardContent>
          {normalized.length === 0 ? (
            <p className="text-center text-sm text-muted-text">
              No buddies recruited yet.
            </p>
          ) : (
            <div className="space-y-3">
              {normalized.map((relation) => {
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
                          onClick={() => handleAccept(relation.id)}
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
                        onClick={() => handleWakeUp(relation.other, relation.id)}
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
    </div>
  );
}
