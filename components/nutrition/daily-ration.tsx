"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils, Flame, Beef, Wheat, Droplet, ChevronRight, Lock } from "lucide-react";
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

interface DailyRationProps {
  recipe: Recipe | null;
  isPremium?: boolean;
}

export function DailyRation({ recipe, isPremium = false }: DailyRationProps) {
  // If user is not premium, show locked state
  if (!isPremium) {
    return (
      <Card className="relative overflow-hidden border-steel/30 bg-gunmetal/50">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
          <Lock className="h-8 w-8 text-steel mb-2" />
          <p className="text-sm text-steel font-heading uppercase">Premium Feature</p>
          <Link href="/pricing">
            <Button size="sm" className="mt-3 bg-tactical-red hover:bg-red-700">
              Upgrade to Unlock
            </Button>
          </Link>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Utensils className="h-5 w-5 text-tactical-red" />
            DAILY RATION
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-gunmetal rounded-sm" />
        </CardContent>
      </Card>
    );
  }

  // No meal assigned for today
  if (!recipe) {
    return (
      <Card className="border-steel/30 bg-gunmetal/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Utensils className="h-5 w-5 text-tactical-red" />
            DAILY RATION
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Utensils className="h-10 w-10 text-steel mb-3" />
            <p className="text-sm text-muted-text">No ration assigned for today.</p>
            <Link href="/rations">
              <Button variant="outline" size="sm" className="mt-3">
                Plan Your Meals
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-steel/30 bg-gunmetal overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Utensils className="h-5 w-5 text-tactical-red" />
            DAILY RATION
          </CardTitle>
          <Link href="/rations">
            <Button variant="ghost" size="sm" className="text-steel hover:text-white">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
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
      </CardContent>
    </Card>
  );
}
