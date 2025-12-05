"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { BuddySearchForm } from "./BuddySearchForm";
import { BuddyList } from "./BuddyList";
import { useToast } from "@/hooks/use-toast";

interface BuddyProfile {
  id: string;
  email: string;
  avatar_url?: string | null;
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
          isIncoming:
            relation.status === "pending" && relation.buddy_id === userId,
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

  const handleSearch = async (email: string): Promise<BuddyProfile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, tier, avatar_url, last_active")
        .eq("email", email)
        .neq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (!data) {
        toast({
          title: "NO INTEL FOUND",
          description: "User not found with that email.",
          variant: "destructive",
        });
        return null;
      }

      return data;
    } catch (error: any) {
      toast({
        title: "SEARCH FAILED",
        description: error.message,
        variant: "destructive",
      });
      return null;
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
        setBuddies((prev) => [...prev, data as any]);
      }

      toast({
        title: "REQUEST SENT",
        description: "Buddy request deployed.",
      });
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

  const handleRemove = async (id: string) => {
    setActingId(id);
    try {
      const { error } = await supabase.from("buddies").delete().eq("id", id);
      if (error) throw error;

      setBuddies((prev) => prev.filter((b) => b.id !== id));
      toast({
        title: "BUDDY REMOVED",
        description: "Squad member dismissed.",
      });
    } catch (error: any) {
      toast({
        title: "REMOVAL FAILED",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <BuddySearchForm onSearch={handleSearch} onAddBuddy={handleAddBuddy} />
      <BuddyList
        relations={normalized}
        actingId={actingId}
        onAccept={handleAccept}
        onWakeUp={handleWakeUp}
        onRemove={handleRemove}
      />
    </div>
  );
}
