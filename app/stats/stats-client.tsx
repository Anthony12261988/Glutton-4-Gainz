"use client";

import {
  ConsistencyChart,
  WeightChart,
  XPChart,
} from "@/components/ui/stats-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Activity, Sparkles } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface StatsClientProps {
  consistencyData: any[];
  weightData: any[];
  xpData: any[];
  userId: string;
}

export default function StatsClient({
  consistencyData,
  weightData,
  xpData,
  userId,
}: StatsClientProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const [weight, setWeight] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(weight);
    if (!value || value <= 0) return;

    setSaving(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const { error } = await supabase.from("body_metrics").upsert(
        {
          user_id: userId,
          weight: value,
          recorded_at: today,
        },
        { onConflict: "user_id, recorded_at" }
      );
      if (error) throw error;

      toast({
        title: "Weight logged",
        description: "Body metrics updated for today.",
      });
      setWeight("");
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message || "Could not save weight.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
            INTEL REPORT
          </h1>
          <p className="text-sm text-muted-text">
            Performance analytics and metrics.
          </p>
        </div>
        <div className="rounded-sm border border-tactical-red bg-tactical-red/10 p-2">
          <BarChart3 className="h-6 w-6 text-tactical-red" />
        </div>
      </div>

      {/* Consistency Chart */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-tactical-red" />
          <h3 className="font-heading text-sm font-bold uppercase text-muted-text">
            MISSION CONSISTENCY
          </h3>
        </div>
        <ConsistencyChart data={consistencyData} />
      </div>

      {/* Weight Chart */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-tactical-red" />
          <h3 className="font-heading text-sm font-bold uppercase text-muted-text">
            BODY METRICS
          </h3>
        </div>
        {weightData.length > 0 ? (
          <WeightChart data={weightData} />
        ) : (
          <Card>
            <CardContent className="flex h-[300px] items-center justify-center text-muted-text">
              No weight data recorded.
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide text-muted-text">
              Log Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddWeight} className="flex gap-2">
              <Input
                type="number"
                placeholder="Weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="1"
                step="0.1"
                className="bg-gunmetal"
                required
              />
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* XP Chart */}
      {xpData.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-tactical-red" />
            <h3 className="font-heading text-sm font-bold uppercase text-muted-text">
              XP PROGRESSION
            </h3>
          </div>
          <XPChart data={xpData} />
        </div>
      )}
    </div>
  );
}
