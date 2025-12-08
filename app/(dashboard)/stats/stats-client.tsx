"use client";

import {
  ConsistencyChart,
  WeightChart,
  XPChart,
} from "@/components/ui/stats-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  Activity,
  Sparkles,
  Trash2,
  Edit2,
  Loader2,
  Dumbbell,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BodyMetric {
  id: string;
  recorded_at: string;
  weight: number;
}

interface UserLog {
  id: string;
  date: string;
  duration: number | null;
  notes: string | null;
  workout_id: string | null;
  workout_title: string;
}

interface StatsClientProps {
  consistencyData: any[];
  weightData: any[];
  xpData: any[];
  userId: string;
  rawMetrics: BodyMetric[];
  rawLogs: UserLog[];
}

export default function StatsClient({
  consistencyData,
  weightData,
  xpData,
  userId,
  rawMetrics,
  rawLogs,
}: StatsClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();
  const [weight, setWeight] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [metrics, setMetrics] = useState<BodyMetric[]>(rawMetrics);
  const [editingMetric, setEditingMetric] = useState<BodyMetric | null>(null);
  const [editWeight, setEditWeight] = useState<string>("");
  const [actionId, setActionId] = useState<string | null>(null);

  // Workout log state
  const [logs, setLogs] = useState<UserLog[]>(rawLogs);
  const [editingLog, setEditingLog] = useState<UserLog | null>(null);
  const [editDuration, setEditDuration] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");

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
      router.refresh();
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

  const handleEditMetric = async () => {
    if (!editingMetric) return;
    const value = Number(editWeight);
    if (!value || value <= 0) return;

    setActionId(editingMetric.id);
    try {
      const { error } = await supabase
        .from("body_metrics")
        .update({ weight: value })
        .eq("id", editingMetric.id);

      if (error) throw error;

      setMetrics((prev) =>
        prev.map((m) =>
          m.id === editingMetric.id ? { ...m, weight: value } : m
        )
      );
      toast({
        title: "Weight updated",
        description: "Body metric has been modified.",
      });
      setEditingMetric(null);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteMetric = async (id: string) => {
    setActionId(id);
    try {
      const { error } = await supabase
        .from("body_metrics")
        .delete()
        .eq("id", id);
      if (error) throw error;

      setMetrics((prev) => prev.filter((m) => m.id !== id));
      toast({
        title: "Weight entry deleted",
        description: "Body metric has been removed.",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionId(null);
    }
  };

  // User log handlers
  const handleEditLog = async () => {
    if (!editingLog) return;

    setActionId(editingLog.id);
    try {
      const updateData: { duration?: number; notes?: string } = {};
      if (editDuration) updateData.duration = Number(editDuration);
      if (editNotes !== undefined) updateData.notes = editNotes;

      const { error } = await supabase
        .from("user_logs")
        .update(updateData)
        .eq("id", editingLog.id);

      if (error) throw error;

      setLogs((prev) =>
        prev.map((l) =>
          l.id === editingLog.id
            ? {
                ...l,
                duration: Number(editDuration) || l.duration,
                notes: editNotes,
              }
            : l
        )
      );
      toast({
        title: "Log updated",
        description: "Workout log has been modified.",
      });
      setEditingLog(null);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteLog = async (id: string) => {
    setActionId(id);
    try {
      const { error } = await supabase.from("user_logs").delete().eq("id", id);
      if (error) throw error;

      setLogs((prev) => prev.filter((l) => l.id !== id));
      toast({
        title: "Log deleted",
        description: "Workout log has been removed.",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-8 pb-20 md:pb-8">
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

        {/* Weight History */}
        {metrics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wide text-muted-text">
                Weight History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[200px] sm:max-h-[250px] md:max-h-[300px] overflow-y-auto">
                {[...metrics].reverse().map((metric) => (
                  <div
                    key={metric.id}
                    className="flex items-center justify-between border-b border-steel/20 pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-bold text-high-vis">
                        {metric.weight} lbs
                      </p>
                      <p className="text-xs text-muted-text">
                        {new Date(metric.recorded_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingMetric(metric);
                          setEditWeight(metric.weight.toString());
                        }}
                        disabled={actionId === metric.id}
                        className="h-8 w-8 p-0"
                      >
                        {actionId === metric.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Edit2 className="h-4 w-4 text-steel" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMetric(metric.id)}
                        disabled={actionId === metric.id}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        {actionId === metric.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Weight Dialog */}
      <Dialog
        open={!!editingMetric}
        onOpenChange={() => setEditingMetric(null)}
      >
        <DialogContent className="bg-gunmetal border-steel/20">
          <DialogHeader>
            <DialogTitle className="text-high-vis">
              Edit Weight Entry
            </DialogTitle>
            <DialogDescription className="text-steel">
              Update weight for{" "}
              {editingMetric &&
                new Date(editingMetric.recorded_at).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              placeholder="Weight"
              value={editWeight}
              onChange={(e) => setEditWeight(e.target.value)}
              min="1"
              step="0.1"
              className="bg-camo-black"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMetric(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditMetric} disabled={!!actionId}>
              {actionId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Workout History */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-tactical-red" />
          <h3 className="font-heading text-sm font-bold uppercase text-muted-text">
            MISSION HISTORY
          </h3>
        </div>
        {logs.length > 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2 max-h-[300px] sm:max-h-[350px] md:max-h-[400px] overflow-y-auto">
                {[...logs].reverse().map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between border-b border-steel/20 pb-2 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-high-vis">
                        {log.workout_title}
                      </p>
                      <div className="flex gap-4 text-xs text-muted-text">
                        <span>
                          {new Date(log.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {log.duration && <span>{log.duration} min</span>}
                      </div>
                      {log.notes && (
                        <p className="text-xs text-steel mt-1 truncate max-w-[150px] sm:max-w-[250px] md:max-w-[300px]">
                          {log.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingLog(log);
                          setEditDuration(log.duration?.toString() || "");
                          setEditNotes(log.notes || "");
                        }}
                        disabled={actionId === log.id}
                        className="h-8 w-8 p-0"
                      >
                        {actionId === log.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Edit2 className="h-4 w-4 text-steel" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteLog(log.id)}
                        disabled={actionId === log.id}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        {actionId === log.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex h-[100px] items-center justify-center text-muted-text">
              No workout logs recorded yet.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Log Dialog */}
      <Dialog open={!!editingLog} onOpenChange={() => setEditingLog(null)}>
        <DialogContent className="bg-gunmetal border-steel/20">
          <DialogHeader>
            <DialogTitle className="text-high-vis">
              Edit Workout Log
            </DialogTitle>
            <DialogDescription className="text-steel">
              Update log for {editingLog?.workout_title} on{" "}
              {editingLog &&
                new Date(editingLog.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-muted-text">
                Duration (minutes)
              </label>
              <Input
                type="number"
                placeholder="Duration"
                value={editDuration}
                onChange={(e) => setEditDuration(e.target.value)}
                min="1"
                className="bg-camo-black mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-muted-text">Notes</label>
              <Textarea
                placeholder="Notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="bg-camo-black mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLog(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditLog} disabled={!!actionId}>
              {actionId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
