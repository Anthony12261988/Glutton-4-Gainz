"use client";

import { useMemo } from "react";
import { MealSlot } from "./meal-slot";
import type { MealPlanWithRecipe, MealNumber, PlannedMacros } from "@/lib/types/meal-planner";

interface DailyMealViewProps {
  mealPlans: MealPlanWithRecipe[];
  onOpenRecipeSelector: (mealNumber: number) => void;
  onRemoveMeal: (mealNumber: number) => void;
  disabled?: boolean;
}

export function DailyMealView({
  mealPlans,
  onOpenRecipeSelector,
  onRemoveMeal,
  disabled = false,
}: DailyMealViewProps) {
  // Group meal plans by meal_number
  const mealsBySlot = useMemo(() => {
    const slots: Record<number, MealPlanWithRecipe | null> = {
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
    };

    mealPlans.forEach((mealPlan) => {
      const mealNum = mealPlan.meal_number ?? 1; // Default to 1 if null
      if (mealNum >= 1 && mealNum <= 6) {
        slots[mealNum] = mealPlan;
      }
    });

    return slots;
  }, [mealPlans]);

  // Calculate total planned macros from all assigned meals
  const plannedMacros: PlannedMacros = useMemo(() => {
    return mealPlans.reduce(
      (acc, mealPlan) => {
        const recipe = mealPlan.recipe;
        return {
          calories: acc.calories + (recipe?.calories || 0),
          protein: acc.protein + (recipe?.protein || 0),
          carbs: acc.carbs + (recipe?.carbs || 0),
          fat: acc.fat + (recipe?.fat || 0),
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [mealPlans]);

  return (
    <div className="space-y-4">
      {/* Planned Macros Summary */}
      <div className="bg-gunmetal border border-steel/20 rounded-lg p-4">
        <h3 className="text-sm font-bold text-high-vis uppercase tracking-wide mb-3">
          PLANNED DAILY TOTALS
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-high-vis">{plannedMacros.calories}</p>
            <p className="text-xs text-muted-text uppercase">Calories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-high-vis">{plannedMacros.protein}g</p>
            <p className="text-xs text-muted-text uppercase">Protein</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-high-vis">{plannedMacros.carbs}g</p>
            <p className="text-xs text-muted-text uppercase">Carbs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-high-vis">{plannedMacros.fat}g</p>
            <p className="text-xs text-muted-text uppercase">Fat</p>
          </div>
        </div>
      </div>

      {/* 6 Meal Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {([1, 2, 3, 4, 5, 6] as MealNumber[]).map((mealNumber) => (
          <MealSlot
            key={mealNumber}
            mealNumber={mealNumber}
            mealPlan={mealsBySlot[mealNumber]}
            onAssign={onOpenRecipeSelector}
            onRemove={onRemoveMeal}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
