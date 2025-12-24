"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, Beef, Wheat, Droplet, Loader2 } from "lucide-react";
import type { DailyMacros, MacroInput } from "@/lib/types/meal-planner";
import { cn } from "@/lib/utils";

interface MacroEntryDialogProps {
  open: boolean;
  onClose: () => void;
  currentMacros: DailyMacros | null;
  onSave: (macros: MacroInput, isTargets: boolean) => Promise<void>;
  mode: "targets" | "actuals";
}

export function MacroEntryDialog({
  open,
  onClose,
  currentMacros,
  onSave,
  mode,
}: MacroEntryDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MacroInput>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  useEffect(() => {
    if (open && currentMacros) {
      if (mode === "targets") {
        setFormData({
          calories: currentMacros.target_calories || 0,
          protein: currentMacros.target_protein || 0,
          carbs: currentMacros.target_carbs || 0,
          fat: currentMacros.target_fat || 0,
        });
      } else {
        setFormData({
          calories: currentMacros.actual_calories || 0,
          protein: currentMacros.actual_protein || 0,
          carbs: currentMacros.actual_carbs || 0,
          fat: currentMacros.actual_fat || 0,
        });
      }
    } else if (open) {
      setFormData({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      });
    }
  }, [open, currentMacros, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData, mode === "targets");
      onClose();
    } catch (error) {
      console.error("Error saving macros:", error);
    } finally {
      setLoading(false);
    }
  };

  const macroFields = [
    {
      name: "calories",
      label: "Calories",
      icon: Flame,
      color: "text-orange-500",
      unit: "kcal",
    },
    {
      name: "protein",
      label: "Protein",
      icon: Beef,
      color: "text-red-500",
      unit: "g",
    },
    {
      name: "carbs",
      label: "Carbs",
      icon: Wheat,
      color: "text-yellow-500",
      unit: "g",
    },
    {
      name: "fat",
      label: "Fat",
      icon: Droplet,
      color: "text-blue-500",
      unit: "g",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gunmetal border-steel">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-high-vis uppercase tracking-wider">
              {mode === "targets" ? "SET MACRO TARGETS" : "UPDATE ACTUAL MACROS"}
            </DialogTitle>
            <DialogDescription className="text-muted-text">
              {mode === "targets"
                ? "Set your daily macro targets for this day"
                : "Enter the actual macros you consumed today"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 py-6">
            {macroFields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.name} className="space-y-2">
                  <Label
                    htmlFor={field.name}
                    className="text-sm font-bold text-high-vis uppercase flex items-center gap-2"
                  >
                    <Icon className={cn("h-4 w-4", field.color)} />
                    {field.label}
                  </Label>
                  <div className="relative">
                    <Input
                      id={field.name}
                      type="number"
                      min="0"
                      step="1"
                      value={formData[field.name as keyof MacroInput] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.name]: parseInt(e.target.value) || 0,
                        })
                      }
                      className="bg-charcoal border-steel/30 text-high-vis pr-12"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-text">
                      {field.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-steel/30"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-tactical-red hover:bg-red-700 text-high-vis"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  SAVING...
                </>
              ) : (
                <>SAVE {mode === "targets" ? "TARGETS" : "ACTUALS"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
