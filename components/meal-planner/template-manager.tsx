"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getMealTemplates,
  createMealTemplate,
  applyTemplate,
} from "@/lib/queries/meal-planner-enhanced";
import { getMealPlansForWeek } from "@/lib/queries/meal-plans";
import { Plus, Calendar, Trash2, Eye, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  user_id: string | null;
  name: string;
  description: string;
  is_public: boolean;
  created_at: string;
  meals: TemplateMeal[];
}

interface TemplateMeal {
  id: string;
  template_id: string;
  recipe_id: string;
  day_offset: number;
  meal_number: number;
  recipe: {
    id: string;
    title: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

interface TemplateManagerProps {
  userId: string;
  onApplied?: () => void;
}

const MEAL_SLOT_NAMES: { [key: number]: string } = {
  1: "Breakfast",
  2: "Snack 1",
  3: "Lunch",
  4: "Snack 2",
  5: "Dinner",
  6: "Snack 3",
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function TemplateManager({ userId, onApplied }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [applyTemplateId, setApplyTemplateId] = useState<string | null>(null);
  const [applyStartDate, setApplyStartDate] = useState("");

  // Create template form state
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, [userId]);

  async function loadTemplates() {
    setLoading(true);
    const { data, error } = await getMealTemplates(userId);

    if (error) {
      console.error("Error loading templates:", error);
      toast({
        variant: "destructive",
        title: "Error loading templates",
        description: error.message,
      });
    }

    setTemplates((data as Template[]) || []);
    setLoading(false);
  }

  async function handleCreateFromWeek() {
    if (!templateName.trim()) {
      toast({
        variant: "destructive",
        title: "Template name required",
        description: "Please enter a name for your template",
      });
      return;
    }

    setCreating(true);

    // Get current week's meals
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    const weekStartStr = weekStart.toISOString().split("T")[0];

    const { data: mealPlans, error: mealError } = await getMealPlansForWeek(userId, weekStartStr);

    if (mealError) {
      toast({
        variant: "destructive",
        title: "Error fetching meals",
        description: mealError.message,
      });
      setCreating(false);
      return;
    }

    if (!mealPlans || mealPlans.length === 0) {
      toast({
        variant: "destructive",
        title: "No meals found",
        description: "Add some meals to your current week before creating a template",
      });
      setCreating(false);
      return;
    }

    // Convert meal plans to template meals
    const templateMeals = mealPlans.map((mp: any) => {
      const assignedDate = new Date(mp.assigned_date);
      const dayOffset = Math.floor(
        (assignedDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        recipeId: mp.recipe_id,
        dayOffset,
        mealNumber: mp.meal_number,
      };
    });

    const { data, error } = await createMealTemplate(
      userId,
      templateName,
      templateDescription,
      isPublic,
      templateMeals
    );

    if (error) {
      toast({
        variant: "destructive",
        title: "Error creating template",
        description: error.message,
      });
      setCreating(false);
      return;
    }

    toast({
      title: "Template created",
      description: `"${templateName}" has been saved`,
    });

    // Reset form and reload templates
    setTemplateName("");
    setTemplateDescription("");
    setIsPublic(false);
    setCreateDialogOpen(false);
    setCreating(false);
    await loadTemplates();
  }

  async function handleApplyTemplate() {
    if (!applyTemplateId || !applyStartDate) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select a template and start date",
      });
      return;
    }

    const { error } = await applyTemplate(userId, applyTemplateId, applyStartDate);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error applying template",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Template applied",
      description: "Meals have been added to your calendar",
    });

    setApplyTemplateId(null);
    setApplyStartDate("");
    if (onApplied) onApplied();
  }

  function getTemplateMacroSummary(template: Template) {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let daysCount = 0;

    // Get unique days
    const uniqueDays = new Set(template.meals.map((m) => m.day_offset));
    daysCount = uniqueDays.size;

    template.meals.forEach((meal) => {
      totalCalories += meal.recipe.calories || 0;
      totalProtein += meal.recipe.protein || 0;
      totalCarbs += meal.recipe.carbs || 0;
      totalFat += meal.recipe.fat || 0;
    });

    const avgCalories = daysCount > 0 ? Math.round(totalCalories / daysCount) : 0;
    const avgProtein = daysCount > 0 ? Math.round(totalProtein / daysCount) : 0;
    const avgCarbs = daysCount > 0 ? Math.round(totalCarbs / daysCount) : 0;
    const avgFat = daysCount > 0 ? Math.round(totalFat / daysCount) : 0;

    return { avgCalories, avgProtein, avgCarbs, avgFat, daysCount, mealCount: template.meals.length };
  }

  if (loading) {
    return (
      <Card className="bg-gunmetal border-steel/20">
        <CardContent className="py-12">
          <div className="text-center text-steel">Loading templates...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gunmetal border-steel/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-high-vis">Meal Plan Templates</CardTitle>
              <p className="text-sm text-steel mt-1">
                Save and reuse your favorite meal plans
              </p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-radar-green hover:bg-radar-green/80 text-black">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gunmetal border-steel/20">
                <DialogHeader>
                  <DialogTitle className="text-high-vis">Create Template from Current Week</DialogTitle>
                  <DialogDescription className="text-steel">
                    This will save all meals from your current week as a reusable template
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name" className="text-steel">
                      Template Name
                    </Label>
                    <Input
                      id="template-name"
                      placeholder="e.g., Bulk Week, Cut Week, Competition Prep"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="bg-gunmetal border-steel/20 text-high-vis"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-description" className="text-steel">
                      Description (optional)
                    </Label>
                    <Textarea
                      id="template-description"
                      placeholder="Describe this meal plan template..."
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                      className="bg-gunmetal border-steel/20 text-high-vis"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is-public"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="rounded border-steel/20"
                    />
                    <Label htmlFor="is-public" className="text-steel text-sm">
                      Make this template public for others to use
                    </Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    className="border-steel/20"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateFromWeek}
                    disabled={creating}
                    className="bg-radar-green hover:bg-radar-green/80 text-black"
                  >
                    {creating ? "Creating..." : "Create Template"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const summary = getTemplateMacroSummary(template);
          const isOwn = template.user_id === userId;

          return (
            <Card key={template.id} className="bg-gunmetal border-steel/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base text-high-vis">{template.name}</CardTitle>
                    <p className="text-xs text-steel mt-1 line-clamp-2">
                      {template.description || "No description"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {template.is_public && (
                      <span className="text-xs border border-radar-green text-radar-green px-2 py-0.5 rounded">
                        Public
                      </span>
                    )}
                    {isOwn && (
                      <span className="text-xs border border-high-vis text-high-vis px-2 py-0.5 rounded">
                        Mine
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gunmetal-dark p-2 rounded">
                    <div className="text-steel">Days</div>
                    <div className="text-high-vis font-medium">{summary.daysCount}</div>
                  </div>
                  <div className="bg-gunmetal-dark p-2 rounded">
                    <div className="text-steel">Meals</div>
                    <div className="text-high-vis font-medium">{summary.mealCount}</div>
                  </div>
                  <div className="bg-gunmetal-dark p-2 rounded">
                    <div className="text-steel">Avg Calories</div>
                    <div className="text-high-vis font-medium">{summary.avgCalories}</div>
                  </div>
                  <div className="bg-gunmetal-dark p-2 rounded">
                    <div className="text-steel">Avg Protein</div>
                    <div className="text-high-vis font-medium">{summary.avgProtein}g</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-steel/20 hover:bg-steel/10"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gunmetal border-steel/20 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-high-vis">{template.name}</DialogTitle>
                        <DialogDescription className="text-steel">
                          {template.description}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="max-h-[400px] overflow-y-auto">
                        <div className="space-y-4 py-4 pr-2">
                          {Array.from(
                            new Set(template.meals.map((m) => m.day_offset))
                          ).sort((a, b) => a - b).map((dayOffset) => (
                            <div key={dayOffset} className="space-y-2">
                              <h4 className="text-sm font-medium text-high-vis">
                                Day {dayOffset + 1}
                              </h4>
                              <div className="space-y-1">
                                {template.meals
                                  .filter((m) => m.day_offset === dayOffset)
                                  .sort((a, b) => a.meal_number - b.meal_number)
                                  .map((meal) => (
                                    <div
                                      key={meal.id}
                                      className="flex items-center justify-between bg-gunmetal-dark p-2 rounded text-xs"
                                    >
                                      <span className="text-steel">
                                        {MEAL_SLOT_NAMES[meal.meal_number]}:
                                      </span>
                                      <span className="text-high-vis">
                                        {meal.recipe.title}
                                      </span>
                                      {meal.recipe.calories && (
                                        <span className="text-steel">
                                          {meal.recipe.calories} cal
                                        </span>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="flex-1 bg-radar-green hover:bg-radar-green/80 text-black"
                        onClick={() => setApplyTemplateId(template.id)}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Apply
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gunmetal border-steel/20">
                      <DialogHeader>
                        <DialogTitle className="text-high-vis">Apply Template</DialogTitle>
                        <DialogDescription className="text-steel">
                          Choose a start date for "{template.name}"
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-date" className="text-steel">
                            Start Date
                          </Label>
                          <Input
                            id="start-date"
                            type="date"
                            value={applyStartDate}
                            onChange={(e) => setApplyStartDate(e.target.value)}
                            className="bg-gunmetal border-steel/20 text-high-vis"
                          />
                        </div>
                        <p className="text-xs text-steel">
                          This template contains {summary.daysCount} days of meals. All meals will
                          be added starting from the selected date.
                        </p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" className="border-steel/20">
                          Cancel
                        </Button>
                        <Button
                          onClick={handleApplyTemplate}
                          className="bg-radar-green hover:bg-radar-green/80 text-black"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Apply Template
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {templates.length === 0 && (
        <Card className="bg-gunmetal border-steel/20">
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-steel mb-4">No templates yet</p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-radar-green hover:bg-radar-green/80 text-black"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
