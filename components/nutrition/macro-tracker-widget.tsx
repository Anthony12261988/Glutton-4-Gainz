"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Beef, Wheat, Droplet, Edit, RefreshCw } from "lucide-react";
import { getDailyMacros } from "@/lib/queries/meal-planner-enhanced";
import type { PlannedMacros, DailyMacros } from "@/lib/types/meal-planner";
import { cn } from "@/lib/utils";

interface MacroTrackerWidgetProps {
  userId: string;
  selectedDate: Date;
  plannedMacros: PlannedMacros;
  onUpdateActuals: () => void;
  onEditTargets: () => void;
}

export function MacroTrackerWidget({
  userId,
  selectedDate,
  plannedMacros,
  onUpdateActuals,
  onEditTargets,
}: MacroTrackerWidgetProps) {
  const [dailyMacros, setDailyMacros] = useState<DailyMacros | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedDateKey = selectedDate.toISOString().split("T")[0];

  useEffect(() => {
    loadDailyMacros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, selectedDateKey]);

  async function loadDailyMacros() {
    setLoading(true);
    const { data } = await getDailyMacros(userId, selectedDateKey);
    setDailyMacros(data);
    setLoading(false);
  }

  const macroItems = [
    {
      label: "Calories",
      icon: Flame,
      color: "text-orange-500",
      planned: plannedMacros.calories,
      target: dailyMacros?.target_calories || 0,
      actual: dailyMacros?.actual_calories || 0,
      unit: "",
    },
    {
      label: "Protein",
      icon: Beef,
      color: "text-red-500",
      planned: plannedMacros.protein,
      target: dailyMacros?.target_protein || 0,
      actual: dailyMacros?.actual_protein || 0,
      unit: "g",
    },
    {
      label: "Carbs",
      icon: Wheat,
      color: "text-yellow-500",
      planned: plannedMacros.carbs,
      target: dailyMacros?.target_carbs || 0,
      actual: dailyMacros?.actual_carbs || 0,
      unit: "g",
    },
    {
      label: "Fat",
      icon: Droplet,
      color: "text-blue-500",
      planned: plannedMacros.fat,
      target: dailyMacros?.target_fat || 0,
      actual: dailyMacros?.actual_fat || 0,
      unit: "g",
    },
  ];

  function getProgressColor(actual: number, target: number): string {
    if (target === 0) return "bg-steel/30";
    const percentage = (actual / target) * 100;
    if (percentage >= 90 && percentage <= 110) return "bg-radar-green";
    if (percentage >= 80 && percentage <= 120) return "bg-high-vis";
    return "bg-tactical-red";
  }

  return (
    <Card className="bg-gunmetal border-steel/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-high-vis uppercase tracking-wide">
            DAILY MACRO INTEL
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={onEditTargets}
            className="h-8 px-2 text-xs text-muted-text hover:text-high-vis"
          >
            <Edit className="h-3 w-3 mr-1" />
            TARGETS
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Planned Macros Summary */}
        <div className="bg-charcoal border border-steel/20 rounded-sm p-3">
          <p className="text-xs text-muted-text uppercase mb-2">Planned from Meals</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-high-vis">{plannedMacros.calories}</p>
              <p className="text-[10px] text-muted-text">CAL</p>
            </div>
            <div>
              <p className="text-lg font-bold text-high-vis">{plannedMacros.protein}g</p>
              <p className="text-[10px] text-muted-text">PRO</p>
            </div>
            <div>
              <p className="text-lg font-bold text-high-vis">{plannedMacros.carbs}g</p>
              <p className="text-[10px] text-muted-text">CARB</p>
            </div>
            <div>
              <p className="text-lg font-bold text-high-vis">{plannedMacros.fat}g</p>
              <p className="text-[10px] text-muted-text">FAT</p>
            </div>
          </div>
        </div>

        {/* Macro Progress Bars */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-text uppercase">Actual vs Target</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={onUpdateActuals}
              className="h-7 px-2 text-xs text-tactical-red hover:text-tactical-red"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              UPDATE
            </Button>
          </div>

          {macroItems.map((macro) => {
            const Icon = macro.icon;
            const percentage = macro.target > 0 ? (macro.actual / macro.target) * 100 : 0;
            const progressColor = getProgressColor(macro.actual, macro.target);

            return (
              <div key={macro.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", macro.color)} />
                    <span className="text-xs font-bold text-high-vis uppercase">
                      {macro.label}
                    </span>
                  </div>
                  <div className="text-xs text-muted-text">
                    <span className="font-bold text-high-vis">
                      {macro.actual}
                    </span>
                    {macro.target > 0 && (
                      <span> / {macro.target}{macro.unit}</span>
                    )}
                    {macro.target === 0 && macro.unit}
                  </div>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-charcoal">
                  <div
                    className={cn("h-full transition-all", progressColor)}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                {macro.target > 0 && (
                  <p className="text-[10px] text-right text-steel">
                    {percentage.toFixed(0)}%
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Target Status Message */}
        {!dailyMacros && (
          <div className="bg-steel/10 border border-steel/30 rounded-sm p-2 text-center">
            <p className="text-xs text-muted-text">
              No targets set for this day. Click <span className="font-bold">TARGETS</span> to set goals.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
