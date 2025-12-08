"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Trophy,
  Plus,
  Dumbbell,
  Timer,
  Hash,
  Edit,
  Trash2,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface PersonalRecord {
  id: string;
  user_id: string;
  exercise_name: string;
  record_type: "weight" | "reps" | "time";
  value: number;
  unit: string;
  notes: string | null;
  achieved_at: string;
  created_at: string;
  updated_at: string;
}

interface PRClientProps {
  records: PersonalRecord[];
  userId: string;
}

const RECORD_TYPES = [
  { value: "weight", label: "Weight", icon: Dumbbell, defaultUnit: "lbs" },
  { value: "reps", label: "Reps", icon: Hash, defaultUnit: "reps" },
  { value: "time", label: "Time", icon: Timer, defaultUnit: "seconds" },
];

const COMMON_EXERCISES = [
  "Bench Press",
  "Squat",
  "Deadlift",
  "Overhead Press",
  "Barbell Row",
  "Pull-ups",
  "Push-ups",
  "Plank Hold",
  "Mile Run",
  "5K Run",
];

function getRecordIcon(type: string) {
  switch (type) {
    case "weight":
      return <Dumbbell className="h-4 w-4" />;
    case "reps":
      return <Hash className="h-4 w-4" />;
    case "time":
      return <Timer className="h-4 w-4" />;
    default:
      return <Trophy className="h-4 w-4" />;
  }
}

