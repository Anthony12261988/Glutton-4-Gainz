"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Save, Upload, Loader2, Globe, Lock, Utensils } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getMealTemplates,
  createMealTemplate,
  applyTemplate,
} from "@/lib/queries/meal-planner-enhanced";
import type { MealPlanWithRecipe } from "@/lib/types/meal-planner";
import { cn } from "@/lib/utils";

interface TemplateManagerProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  currentWeekMealPlans: MealPlanWithRecipe[];
  currentWeekStartDate: string;
  onTemplateApplied: () => void;
}

export function TemplateManager({
  open,
  onClose,
  userId,
  currentWeekMealPlans,
  currentWeekStartDate,
  onTemplateApplied,
}: TemplateManagerProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Save template form
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  // Apply template form
  const [applyStartDate, setApplyStartDate] = useState("");

  useEffect(() => {
    if (open) {
      loadTemplates();
      // Set default apply date to next Monday
      const nextMonday = getNextMonday();
      setApplyStartDate(nextMonday);
    }
  }, [open]);

  function getNextMonday() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return nextMonday.toISOString().split("T")[0];
  }

  async function loadTemplates() {
    setLoading(true);
    const { data, error } = await getMealTemplates(userId);
    if (!error && data) {
      setTemplates(data);
    }
    setLoading(false);
  }

  async function handleSaveTemplate() {
    if (!templateName.trim()) {
      toast({
        title: "NAME REQUIRED",
        description: "Please enter a template name",
        variant: "destructive",
      });
      return;
    }

    if (currentWeekMealPlans.length === 0) {
      toast({
        title: "NO MEALS PLANNED",
        description: "Plan some meals for the week before saving a template",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Convert meal plans to template meals format
      const weekStart = new Date(currentWeekStartDate);
      const meals = currentWeekMealPlans.map((mp) => {
        const mealDate = new Date(mp.assigned_date);
        const dayOffset = Math.floor(
          (mealDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          recipeId: mp.recipe_id,
          dayOffset,
          mealNumber: mp.meal_number ?? 1, // Default to 1 if null
        };
      });

      const { error } = await createMealTemplate(
        userId,
        templateName,
        templateDescription,
        isPublic,
        meals
      );

      if (error) throw error;

      toast({
        title: "TEMPLATE SAVED",
        description: `Template "${templateName}" saved successfully`,
      });

      setShowSaveDialog(false);
      setTemplateName("");
      setTemplateDescription("");
      setIsPublic(false);
      loadTemplates();
    } catch (error: any) {
      toast({
        title: "SAVE FAILED",
        description: error.message || "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyTemplate() {
    if (!selectedTemplate || !applyStartDate) {
      toast({
        title: "INVALID INPUT",
        description: "Please select a template and date",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await applyTemplate(
        userId,
        selectedTemplate.id,
        applyStartDate
      );

      if (error) throw error;

      toast({
        title: "TEMPLATE APPLIED",
        description: `Meals scheduled starting ${applyStartDate}`,
      });

      setShowApplyDialog(false);
      setSelectedTemplate(null);
      onTemplateApplied();
      onClose();
    } catch (error: any) {
      toast({
        title: "APPLY FAILED",
        description: error.message || "Failed to apply template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-gunmetal border-steel">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-high-vis uppercase tracking-wider">
              MEAL TEMPLATES
            </DialogTitle>
            <DialogDescription className="text-muted-text">
              Save and reuse your weekly meal plans
            </DialogDescription>
          </DialogHeader>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => setShowSaveDialog(true)}
              className="bg-tactical-red hover:bg-red-700"
              disabled={currentWeekMealPlans.length === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              SAVE CURRENT WEEK
            </Button>
          </div>

          {/* Template Grid */}
          {loading && templates.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-tactical-red" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <Utensils className="h-12 w-12 text-steel/50 mx-auto mb-4" />
              <p className="text-muted-text">No templates saved yet</p>
              <p className="text-xs text-steel mt-1">
                Plan a week of meals and save it as a template
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="bg-charcoal border-steel/20 hover:border-tactical-red/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowApplyDialog(true);
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-bold text-high-vis">
                        {template.name}
                      </CardTitle>
                      {template.is_public ? (
                        <Globe className="h-4 w-4 text-radar-green flex-shrink-0" />
                      ) : (
                        <Lock className="h-4 w-4 text-steel flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-text line-clamp-2 mb-2">
                      {template.description || "No description"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-steel">
                      <Utensils className="h-3 w-3" />
                      {template.meals?.length || 0} meals
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Save Template Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-gunmetal border-steel">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-high-vis uppercase">
              SAVE AS TEMPLATE
            </DialogTitle>
            <DialogDescription className="text-muted-text">
              Save your current week ({currentWeekMealPlans.length} meals) as a reusable template
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-bold text-high-vis uppercase">
                Template Name
              </Label>
              <Input
                id="name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., High Protein Week"
                className="bg-charcoal border-steel/30 text-high-vis"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-bold text-high-vis uppercase">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe this meal plan..."
                className="bg-charcoal border-steel/30 text-high-vis resize-none"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-steel/30"
              />
              <Label htmlFor="public" className="text-sm text-muted-text cursor-pointer">
                Make this template public (share with other users)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
              className="border-steel/30"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={loading}
              className="bg-tactical-red hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  SAVING...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  SAVE TEMPLATE
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Apply Template Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="bg-gunmetal border-steel">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-high-vis uppercase">
              APPLY TEMPLATE
            </DialogTitle>
            <DialogDescription className="text-muted-text">
              Schedule "{selectedTemplate?.name}" to your meal plan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-bold text-high-vis uppercase">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={applyStartDate}
                onChange={(e) => setApplyStartDate(e.target.value)}
                className="bg-charcoal border-steel/30 text-high-vis"
              />
              <p className="text-xs text-muted-text">
                Template will be applied starting from this date ({selectedTemplate?.meals?.length || 0} meals over {Math.ceil((selectedTemplate?.meals?.length || 0) / 6)} days)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApplyDialog(false)}
              className="border-steel/30"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleApplyTemplate}
              disabled={loading}
              className="bg-tactical-red hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  APPLYING...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  APPLY TEMPLATE
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
