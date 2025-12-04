"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, Users, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Buddy {
  id: string;
  email: string;
  avatar_url?: string;
  tier: string;
}

interface BuddySystemProps {
  userId: string;
  initialBuddies: any[]; // Using any for now to handle the join structure
}

export function BuddySystem({ userId, initialBuddies }: BuddySystemProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<Buddy[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [buddies, setBuddies] = useState(initialBuddies);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;

    setIsSearching(true);
    try {
      // Search for user by email
      // Note: RLS might restrict seeing other profiles.
      // We might need a specific RPC or policy to allow searching by email if not public.
      // Assuming for now we can read profiles or at least find exact matches.

      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, tier, avatar_url")
        .eq("email", searchEmail)
        .neq("id", userId) // Don't find self
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 is "no rows returned"

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
      const { error } = await supabase.from("buddies").insert({
        user_id: userId,
        buddy_id: buddyId,
        status: "pending",
      });

      if (error) throw error;

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
            <div className="rounded-sm border border-steel bg-gunmetal p-3">
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
          {buddies.length === 0 ? (
            <p className="text-center text-sm text-muted-text">
              No buddies recruited yet.
            </p>
          ) : (
            <div className="space-y-3">
              {buddies.map((relation) => {
                // Determine which profile is the buddy (could be user_id or buddy_id depending on who initiated)
                // Actually, for the list, we should probably fetch both directions or normalize it.
                // For this MVP, let's assume we fetch where user_id = current_user (sent) OR buddy_id = current_user (received)
                // The passed `initialBuddies` should handle this normalization.
                const buddy = relation.buddy_profile; // We'll need to join this in the server fetch
                const isPending = relation.status === "pending";

                return (
                  <div
                    key={relation.id}
                    className="flex items-center justify-between border-b border-steel/20 pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-bold text-high-vis">
                        {buddy?.email || "Unknown Soldier"}
                      </p>
                      <p className="text-xs text-muted-text">
                        {isPending ? "PENDING DEPLOYMENT" : "ACTIVE DUTY"}
                      </p>
                    </div>
                    {isPending && (
                      <div className="rounded-sm bg-yellow-500/20 px-2 py-1 text-[10px] text-yellow-500">
                        WAITING
                      </div>
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
