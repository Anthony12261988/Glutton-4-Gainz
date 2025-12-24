"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { WeekCalendar } from "@/components/nutrition/week-calendar";
import { RecipeCard, type Recipe } from "@/components/nutrition/recipe-card";
import { DailyMealView } from "@/components/nutrition/daily-meal-view";
import { RecipeSelectorDialog } from "@/components/nutrition/recipe-selector-dialog";
import { MacroTrackerWidget } from "@/components/nutrition/macro-tracker-widget";
import { MacroEntryDialog } from "@/components/nutrition/macro-entry-dialog";
import { TemplateManager } from "@/components/nutrition/template-manager";
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
  Plus,
  ChefHat,
  Lock,
  Star,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { MotivationalCorner } from "@/components/gamification/motivational-corner";
import type { MealPlanWithRecipe, MealNumber, MacroInput, DailyMacros, PlannedMacros } from "@/lib/types/meal-planner";
import { assignMealToDay, removeMealFromDay } from "@/lib/queries/meal-plans";
import { setMacroTargets, getDailyMacros } from "@/lib/queries/meal-planner-enhanced";


interface RationsClientProps {
  user: any;
  initialRecipes: Recipe[];
  initialMealPlans: MealPlanWithRecipe[];
  featuredMeal?: Recipe | null;
  isPremium?: boolean;
}

