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
import { Plus, Trash2, Save, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadVideoAsset } from "@/lib/utils/image-upload";

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
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    tier: initialData?.tier || ".556",
    video_url: initialData?.video_url || "",
    scheduled_date:
      initialData?.scheduled_date || new Date().toISOString().split("T")[0],
    sets_reps: initialData?.sets_reps || [{ exercise: "", reps: "" }],
  });
  const hasStoredVideo =
    formData.video_url && formData.video_url.includes("/") && !formData.video_url.startsWith("http");

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
        // Get current user for created_by
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from("workouts").insert([{
          ...formData,
          created_by: user?.id
        }]);
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

  const handleVideoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file",
        description: "Please upload a video file (mp4, webm, ogg).",
        variant: "destructive",
      });
      return;
    }

    setUploadingVideo(true);
    try {
      const ext = file.name.split(".").pop() || "mp4";
      const fileId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2);
      const path = `workouts/${fileId}.${ext}`;
      await uploadVideoAsset(file, path);
      setFormData({ ...formData, video_url: path });
      toast({
        title: "Success",
        description: "Workout video uploaded and linked.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingVideo(false);
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
          <Label htmlFor="video">Video URL (YouTube) or Uploaded Video</Label>
          <Input
            id="video"
            value={formData.video_url}
            onChange={(e) =>
              setFormData({ ...formData, video_url: e.target.value })
            }
            placeholder="YouTube ID or https://youtube.com/..."
            className="bg-gunmetal border-steel/30"
          />
          {hasStoredVideo && (
            <p className="text-xs text-radar-green">
              Linked storage video: {formData.video_url}
            </p>
          )}
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="video/mp4,video/webm,video/ogg"
              onChange={handleVideoUpload}
              disabled={uploadingVideo}
              className="hidden"
              id="workout-video-upload"
            />
            <Label
              htmlFor="workout-video-upload"
              className="flex items-center justify-center px-4 py-2 bg-steel/20 hover:bg-steel/30 text-white rounded-sm cursor-pointer border border-steel/30"
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploadingVideo ? "Uploading..." : "Upload Video File"}
            </Label>
          </div>
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
