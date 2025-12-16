"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Volume2, Loader2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface DailyBriefing {
  id: string;
  content: string;
  active: boolean;
  created_at: string;
}

export function MotivationalCorner() {
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function fetchBriefing() {
      try {
        const { data, error } = await supabase
          .from("daily_briefings")
          .select("*")
          .eq("active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Error fetching briefing:", error);
        } else if (data) {
          setBriefing(data);
        }
      } catch (err) {
        console.error("Failed to fetch briefing:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBriefing();

    // Set up real-time subscription for briefing updates
    const channel = supabase
      .channel("daily-briefings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "daily_briefings",
        },
        (payload) => {
          console.log("Briefing change detected:", payload);

          // Refetch the active briefing when any change occurs
          fetchBriefing();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (loading) {
    return (
      <Card className="border-tactical-red/30 bg-gunmetal/80 backdrop-blur-sm">
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-tactical-red" />
            <span className="text-sm text-muted-text">Loading briefing...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show placeholder if no active briefing
  if (!briefing) {
    return (
      <Card className="border-steel/30 bg-gunmetal/80 backdrop-blur-sm">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 rounded-sm border-2 border-steel/30 bg-steel/10 p-3">
              <Sparkles className="h-6 w-6 text-steel" />
            </div>
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-steel">
                  MORNING BRIEFING
                </h3>
                <Volume2 className="h-4 w-4 text-steel/60" />
              </div>
              <p className="text-sm leading-relaxed text-muted-text italic">
                Awaiting command briefing. Check back soon for your daily motivation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-tactical-red/40 bg-gradient-to-br from-gunmetal/95 to-gunmetal/80 backdrop-blur-sm shadow-lg">
      <CardContent className="py-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 rounded-sm border-2 border-tactical-red bg-tactical-red/20 p-3">
            <Sparkles className="h-6 w-6 text-tactical-red" />
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-tactical-red">
                MORNING BRIEFING
              </h3>
              <Volume2 className="h-4 w-4 text-tactical-red/60" />
            </div>
            <p className="text-base leading-relaxed text-high-vis">
              {briefing.content}
            </p>
            <p className="mt-3 text-xs text-muted-text">
              {new Date(briefing.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

