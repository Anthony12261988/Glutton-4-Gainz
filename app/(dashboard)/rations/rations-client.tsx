"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { WeekCalendar } from "@/components/nutrition/week-calendar";
import { RecipeCard, type Recipe } from "@/components/nutrition/recipe-card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Utensils,
  Loader2,
  Search,
  X,
  Flame,
  Beef,
  Wheat,
  Droplet,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Filter options
  const filters = [
    {
      id: "high-protein",
      label: "High Protein",
      icon: Beef,
      check: (r: Recipe) => r.protein >= 30,
    },
    {
      id: "low-carb",
      label: "Low Carb",
      icon: Wheat,
      check: (r: Recipe) => r.carbs <= 20,
    },
    {
      id: "low-cal",
      label: "Low Cal",
      icon: Flame,
      check: (r: Recipe) => r.calories <= 400,
    },
    {
      id: "low-fat",
      label: "Low Fat",
      icon: Droplet,
      check: (r: Recipe) => r.fat <= 15,
    },
  ];

  // Filter and search recipes
  const filteredRecipes = useMemo(() => {
    let results = initialRecipes;

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.instructions.toLowerCase().includes(query)
      );
    }

    // Apply filter
    if (activeFilter) {
      const filter = filters.find((f) => f.id === activeFilter);
      if (filter) {
        results = results.filter(filter.check);
      }
    }

    return results;
  }, [initialRecipes, searchQuery, activeFilter]);

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

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
          <Input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-gunmetal"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(isActive ? null : filter.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-bold uppercase transition-colors",
                  isActive
                    ? "border-tactical-red bg-tactical-red/20 text-tactical-red"
                    : "border-steel/30 bg-gunmetal text-steel hover:border-steel hover:text-white"
                )}
              >
                <Icon className="h-3 w-3" />
                {filter.label}
              </button>
            );
          })}
          {activeFilter && (
            <button
              onClick={() => setActiveFilter(null)}
              className="flex items-center gap-1 text-xs text-steel hover:text-white"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>

        {/* Results Count */}
        {(searchQuery || activeFilter) && (
          <p className="text-xs text-steel">
            {filteredRecipes.length} recipe
            {filteredRecipes.length !== 1 ? "s" : ""} found
          </p>
        )}

        {filteredRecipes.length === 0 ? (
          <div className="rounded-sm border border-tactical-red bg-gunmetal p-6 text-center">
            <p className="text-high-vis">NO RECIPES FOUND</p>
            <p className="text-sm text-muted-text">
              {searchQuery || activeFilter
                ? "Try adjusting your search or filters."
                : "HQ hasn't uploaded the menu yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRecipes.map((recipe) => (
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
