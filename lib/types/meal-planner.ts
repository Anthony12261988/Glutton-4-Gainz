import type { Database } from "./database.types";

export type MealPlan = Database["public"]["Tables"]["meal_plans"]["Row"];
export type Recipe = Database["public"]["Tables"]["recipes"]["Row"];
export type DailyMacros = Database["public"]["Tables"]["daily_macros"]["Row"];
export type MealTemplate = Database["public"]["Tables"]["meal_templates"]["Row"];
export type TemplateMeal = Database["public"]["Tables"]["template_meals"]["Row"];

export interface MealPlanWithRecipe extends MealPlan {
  recipe: Recipe;
}

export interface MacroInput {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface PlannedMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const MEAL_LABELS = {
  1: {
    name: "Breakfast",
    time: "6:00-8:00 AM",
    color: "border-orange-500"
  },
  2: {
    name: "Lunch",
    time: "12:00-2:00 PM",
    color: "border-green-500"
  },
  3: {
    name: "Dinner",
    time: "6:00-8:00 PM",
    color: "border-blue-500"
  },
  4: {
    name: "Snack 1",
    time: "10:00 AM",
    color: "border-yellow-500"
  },
  5: {
    name: "Snack 2",
    time: "3:00 PM",
    color: "border-purple-500"
  },
  6: {
    name: "Snack 3",
    time: "9:00 PM",
    color: "border-pink-500"
  },
} as const;

export type MealNumber = 1 | 2 | 3 | 4 | 5 | 6;
