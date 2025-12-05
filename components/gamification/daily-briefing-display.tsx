"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Volume2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface DailyBriefing {
  id: string;
  content: string;
  active: boolean;
  created_at: string;
}

export function DailyBriefingDisplay() {
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

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

        if (!error && data) {
          setBriefing(data);
        }
      } catch (err) {
        console.error("Failed to fetch briefing:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBriefing();
  }, [supabase]);

  if (loading) {
    return (
      <Card className="border-steel/20 bg-gunmetal">
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-steel" />
            <span className="text-sm text-muted-text">Loading briefing...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!briefing) {
    return null; // No active briefing, don't show anything
  }

  return (
    <Card className="border-radar-green/30 bg-radar-green/5">
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <div className="rounded-sm border border-radar-green bg-radar-green/10 p-2">
            <MessageSquare className="h-5 w-5 text-radar-green" />
          </div>
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-radar-green">
                Commander's Briefing
              </h3>
              <Volume2 className="h-3 w-3 text-radar-green/60" />
            </div>
            <p className="text-sm leading-relaxed text-high-vis">
              {briefing.content}
            </p>
            <p className="mt-2 text-xs text-muted-text">
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
