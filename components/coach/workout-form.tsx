"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface WorkoutFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export function WorkoutForm({
  initialData,
  isEditing = false,
}: WorkoutFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    tier: initialData?.tier || ".223",
    video_url: initialData?.video_url || "",
    scheduled_date:
      initialData?.scheduled_date || new Date().toISOString().split("T")[0],
    sets_reps: initialData?.sets_reps || [{ exercise: "", reps: "" }],
  });

  const handleExerciseChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const newSetsReps = [...formData.sets_reps];
    newSetsReps[index] = { ...newSetsReps[index], [field]: value };
    setFormData({ ...formData, sets_reps: newSetsReps });
  };

  const addExercise = () => {
    setFormData({
      ...formData,
      sets_reps: [...formData.sets_reps, { exercise: "", reps: "" }],
    });
  };

  const removeExercise = (index: number) => {
    const newSetsReps = formData.sets_reps.filter(
      (_: any, i: number) => i !== index
    );
    setFormData({ ...formData, sets_reps: newSetsReps });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from("workouts")
          .update(formData)
          .eq("id", initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("workouts").insert([formData]);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Mission ${
          isEditing ? "updated" : "created"
        } successfully.`,
      });

      router.push("/barracks/content/workouts");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Mission Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            className="bg-gunmetal border-steel/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tier">Tier</Label>
          <Select
            value={formData.tier}
            onValueChange={(value) => setFormData({ ...formData, tier: value })}
          >
            <SelectTrigger className="bg-gunmetal border-steel/30">
              <SelectValue placeholder="Select Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=".223">.223 (Recruit)</SelectItem>
              <SelectItem value=".556">.556 (Soldier)</SelectItem>
              <SelectItem value=".762">.762 (Veteran)</SelectItem>
              <SelectItem value=".50 Cal">.50 Cal (Elite)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Briefing / Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="bg-gunmetal border-steel/30 min-h-[100px]"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Scheduled Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.scheduled_date}
            onChange={(e) =>
              setFormData({ ...formData, scheduled_date: e.target.value })
            }
            required
            className="bg-gunmetal border-steel/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="video">Video URL (YouTube)</Label>
          <Input
            id="video"
            value={formData.video_url}
            onChange={(e) =>
              setFormData({ ...formData, video_url: e.target.value })
            }
            placeholder="https://youtube.com/..."
            className="bg-gunmetal border-steel/30"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Exercises</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addExercise}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Exercise
          </Button>
        </div>

        {formData.sets_reps.map((exercise: any, index: number) => (
          <Card key={index} className="bg-gunmetal border-steel/20">
            <CardContent className="p-4 flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label className="text-xs text-steel">Exercise Name</Label>
                <Input
                  value={exercise.exercise}
                  onChange={(e) =>
                    handleExerciseChange(index, "exercise", e.target.value)
                  }
                  placeholder="e.g. Pushups"
                  className="bg-black/20"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label className="text-xs text-steel">Reps / Sets</Label>
                <Input
                  value={exercise.reps}
                  onChange={(e) =>
                    handleExerciseChange(index, "reps", e.target.value)
                  }
                  placeholder="e.g. 3x20"
                  className="bg-black/20"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeExercise(index)}
                className="text-tactical-red hover:text-red-400 hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        type="submit"
        className="w-full bg-tactical-red hover:bg-red-700"
        disabled={loading}
      >
        <Save className="mr-2 h-4 w-4" />{" "}
        {loading ? "Saving..." : "Save Mission"}
      </Button>
    </form>
  );
}
