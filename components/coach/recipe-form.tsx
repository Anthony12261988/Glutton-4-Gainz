"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { uploadImage } from "@/lib/utils/image-upload";
import Image from "next/image";

interface RecipeFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export function RecipeForm({
  initialData,
  isEditing = false,
}: RecipeFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    initialData?.image_url || ""
  );

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    instructions: initialData?.instructions || "",
    calories: initialData?.calories || 0,
    protein: initialData?.protein || 0,
    carbs: initialData?.carbs || 0,
    fat: initialData?.fat || 0,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = initialData?.image_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile, "content_assets", "recipes");
      }

      const recipeData = {
        ...formData,
        image_url: imageUrl,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("recipes")
          .update(recipeData)
          .eq("id", initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("recipes").insert([recipeData]);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Recipe ${
          isEditing ? "updated" : "created"
        } successfully.`,
      });

      router.push("/barracks/content/recipes");
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
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Recipe Title</Label>
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
            <Label>Recipe Image</Label>
            <div className="flex flex-col gap-4">
              <div className="relative h-48 w-full bg-gunmetal border border-steel/30 rounded-sm overflow-hidden flex items-center justify-center">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <ImageIcon className="h-12 w-12 text-steel/50" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <Label
                  htmlFor="image-upload"
                  className="flex items-center justify-center px-4 py-2 bg-steel/20 hover:bg-steel/30 text-white rounded-sm cursor-pointer w-full border border-steel/30"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {previewUrl ? "Change Image" : "Upload Image"}
                </Label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                value={formData.calories}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    calories: parseInt(e.target.value),
                  })
                }
                required
                className="bg-gunmetal border-steel/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                value={formData.protein}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    protein: parseInt(e.target.value),
                  })
                }
                required
                className="bg-gunmetal border-steel/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                value={formData.carbs}
                onChange={(e) =>
                  setFormData({ ...formData, carbs: parseInt(e.target.value) })
                }
                required
                className="bg-gunmetal border-steel/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat">Fat (g)</Label>
              <Input
                id="fat"
                type="number"
                value={formData.fat}
                onChange={(e) =>
                  setFormData({ ...formData, fat: parseInt(e.target.value) })
                }
                required
                className="bg-gunmetal border-steel/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) =>
                setFormData({ ...formData, instructions: e.target.value })
              }
              required
              className="bg-gunmetal border-steel/30 min-h-[200px]"
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-tactical-red hover:bg-red-700"
        disabled={loading}
      >
        <Save className="mr-2 h-4 w-4" />{" "}
        {loading ? "Saving..." : "Save Recipe"}
      </Button>
    </form>
  );
}
