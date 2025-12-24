"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Flame, Beef, Wheat, Droplet } from "lucide-react";
import { RecipeCard, type Recipe } from "./recipe-card";
import { MEAL_LABELS, type MealNumber } from "@/lib/types/meal-planner";
import { cn } from "@/lib/utils";

interface RecipeSelectorDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (recipe: Recipe) => void;
  recipes: Recipe[];
  mealNumber: MealNumber;
  currentRecipeId?: string | null;
}

export function RecipeSelectorDialog({
  open,
  onClose,
  onSelect,
  recipes,
  mealNumber,
  currentRecipeId,
}: RecipeSelectorDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const mealInfo = MEAL_LABELS[mealNumber];

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
    let results = recipes;

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
  }, [recipes, searchQuery, activeFilter]);

  const handleSelect = (recipe: Recipe) => {
    onSelect(recipe);
    onClose();
    // Reset filters
    setSearchQuery("");
    setActiveFilter(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-gunmetal border-steel">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-high-vis uppercase tracking-wider">
            SELECT RECIPE FOR {mealInfo.name.toUpperCase()}
          </DialogTitle>
          <DialogDescription className="text-muted-text">
            Choose a recipe to assign to your {mealInfo.name.toLowerCase()} slot ({mealInfo.time})
          </DialogDescription>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-text" />
            <Input
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-charcoal border-steel/30 text-high-vis"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const Icon = filter.icon;
              const isActive = activeFilter === filter.id;

              return (
                <Button
                  key={filter.id}
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveFilter(isActive ? null : filter.id)}
                  className={cn(
                    "border-steel/30 text-muted-text hover:text-high-vis transition-colors",
                    isActive && "bg-tactical-red/20 border-tactical-red text-tactical-red hover:text-tactical-red"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {filter.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Recipe Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-text">
              {searchQuery || activeFilter
                ? "No recipes match your criteria"
                : "No recipes available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => handleSelect(recipe)}
                className="cursor-pointer"
              >
                <RecipeCard
                  recipe={recipe}
                  isSelected={recipe.id === currentRecipeId}
                  showImage={true}
                />
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