export default function RationsClient({
  user,
  initialRecipes,
  initialMealPlans,
  featuredMeal = null,
  isPremium = false,
}: RationsClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedMealSlot, setSelectedMealSlot] = useState<MealNumber | null>(null);
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [showMacroDialog, setShowMacroDialog] = useState(false);
  const [macroDialogMode, setMacroDialogMode] = useState<"targets" | "actuals">("actuals");
  const [currentDailyMacros, setCurrentDailyMacros] = useState<DailyMacros | null>(null);
  const [showTemplateManager, setShowTemplateManager] = useState(false);

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

  // Merge featured meal with recipes for free users
  const allRecipesForUser = useMemo(() => {
    if (isPremium) return initialRecipes;

    // For free users, combine standard issue + featured meal
    const recipes = [...initialRecipes];

    // Add featured meal if it exists and is not already in standard issue
    if (featuredMeal && !recipes.find((r) => r.id === featuredMeal.id)) {
      recipes.unshift(featuredMeal); // Add to beginning
    }

    return recipes;
  }, [initialRecipes, featuredMeal, isPremium]);

  // Filter and search recipes
  const filteredRecipes = useMemo(() => {
    let results = allRecipesForUser;

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
  }, [allRecipesForUser, searchQuery, activeFilter]);

  // Derived state
  const selectedDateKey = selectedDate.toISOString().split("T")[0];
  const mealPlansForSelectedDate = useMemo(() => {
    return initialMealPlans.filter((mp) => mp.assigned_date === selectedDateKey);
  }, [initialMealPlans, selectedDateKey]);

  // Get unique planned dates for calendar
  const plannedDates = useMemo(() => {
    const dates = new Set(initialMealPlans.map((mp) => mp.assigned_date));
    return Array.from(dates);
  }, [initialMealPlans]);

  // Calculate planned macros from all assigned meals for selected date
  const plannedMacros: PlannedMacros = useMemo(() => {
    return mealPlansForSelectedDate.reduce(
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
  }, [mealPlansForSelectedDate]);

  // Get current week start date (for templates)
  const currentWeekStartDate = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    return monday.toISOString().split("T")[0];
  }, []);

  const handleOpenRecipeSelector = (mealNumber: number) => {
    setSelectedMealSlot(mealNumber as MealNumber);
    setShowRecipeSelector(true);
  };

  const handleSelectRecipe = async (recipe: Recipe) => {
    if (!selectedMealSlot) return;

    setLoading(true);
    try {
      const { error } = await assignMealToDay(
        user.id,
        recipe.id,
        selectedDateKey,
        selectedMealSlot
      );

      if (error) throw error;

      toast({
        title: "RATIONS ASSIGNED",
        description: `Meal assigned to slot ${selectedMealSlot}`,
      });

      router.refresh();
    } catch (error: any) {
      console.error("Meal assignment error:", error);
      toast({
        title: "OPERATION FAILED",
        description: error.message || "Failed to assign meal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMeal = async (mealNumber: number) => {
    setLoading(true);
    try {
      const { error } = await removeMealFromDay(user.id, selectedDateKey, mealNumber);

      if (error) throw error;

      toast({
        title: "MEAL REMOVED",
        description: `Meal slot ${mealNumber} cleared`,
      });

      router.refresh();
    } catch (error: any) {
      console.error("Meal removal error:", error);
      toast({
        title: "OPERATION FAILED",
        description: error.message || "Failed to remove meal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateActuals = async () => {
    // Load current macros first
    const { data } = await getDailyMacros(user.id, selectedDateKey);
    setCurrentDailyMacros(data);
    setMacroDialogMode("actuals");
    setShowMacroDialog(true);
  };

  const handleEditTargets = async () => {
    // Load current macros first
    const { data } = await getDailyMacros(user.id, selectedDateKey);
    setCurrentDailyMacros(data);
    setMacroDialogMode("targets");
    setShowMacroDialog(true);
  };

  const handleSaveMacros = async (macros: MacroInput, isTargets: boolean) => {
    setLoading(true);
    try {
      if (isTargets) {
        // Save targets
        const { error } = await setMacroTargets(user.id, selectedDateKey, macros);
        if (error) throw error;

        toast({
          title: "TARGETS SAVED",
          description: "Macro targets updated successfully",
        });
      } else {
        // Save actuals - preserve existing targets if they exist
        const updateData: any = {
          user_id: user.id,
          date: selectedDateKey,
          actual_calories: macros.calories || 0,
          actual_protein: macros.protein || 0,
          actual_carbs: macros.carbs || 0,
          actual_fat: macros.fat || 0,
        };

        // If we have existing macros with targets, preserve them
        if (currentDailyMacros) {
          if (currentDailyMacros.target_calories) updateData.target_calories = currentDailyMacros.target_calories;
          if (currentDailyMacros.target_protein) updateData.target_protein = currentDailyMacros.target_protein;
          if (currentDailyMacros.target_carbs) updateData.target_carbs = currentDailyMacros.target_carbs;
          if (currentDailyMacros.target_fat) updateData.target_fat = currentDailyMacros.target_fat;
        }

        const { error } = await supabase
          .from("daily_macros")
          .upsert(updateData);

        if (error) throw error;

        toast({
          title: "ACTUALS UPDATED",
          description: "Actual macros recorded successfully",
        });
      }

      router.refresh();
    } catch (error: any) {
      console.error("Macro save error:", error);
      toast({
        title: "SAVE FAILED",
        description: error.message || "Failed to save macros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
            {isPremium ? "RATIONS" : "RECRUIT RATIONS"}
          </h1>
          <p className="text-sm text-muted-text">
            {isPremium
              ? "Fuel your mission. Plan your meals."
              : "Standard issue meals + today's featured recipe."}
          </p>
        </div>
        <div className="rounded-sm border border-tactical-red bg-tactical-red/10 p-2">
          <Utensils className="h-6 w-6 text-tactical-red" />
        </div>
      </div>

      {/* Motivational Corner - Mission Briefing */}
      <MotivationalCorner />

      {/* Recruit Notice */}
      {!isPremium && (
        <div className="rounded-sm border-2 border-steel/50 bg-gunmetal/80 p-4">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-steel flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-heading text-sm font-bold uppercase text-steel mb-1">
                RECRUIT STATUS
              </h3>
              <p className="text-xs text-muted-text leading-relaxed mb-3">
                As a Recruit, you receive {allRecipesForUser.length} Standard Issue rations plus today's featured meal.
                Upgrade to Soldier rank to unlock meal planning and access to all premium recipes.
              </p>
              <Link href="/pricing">
                <Button size="sm" className="bg-tactical-red hover:bg-red-700">
                  Upgrade to Soldier
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Featured Meal of the Day - Free Users */}
      {!isPremium && featuredMeal && (
        <div className="space-y-2">
          <h3 className="font-heading text-sm font-bold uppercase text-high-vis flex items-center gap-2">
            <Star className="h-4 w-4" />
            TODAY'S FEATURED MEAL
          </h3>
          <div className="rounded-sm border-2 border-high-vis/30 bg-gradient-to-br from-high-vis/5 to-transparent p-1">
            <RecipeCard recipe={featuredMeal} isSelected={false} />
          </div>
          <p className="text-xs text-steel text-center">
            This meal is featured today for all recruits. Check back daily for new meals!
          </p>
        </div>
      )}

      {/* Calendar - Only for Premium */}
      {isPremium && (
        <>
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

          {/* Macro Tracker Widget */}
          <MacroTrackerWidget
            userId={user.id}
            selectedDate={selectedDate}
            plannedMacros={plannedMacros}
            onUpdateActuals={handleUpdateActuals}
            onEditTargets={handleEditTargets}
          />

          {/* Daily Meal View - 6 meal slots */}
          <div className="space-y-2">
            <h3 className="font-heading text-sm font-bold uppercase text-muted-text">
              DAILY MEAL PLAN
            </h3>
            <DailyMealView
              mealPlans={mealPlansForSelectedDate}
              onOpenRecipeSelector={handleOpenRecipeSelector}
              onRemoveMeal={handleRemoveMeal}
              disabled={loading}
            />
          </div>

          {/* Template Manager Button */}
          <Button
            variant="outline"
            onClick={() => setShowTemplateManager(true)}
            className="w-full border-steel/30 hover:border-tactical-red"
          >
            <Calendar className="mr-2 h-4 w-4" />
            MANAGE TEMPLATES
          </Button>

          {/* Recipe Selector Dialog */}
          {selectedMealSlot && (
            <RecipeSelectorDialog
              open={showRecipeSelector}
              onClose={() => {
                setShowRecipeSelector(false);
                setSelectedMealSlot(null);
              }}
              onSelect={handleSelectRecipe}
              recipes={allRecipesForUser}
              mealNumber={selectedMealSlot}
              currentRecipeId={
                mealPlansForSelectedDate.find(mp => mp.meal_number === selectedMealSlot)?.recipe_id
              }
            />
          )}

          {/* Macro Entry Dialog */}
          <MacroEntryDialog
            open={showMacroDialog}
            onClose={() => setShowMacroDialog(false)}
            currentMacros={currentDailyMacros}
            onSave={handleSaveMacros}
            mode={macroDialogMode}
          />

          {/* Template Manager */}
          <TemplateManager
            open={showTemplateManager}
            onClose={() => setShowTemplateManager(false)}
            userId={user.id}
            currentWeekMealPlans={initialMealPlans}
            currentWeekStartDate={currentWeekStartDate}
            onTemplateApplied={() => router.refresh()}
          />
        </>
      )}

      {/* Standard Issue Display for Recruits */}
      {!isPremium && (
        <div className="space-y-2">
          <h3 className="font-heading text-sm font-bold uppercase text-muted-text">
            STANDARD ISSUE MENU
          </h3>
          <div className="rounded-sm border border-steel/30 bg-gunmetal/50 p-4">
            <p className="text-sm text-muted-text mb-2">
              These are your standard issue rations. Recruits follow orders—you eat what you're given.
            </p>
            <p className="text-xs text-steel">
              Upgrade to Soldier rank to unlock meal planning and custom rations.
            </p>
          </div>
        </div>
      )}

      {/* Recipe Selector */}
      <div className="space-y-4">
        <h3 className="font-heading text-sm font-bold uppercase text-muted-text">
          {isPremium ? "AVAILABLE RATIONS" : "STANDARD ISSUE RATIONS"}
        </h3>

        {/* Search Bar - Only for Premium */}
        {isPremium && (
          <>
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
          </>
        )}

        {/* Results Count */}
        {(searchQuery || activeFilter) && (
          <p className="text-xs text-steel">
            {filteredRecipes.length} recipe
            {filteredRecipes.length !== 1 ? "s" : ""} found
          </p>
        )}

        {filteredRecipes.length === 0 ? (
          <div className="rounded-sm border-2 border-dashed border-steel/30 bg-gunmetal/50 p-8 text-center">
            <ChefHat className="mx-auto h-12 w-12 text-steel/50 mb-4" />
            <p className="font-heading text-lg text-high-vis mb-2">
              NO RECIPES AVAILABLE
            </p>
            {isPremium && (searchQuery || activeFilter) ? (
              <>
                <p className="text-sm text-muted-text mb-4">
                  No recipes match your search criteria.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveFilter(null);
                  }}
                  className="border-steel/30"
                >
                  <X className="mr-2 h-4 w-4" /> Clear Filters
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-text mb-2">
                  The mess hall is currently empty.
                </p>
                <p className="text-xs text-steel">
                  Your coach is preparing the menu. Check back soon for
                  delicious, mission-ready recipes!
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isSelected={false}
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