export function PRClient({ records: initialRecords, userId }: PRClientProps) {
  const [records, setRecords] = useState(initialRecords);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PersonalRecord | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Form state
  const [exerciseName, setExerciseName] = useState("");
  const [recordType, setRecordType] = useState<"weight" | "reps" | "time">(
    "weight"
  );
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("lbs");
  const [notes, setNotes] = useState("");
  const [achievedAt, setAchievedAt] = useState(
    new Date().toISOString().split("T")[0]
  );

  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  // Group records by exercise
  const groupedRecords = useMemo(() => {
    const groups: Record<string, PersonalRecord[]> = {};
    records.forEach((record) => {
      if (!groups[record.exercise_name]) {
        groups[record.exercise_name] = [];
      }
      groups[record.exercise_name].push(record);
    });
    // Sort each group by value descending (best first)
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => b.value - a.value);
    });
    return groups;
  }, [records]);

  const resetForm = () => {
    setExerciseName("");
    setRecordType("weight");
    setValue("");
    setUnit("lbs");
    setNotes("");
    setAchievedAt(new Date().toISOString().split("T")[0]);
    setEditingRecord(null);
  };

  const handleSubmit = async () => {
    if (!exerciseName.trim() || !value) {
      toast({
        title: "INCOMPLETE DATA",
        description: "Exercise name and value are required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (editingRecord) {
        // Update existing
        const { data, error } = await supabase
          .from("personal_records")
          .update({
            exercise_name: exerciseName.trim(),
            record_type: recordType,
            value: parseFloat(value),
            unit,
            notes: notes.trim() || null,
            achieved_at: achievedAt,
          })
          .eq("id", editingRecord.id)
          .select()
          .single();

        if (error) throw error;

        setRecords(records.map((r) => (r.id === editingRecord.id ? data : r)));
        toast({
          title: "RECORD UPDATED",
          description: "Personal record synchronized.",
        });
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("personal_records")
          .insert({
            user_id: userId,
            exercise_name: exerciseName.trim(),
            record_type: recordType,
            value: parseFloat(value),
            unit,
            notes: notes.trim() || null,
            achieved_at: achievedAt,
          })
          .select()
          .single();

        if (error) throw error;

        setRecords([data, ...records]);
        toast({
          title: "NEW PR LOGGED!",
          description: `${exerciseName}: ${value} ${unit}`,
        });
      }

      resetForm();
      setShowAddDialog(false);
    } catch (err) {
      console.error("Failed to save record:", err);
      toast({
        title: "SAVE FAILED",
        description: "Unable to save record. Retry operation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: PersonalRecord) => {
    setEditingRecord(record);
    setExerciseName(record.exercise_name);
    setRecordType(record.record_type);
    setValue(record.value.toString());
    setUnit(record.unit);
    setNotes(record.notes || "");
    setAchievedAt(record.achieved_at);
    setShowAddDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("personal_records")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setRecords(records.filter((r) => r.id !== id));
      toast({
        title: "RECORD REMOVED",
        description: "Personal record deleted.",
      });
    } catch (err) {
      console.error("Failed to delete record:", err);
      toast({
        title: "DELETE FAILED",
        description: "Unable to remove record.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
            PERSONAL RECORDS
          </h1>
          <p className="text-sm text-muted-text">
            Track your best performances
          </p>
        </div>
        <Dialog
          open={showAddDialog}
          onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-tactical-red hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              Log PR
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gunmetal border-steel/30">
            <DialogHeader>
              <DialogTitle className="text-high-vis">
                {editingRecord ? "Edit Record" : "New Personal Record"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Exercise Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-steel">
                  Exercise
                </label>
                <Input
                  placeholder="e.g., Bench Press"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  list="exercises"
                  className="bg-black/20 border-steel/30"
                />
                <datalist id="exercises">
                  {COMMON_EXERCISES.map((ex) => (
                    <option key={ex} value={ex} />
                  ))}
                </datalist>
              </div>

              {/* Record Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-steel">Type</label>
                <div className="flex gap-2">
                  {RECORD_TYPES.map((type) => (
                    <Button
                      key={type.value}
                      type="button"
                      variant={
                        recordType === type.value ? "default" : "outline"
                      }
                      className={
                        recordType === type.value
                          ? "bg-tactical-red"
                          : "border-steel/30"
                      }
                      onClick={() => {
                        setRecordType(type.value as any);
                        setUnit(type.defaultUnit);
                      }}
                    >
                      <type.icon className="mr-1 h-4 w-4" />
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Value and Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-steel">
                    Value
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="bg-black/20 border-steel/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-steel">Unit</label>
                  <Input
                    placeholder="lbs"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="bg-black/20 border-steel/30"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-steel">
                  Date Achieved
                </label>
                <Input
                  type="date"
                  value={achievedAt}
                  onChange={(e) => setAchievedAt(e.target.value)}
                  className="bg-black/20 border-steel/30"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-steel">
                  Notes (optional)
                </label>
                <Input
                  placeholder="Any details about this PR..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-black/20 border-steel/30"
                />
              </div>

              <Button
                className="w-full bg-tactical-red hover:bg-red-700"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trophy className="mr-2 h-4 w-4" />
                )}
                {editingRecord ? "Update Record" : "Save PR"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Summary */}
      {records.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-steel/20 bg-gunmetal">
            <CardContent className="py-4 text-center">
              <p className="text-xs text-muted-text">TOTAL PRs</p>
              <p className="font-heading text-2xl font-bold text-high-vis">
                {records.length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-steel/20 bg-gunmetal">
            <CardContent className="py-4 text-center">
              <p className="text-xs text-muted-text">EXERCISES</p>
              <p className="font-heading text-2xl font-bold text-tactical-red">
                {Object.keys(groupedRecords).length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-steel/20 bg-gunmetal">
            <CardContent className="py-4 text-center">
              <p className="text-xs text-muted-text">THIS MONTH</p>
              <p className="font-heading text-2xl font-bold text-radar-green">
                {
                  records.filter((r) => {
                    const achieved = new Date(r.achieved_at);
                    const now = new Date();
                    return (
                      achieved.getMonth() === now.getMonth() &&
                      achieved.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Records by Exercise */}
      {Object.keys(groupedRecords).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedRecords).map(([exercise, exerciseRecords]) => {
            const bestRecord = exerciseRecords[0]; // Already sorted by value

            return (
              <Card key={exercise} className="border-steel/20 bg-gunmetal">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                      {getRecordIcon(bestRecord.record_type)}
                      {exercise}
                    </div>
                    <div className="flex items-center gap-1 text-tactical-red">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-heading text-xl">
                        {bestRecord.value} {bestRecord.unit}
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {exerciseRecords.map((record, idx) => (
                      <div
                        key={record.id}
                        className={`flex items-center justify-between rounded-sm p-2 ${
                          idx === 0 ? "bg-tactical-red/10" : "bg-black/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-heading font-bold ${
                              idx === 0 ? "text-tactical-red" : "text-steel"
                            }`}
                          >
                            #{idx + 1}
                          </span>
                          <div>
                            <p className="font-medium text-high-vis">
                              {record.value} {record.unit}
                            </p>
                            <p className="text-xs text-muted-text">
                              {new Date(
                                record.achieved_at
                              ).toLocaleDateString()}
                              {record.notes && ` • ${record.notes}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-steel/20"
                            onClick={() => handleEdit(record)}
                          >
                            <Edit className="h-4 w-4 text-steel" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-tactical-red/20"
                            onClick={() => handleDelete(record.id)}
                          >
                            <Trash2 className="h-4 w-4 text-tactical-red" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-steel/20 bg-gunmetal">
          <CardContent className="py-12 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-steel" />
            <h3 className="font-heading text-xl text-high-vis mb-2">
              NO RECORDS YET
            </h3>
            <p className="text-muted-text mb-4">
              Start logging your personal records to track progress
            </p>
            <Button
              className="bg-tactical-red hover:bg-red-700"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Log Your First PR
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
