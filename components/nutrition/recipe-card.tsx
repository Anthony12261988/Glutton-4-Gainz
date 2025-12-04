"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Beef, Wheat, Droplet, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Recipe {
  id: string;
  title: string;
  image_url?: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  instructions: string;
}

interface RecipeCardProps {
  recipe: Recipe;
  isSelected?: boolean;
  onSelect?: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, isSelected, onSelect }: RecipeCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:border-tactical-red",
        isSelected && "border-tactical-red ring-1 ring-tactical-red"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{recipe.title}</CardTitle>
          {onSelect && (
            <Button
              size="sm"
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "h-8 w-8 p-0",
                isSelected
                  ? "bg-tactical-red text-high-vis"
                  : "text-tactical-red"
              )}
              onClick={() => onSelect(recipe)}
            >
              {isSelected ? (
                <Check className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="flex flex-col items-center gap-1 rounded-sm bg-gunmetal p-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-bold text-high-vis">
              {recipe.calories}
            </span>
            <span className="text-[10px] text-muted-text">KCAL</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-sm bg-gunmetal p-2">
            <Beef className="h-4 w-4 text-red-500" />
            <span className="text-xs font-bold text-high-vis">
              {recipe.protein}g
            </span>
            <span className="text-[10px] text-muted-text">PRO</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-sm bg-gunmetal p-2">
            <Wheat className="h-4 w-4 text-yellow-500" />
            <span className="text-xs font-bold text-high-vis">
              {recipe.carbs}g
            </span>
            <span className="text-[10px] text-muted-text">CARB</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-sm bg-gunmetal p-2">
            <Droplet className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-bold text-high-vis">
              {recipe.fat}g
            </span>
            <span className="text-[10px] text-muted-text">FAT</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
