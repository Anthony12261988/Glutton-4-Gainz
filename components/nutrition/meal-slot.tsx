"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MEAL_LABELS, type MealNumber, type MealPlanWithRecipe } from "@/lib/types/meal-planner";
import { RecipeCard } from "./recipe-card";

interface MealSlotProps {
  mealNumber: MealNumber;
  mealPlan?: MealPlanWithRecipe | null;
  onAssign: (mealNumber: number) => void;
  onRemove: (mealNumber: number) => void;
  disabled?: boolean;
}

export function MealSlot({
  mealNumber,
  mealPlan,
  onAssign,
  onRemove,
  disabled = false,
}: MealSlotProps) {
  const mealInfo = MEAL_LABELS[mealNumber];

  return (
    <Card
      className={cn(
        "relative overflow-hidden bg-gunmetal border-steel/20",
        mealInfo.color,
        "border-l-4"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-high-vis uppercase tracking-wide">
              {mealInfo.name}
            </CardTitle>
            <p className="text-xs text-muted-text mt-0.5">{mealInfo.time}</p>
          </div>
          {mealPlan && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemove(mealNumber)}
              disabled={disabled}
              className="h-8 w-8 p-0 text-muted-text hover:text-tactical-red hover:bg-tactical-red/10"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {mealPlan ? (
          <div className="space-y-2">
            <RecipeCard
              recipe={mealPlan.recipe}
              showImage={false}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ChefHat className="h-12 w-12 text-steel/30 mb-2" />
            <p className="text-sm text-muted-text mb-4">NO MEAL ASSIGNED</p>
            <Button
              size="sm"
              onClick={() => onAssign(mealNumber)}
              disabled={disabled}
              className="bg-tactical-red hover:bg-red-700 text-high-vis"
            >
              <Plus className="h-4 w-4 mr-2" />
              ASSIGN MEAL
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
