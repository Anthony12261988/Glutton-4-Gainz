"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Save,
  ArrowLeft,
  Loader2,
  Check,
  MessageSquare,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DailyBriefing {
  id: string;
  content: string;
  active: boolean;
  created_at: string;
}

export function BriefingManagerClient() {
  const [content, setContent] = useState("");
  const [briefings, setBriefings] = useState<DailyBriefing[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  // Fetch existing briefings
  useEffect(() => {
    async function fetchBriefings() {
      try {
        const { data, error } = await supabase
          .from("daily_briefings")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        setBriefings(data || []);
      } catch (err) {
        console.error("Failed to fetch briefings:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBriefings();
  }, [supabase]);

  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: "MESSAGE REQUIRED",
        description: "Enter a briefing message before publishing.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Deactivate all existing briefings first
      const { error: updateError } = await supabase
        .from("daily_briefings")
        .update({ active: false })
        .eq("active", true);

      if (updateError) {
        console.error("Update error:", updateError);
        throw new Error(`Failed to deactivate existing briefings: ${updateError.message}`);
      }

      // Insert new briefing
      const { data, error: insertError } = await supabase
        .from("daily_briefings")
        .insert({
          content: content.trim(),
          active: true,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error(`Failed to create briefing: ${insertError.message}`);
      }

      if (!data) {
        throw new Error("No data returned from insert");
      }

      setBriefings([data, ...briefings.map((b) => ({ ...b, active: false }))]);
      setContent("");

      toast({
        title: "BRIEFING DEPLOYED",
        description: "Your message is now live for all troops.",
      });
    } catch (err: any) {
      console.error("Failed to save briefing:", err);
      const errorMessage = err?.message || err?.toString() || "Unknown error occurred";
      toast({
        title: "DEPLOYMENT FAILED",
        description: errorMessage.length > 100 
          ? `${errorMessage.substring(0, 100)}...` 
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      // Deactivate all
      const { error: updateError } = await supabase
        .from("daily_briefings")
        .update({ active: false })
        .eq("active", true);

      if (updateError) {
        throw new Error(`Failed to deactivate: ${updateError.message}`);
      }

      // Activate selected
      const { error: activateError } = await supabase
        .from("daily_briefings")
        .update({ active: true })
        .eq("id", id);

      if (activateError) {
        throw new Error(`Failed to activate: ${activateError.message}`);
      }

      setBriefings(
        briefings.map((b) => ({
          ...b,
          active: b.id === id,
        }))
      );

      toast({
        title: "BRIEFING ACTIVATED",
        description: "Selected briefing is now live.",
      });
    } catch (err: any) {
      console.error("Failed to activate briefing:", err);
      toast({
        title: "ACTIVATION FAILED",
        description: err?.message || "Unable to activate briefing.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this briefing?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("daily_briefings")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(`Failed to delete: ${error.message}`);
      }

      setBriefings(briefings.filter((b) => b.id !== id));

      toast({
        title: "BRIEFING REMOVED",
        description: "Message deleted from archives.",
      });
    } catch (err: any) {
      console.error("Failed to delete briefing:", err);
      toast({
        title: "DELETION FAILED",
        description: err?.message || "Unable to delete briefing.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 text-white">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Link
          href="/command"
          className="flex items-center text-steel hover:text-white mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Command
        </Link>

        <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis mb-8">
          Daily Briefing
        </h1>

        {/* New Briefing Form */}
        <Card className="bg-gunmetal border-steel/20 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <MessageSquare className="h-5 w-5 text-tactical-red" />
              New Briefing Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-black/20 border-steel/30 min-h-[150px] text-lg"
              placeholder="Enter today's motivational message for your troops..."
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-text">
                {content.length}/500 characters
              </span>
              <Button
                onClick={handleSave}
                className="bg-tactical-red hover:bg-red-700"
                disabled={saving || !content.trim()}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Publish Briefing
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Previous Briefings */}
        <div className="space-y-4">
          <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-steel">
            Recent Briefings
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-steel" />
            </div>
          ) : briefings.length === 0 ? (
            <Card className="border-steel/20 bg-gunmetal">
              <CardContent className="py-8 text-center">
                <MessageSquare className="mx-auto mb-3 h-8 w-8 text-steel" />
                <p className="text-muted-text">
                  No briefings yet. Create your first one above.
                </p>
              </CardContent>
            </Card>
          ) : (
            briefings.map((briefing) => (
              <Card
                key={briefing.id}
                className={`border-steel/20 bg-gunmetal ${
                  briefing.active
                    ? "border-radar-green/50 bg-radar-green/5"
                    : ""
                }`}
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {briefing.active && (
                          <span className="rounded-sm bg-radar-green/20 px-2 py-0.5 text-xs font-bold text-radar-green">
                            ACTIVE
                          </span>
                        )}
                        <span className="text-xs text-muted-text">
                          {new Date(briefing.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-high-vis">
                        {briefing.content}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!briefing.active && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-radar-green/20"
                          onClick={() => handleActivate(briefing.id)}
                          title="Activate"
                        >
                          <Check className="h-4 w-4 text-radar-green" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-tactical-red/20"
                        onClick={() => handleDelete(briefing.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-tactical-red" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
