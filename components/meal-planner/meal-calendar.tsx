"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getMealPlansForWeek,
  assignMealToDay,
  removeMealFromDay,
} from "@/lib/queries/meal-plans";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Recipe {
  id: string;
  title: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface MealPlan {
  id: string;
  assigned_date: string;
  meal_number: number;
  recipe: Recipe;
}

interface MealCalendarProps {
  userId: string;
  recipes: Recipe[];
  onAddRecipe?: () => void;
}

const MEAL_SLOTS = [
  { number: 1, name: "Breakfast" },
  { number: 2, name: "Snack 1" },
  { number: 3, name: "Lunch" },
  { number: 4, name: "Snack 2" },
  { number: 5, name: "Dinner" },
  { number: 6, name: "Snack 3" },
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MealCalendar({ userId, recipes, onAddRecipe }: MealCalendarProps) {
  const [weekStart, setWeekStart] = useState<Date>(getStartOfWeek(new Date()));
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedRecipe, setDraggedRecipe] = useState<Recipe | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMealPlans();
  }, [userId, weekStart]);

  function getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  function getWeekDays(): Date[] {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }

  function formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  function formatDisplayDate(date: Date): string {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  async function loadMealPlans() {
    setLoading(true);
    const startDate = formatDate(weekStart);
    const { data, error } = await getMealPlansForWeek(userId, startDate);

    if (error) {
      console.error("Error loading meal plans:", error);
      toast({
        variant: "destructive",
        title: "Error loading meal plans",
        description: error.message,
      });
    }

    setMealPlans((data as MealPlan[]) || []);
    setLoading(false);
  }

  function getMealForSlot(date: Date, mealNumber: number): Recipe | null {
    const dateStr = formatDate(date);
    const meal = mealPlans.find(
      (mp) => mp.assigned_date === dateStr && mp.meal_number === mealNumber
    );
    return meal?.recipe || null;
  }

  async function handleDrop(date: Date, mealNumber: number) {
    if (!draggedRecipe) return;

    const dateStr = formatDate(date);
    const { data, error } = await assignMealToDay(userId, draggedRecipe.id, dateStr, mealNumber);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error assigning meal",
        description: error.message,
      });
      return;
    }

    // Reload meal plans
    await loadMealPlans();
    setDraggedRecipe(null);

    toast({
      title: "Meal assigned",
      description: `${draggedRecipe.title} added to ${MEAL_SLOTS.find((s) => s.number === mealNumber)?.name}`,
    });
  }

  async function handleRemoveMeal(date: Date, mealNumber: number) {
    const dateStr = formatDate(date);
    const { error } = await removeMealFromDay(userId, dateStr, mealNumber);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error removing meal",
        description: error.message,
      });
      return;
    }

    await loadMealPlans();
    toast({
      title: "Meal removed",
      description: "Meal removed from calendar",
    });
  }

  function handlePreviousWeek() {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() - 7);
    setWeekStart(newStart);
  }

  function handleNextWeek() {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() + 7);
    setWeekStart(newStart);
  }

  function handleThisWeek() {
    setWeekStart(getStartOfWeek(new Date()));
  }

  const weekDays = getWeekDays();

  if (loading) {
    return (
      <Card className="bg-gunmetal border-steel/20">
        <CardContent className="py-12">
          <div className="text-center text-steel">Loading calendar...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <Card className="bg-gunmetal border-steel/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-high-vis">Weekly Meal Plan</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousWeek}
                className="border-steel/20 hover:bg-steel/10"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleThisWeek}
                className="border-steel/20 hover:bg-steel/10"
              >
                This Week
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextWeek}
                className="border-steel/20 hover:bg-steel/10"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Recipe List */}
        <Card className="lg:col-span-3 bg-gunmetal border-steel/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-high-vis">Available Recipes</CardTitle>
            {onAddRecipe && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddRecipe}
                className="border-steel/20 hover:bg-steel/10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {recipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    draggable
                    onClick={() => setSelectedRecipeId(recipe.id)}
                    onDragStart={() => setDraggedRecipe(recipe)}
                    onDragEnd={() => setDraggedRecipe(null)}
                    className={`
                      p-3 rounded-lg cursor-move transition-all
                      ${
                        selectedRecipeId === recipe.id
                          ? "bg-steel/20 border border-radar-green"
                          : "bg-gunmetal-dark border border-steel/10"
                      }
                      hover:bg-steel/10
                    `}
                  >
                    <div className="text-sm font-medium text-high-vis">{recipe.title}</div>
                    {recipe.calories && (
                      <div className="text-xs text-steel mt-1">
                        {recipe.calories} cal | P: {recipe.protein}g | C: {recipe.carbs}g | F:{" "}
                        {recipe.fat}g
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <div className="lg:col-span-9">
          <Card className="bg-gunmetal border-steel/20">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-steel/20">
                      <th className="p-2 text-left text-xs font-medium text-steel border-r border-steel/20 w-24">
                        Meal
                      </th>
                      {weekDays.map((day) => (
                        <th
                          key={day.toISOString()}
                          className={`p-2 text-center text-xs font-medium border-r border-steel/20 ${
                            isToday(day) ? "text-radar-green" : "text-steel"
                          }`}
                        >
                          <div>{DAYS_OF_WEEK[day.getDay()]}</div>
                          <div className="text-xs">{formatDisplayDate(day)}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MEAL_SLOTS.map((slot) => (
                      <tr key={slot.number} className="border-b border-steel/20">
                        <td className="p-2 text-xs font-medium text-steel border-r border-steel/20 bg-gunmetal-dark">
                          {slot.name}
                        </td>
                        {weekDays.map((day) => {
                          const meal = getMealForSlot(day, slot.number);
                          return (
                            <td
                              key={`${day.toISOString()}-${slot.number}`}
                              className={`p-1 border-r border-steel/20 align-top ${
                                isToday(day) ? "bg-radar-green/5" : ""
                              }`}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => handleDrop(day, slot.number)}
                            >
                              {meal ? (
                                <div className="bg-steel/10 rounded p-2 relative group min-h-[60px]">
                                  <button
                                    onClick={() => handleRemoveMeal(day, slot.number)}
                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3 text-tactical-red hover:text-tactical-red/80" />
                                  </button>
                                  <div className="text-xs font-medium text-high-vis pr-4">
                                    {meal.title}
                                  </div>
                                  {meal.calories && (
                                    <div className="text-xs text-steel mt-1">
                                      {meal.calories} cal
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="h-[60px] flex items-center justify-center text-steel/40 text-xs">
                                  Drop here
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <div className="mt-2 text-xs text-steel text-center">
            Drag recipes from the left panel and drop them into calendar slots to assign meals
          </div>
        </div>
      </div>
    </div>
  );
}
