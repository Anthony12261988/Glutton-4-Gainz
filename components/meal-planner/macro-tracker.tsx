"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDailyMacros, setMacroTargets } from "@/lib/queries/meal-planner-enhanced";
import { Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MacroData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MacroTrackerProps {
  userId: string;
  date: string;
}

export function MacroTracker({ userId, date }: MacroTrackerProps) {
  const [targets, setTargets] = useState<MacroData>({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
  });
  const [actuals, setActuals] = useState<MacroData>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<MacroData>(targets);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMacros();
  }, [userId, date]);

  async function loadMacros() {
    setLoading(true);
    const { data, error } = await getDailyMacros(userId, date);

    if (error) {
      console.error("Error loading macros:", error);
    }

    if (data) {
      setTargets({
        calories: data.target_calories || 2000,
        protein: data.target_protein || 150,
        carbs: data.target_carbs || 200,
        fat: data.target_fat || 65,
      });
      setActuals({
        calories: data.actual_calories || 0,
        protein: data.actual_protein || 0,
        carbs: data.actual_carbs || 0,
        fat: data.actual_fat || 0,
      });
      setEditValues({
        calories: data.target_calories || 2000,
        protein: data.target_protein || 150,
        carbs: data.target_carbs || 200,
        fat: data.target_fat || 65,
      });
    }

    setLoading(false);
  }

  async function saveMacroTargets() {
    const { error } = await setMacroTargets(userId, date, editValues);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error saving targets",
        description: error.message,
      });
      return;
    }

    setTargets(editValues);
    setIsEditing(false);
    toast({
      title: "Targets updated",
      description: "Your macro targets have been saved successfully.",
    });
  }

  function getProgressColor(actual: number, target: number): string {
    const percentage = (actual / target) * 100;
    if (percentage >= 90 && percentage <= 110) return "bg-radar-green";
    if (percentage >= 80 && percentage <= 120) return "bg-high-vis";
    return "bg-tactical-red";
  }

  function getProgressPercentage(actual: number, target: number): number {
    return Math.min((actual / target) * 100, 100);
  }

  if (loading) {
    return (
      <Card className="bg-gunmetal border-steel/20">
        <CardHeader>
          <CardTitle className="text-high-vis">Daily Macros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-steel py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gunmetal border-steel/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-high-vis">Daily Macros</CardTitle>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="border-steel/20 hover:bg-steel/10"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit Targets
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditValues(targets);
                setIsEditing(false);
              }}
              className="border-steel/20 hover:bg-steel/10"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={saveMacroTargets}
              className="bg-radar-green hover:bg-radar-green/80 text-black"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Calories */}
            <div className="space-y-2">
              <Label htmlFor="calories" className="text-steel text-sm">
                Calories (kcal)
              </Label>
              <Input
                id="calories"
                type="number"
                value={editValues.calories}
                onChange={(e) =>
                  setEditValues({ ...editValues, calories: parseInt(e.target.value) || 0 })
                }
                className="bg-gunmetal border-steel/20 text-high-vis"
              />
            </div>

            {/* Protein */}
            <div className="space-y-2">
              <Label htmlFor="protein" className="text-steel text-sm">
                Protein (g)
              </Label>
              <Input
                id="protein"
                type="number"
                value={editValues.protein}
                onChange={(e) =>
                  setEditValues({ ...editValues, protein: parseInt(e.target.value) || 0 })
                }
                className="bg-gunmetal border-steel/20 text-high-vis"
              />
            </div>

            {/* Carbs */}
            <div className="space-y-2">
              <Label htmlFor="carbs" className="text-steel text-sm">
                Carbs (g)
              </Label>
              <Input
                id="carbs"
                type="number"
                value={editValues.carbs}
                onChange={(e) =>
                  setEditValues({ ...editValues, carbs: parseInt(e.target.value) || 0 })
                }
                className="bg-gunmetal border-steel/20 text-high-vis"
              />
            </div>

            {/* Fat */}
            <div className="space-y-2">
              <Label htmlFor="fat" className="text-steel text-sm">
                Fat (g)
              </Label>
              <Input
                id="fat"
                type="number"
                value={editValues.fat}
                onChange={(e) =>
                  setEditValues({ ...editValues, fat: parseInt(e.target.value) || 0 })
                }
                className="bg-gunmetal border-steel/20 text-high-vis"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Calories */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-steel">Calories</span>
                <span className="text-high-vis font-medium">
                  {actuals.calories} / {targets.calories}
                </span>
              </div>
              <div className="h-2 bg-gunmetal-dark rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${getProgressColor(
                    actuals.calories,
                    targets.calories
                  )}`}
                  style={{ width: `${getProgressPercentage(actuals.calories, targets.calories)}%` }}
                />
              </div>
            </div>

            {/* Protein */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-steel">Protein</span>
                <span className="text-high-vis font-medium">
                  {actuals.protein}g / {targets.protein}g
                </span>
              </div>
              <div className="h-2 bg-gunmetal-dark rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${getProgressColor(
                    actuals.protein,
                    targets.protein
                  )}`}
                  style={{ width: `${getProgressPercentage(actuals.protein, targets.protein)}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-steel">Carbs</span>
                <span className="text-high-vis font-medium">
                  {actuals.carbs}g / {targets.carbs}g
                </span>
              </div>
              <div className="h-2 bg-gunmetal-dark rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${getProgressColor(actuals.carbs, targets.carbs)}`}
                  style={{ width: `${getProgressPercentage(actuals.carbs, targets.carbs)}%` }}
                />
              </div>
            </div>

            {/* Fat */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-steel">Fat</span>
                <span className="text-high-vis font-medium">
                  {actuals.fat}g / {targets.fat}g
                </span>
              </div>
              <div className="h-2 bg-gunmetal-dark rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${getProgressColor(actuals.fat, targets.fat)}`}
                  style={{ width: `${getProgressPercentage(actuals.fat, targets.fat)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        {!isEditing && (
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-steel">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-radar-green" />
              <span>On Track (90-110%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-high-vis" />
              <span>Close (80-120%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-tactical-red" />
              <span>Off Target</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
