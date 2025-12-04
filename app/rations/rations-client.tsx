"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { WeekCalendar } from "@/components/nutrition/week-calendar";
import { RecipeCard, type Recipe } from "@/components/nutrition/recipe-card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Utensils, Loader2 } from "lucide-react";

interface MealPlan {
  id: string;
  assigned_date: string;
  recipe_id: string;
  recipe: Recipe;
}

interface RationsClientProps {
  user: any;
  initialRecipes: Recipe[];
  initialMealPlans: MealPlan[];
}

export default function RationsClient({
  user,
  initialRecipes,
  initialMealPlans,
}: RationsClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);

  // Derived state
  const selectedDateKey = selectedDate.toISOString().split("T")[0];
  const currentMealPlan = initialMealPlans.find(
    (mp) => mp.assigned_date === selectedDateKey
  );
  const plannedDates = initialMealPlans.map((mp) => mp.assigned_date);

  const handleAssignMeal = async (recipe: Recipe) => {
    setLoading(true);
    try {
      // If there's already a meal plan for this date, we update it (or delete and insert, but upsert is better)
      // The unique constraint is on (user_id, assigned_date)

      // First, check if we need to delete an existing one (if we want to toggle off)
      // But for now, let's assume clicking a recipe replaces the current one for that day.

      const { error } = await supabase.from("meal_plans").upsert(
        {
          user_id: user.id,
          recipe_id: recipe.id,
          assigned_date: selectedDateKey,
        },
        {
          onConflict: "user_id, assigned_date",
        }
      );

      if (error) throw error;

      toast({
        title: "RATIONS ASSIGNED",
        description: `Meal plan updated for ${selectedDate.toLocaleDateString()}`,
      });

      router.refresh();
    } catch (error: any) {
      toast({
        title: "OPERATION FAILED",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
            RATIONS
          </h1>
          <p className="text-sm text-muted-text">
            Fuel your mission. Plan your meals.
          </p>
        </div>
        <div className="rounded-sm border border-tactical-red bg-tactical-red/10 p-2">
          <Utensils className="h-6 w-6 text-tactical-red" />
        </div>
      </div>

      {/* Calendar */}
      <div className="space-y-2">
        <h3 className="font-heading text-sm font-bold uppercase text-muted-text">
          MISSION TIMELINE
        </h3>
        <WeekCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          plannedDates={plannedDates}
        />
      </div>

      {/* Current Plan Display */}
      <div className="space-y-2">
        <h3 className="font-heading text-sm font-bold uppercase text-muted-text">
          ASSIGNED RATION
        </h3>
        {currentMealPlan ? (
          <RecipeCard recipe={currentMealPlan.recipe} isSelected={true} />
        ) : (
          <div className="flex h-32 flex-col items-center justify-center rounded-sm border border-dashed border-steel bg-gunmetal/50 text-center">
            <p className="text-sm text-muted-text">
              No rations assigned for this day.
            </p>
            <p className="text-xs text-steel">
              Select a recipe below to assign.
            </p>
          </div>
        )}
      </div>

      {/* Recipe Selector */}
      <div className="space-y-4">
        <h3 className="font-heading text-sm font-bold uppercase text-muted-text">
          AVAILABLE RATIONS
        </h3>

        {initialRecipes.length === 0 ? (
          <div className="rounded-sm border border-tactical-red bg-gunmetal p-6 text-center">
            <p className="text-high-vis">NO RECIPES FOUND</p>
            <p className="text-sm text-muted-text">
              HQ hasn't uploaded the menu yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {initialRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isSelected={currentMealPlan?.recipe_id === recipe.id}
                onSelect={handleAssignMeal}
              />
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Loader2 className="h-12 w-12 animate-spin text-tactical-red" />
        </div>
      )}
    </div>
  );
}
