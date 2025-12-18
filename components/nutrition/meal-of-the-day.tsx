"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Utensils,
  Flame,
  Beef,
  Wheat,
  Droplet,
  Star,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Recipe {
  id: string;
  title: string;
  image_url: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  instructions: string;
}

interface MealOfTheDayProps {
  recipe: Recipe | null;
}

export function MealOfTheDay({ recipe }: MealOfTheDayProps) {
  // No featured meal for today
  if (!recipe) {
    return (
      <Card className="border-steel/30 bg-gunmetal/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-high-vis" />
            MEAL OF THE DAY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Utensils className="h-10 w-10 text-steel mb-3" />
            <p className="text-sm text-muted-text">
              No featured meal today. Check back tomorrow!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-high-vis/30 bg-gunmetal overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-high-vis/10 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-high-vis" />
            MEAL OF THE DAY
          </CardTitle>
          <div className="text-xs text-high-vis font-heading uppercase px-2 py-1 rounded-sm bg-high-vis/10 border border-high-vis/30">
            Featured
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recipe Image */}
        {recipe.image_url && (
          <div className="relative h-32 w-full rounded-sm overflow-hidden">
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Recipe Title */}
        <div>
          <h3 className="font-heading text-lg font-bold text-high-vis uppercase">
            {recipe.title}
          </h3>
          <p className="text-xs text-steel mt-1">
            Today's featured recipe - available to all recruits
          </p>
        </div>

        {/* Macro Grid */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="flex flex-col items-center gap-1 rounded-sm bg-camo-black p-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-bold text-high-vis">
              {recipe.calories}
            </span>
            <span className="text-[10px] text-muted-text">KCAL</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-sm bg-camo-black p-2">
            <Beef className="h-4 w-4 text-red-500" />
            <span className="text-xs font-bold text-high-vis">
              {recipe.protein}g
            </span>
            <span className="text-[10px] text-muted-text">PRO</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-sm bg-camo-black p-2">
            <Wheat className="h-4 w-4 text-yellow-500" />
            <span className="text-xs font-bold text-high-vis">
              {recipe.carbs}g
            </span>
            <span className="text-[10px] text-muted-text">CARB</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-sm bg-camo-black p-2">
            <Droplet className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-bold text-high-vis">
              {recipe.fat}g
            </span>
            <span className="text-[10px] text-muted-text">FAT</span>
          </div>
        </div>

        {/* Instructions Preview */}
        <p className="text-xs text-muted-text line-clamp-2">
          {recipe.instructions}
        </p>

        {/* View in Rations Link */}
        <Link href="/rations">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-steel/30 text-steel hover:text-white"
          >
            View in Rations <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
