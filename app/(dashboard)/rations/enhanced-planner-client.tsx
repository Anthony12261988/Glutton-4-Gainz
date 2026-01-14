"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MacroTracker } from "@/components/meal-planner/macro-tracker";
import { MealCalendar } from "@/components/meal-planner/meal-calendar";
import { TemplateManager } from "@/components/meal-planner/template-manager";
import { ShoppingListGenerator } from "@/components/meal-planner/shopping-list";
import { Calendar, FileText, ShoppingCart, ArrowLeft } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface Recipe {
  id: string;
  title: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface EnhancedPlannerClientProps {
  user: User;
  recipes: Recipe[];
  onBack?: () => void;
}

type Tab = "calendar" | "templates" | "shopping";

export default function EnhancedPlannerClient({
  user,
  recipes,
  onBack,
}: EnhancedPlannerClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("calendar");
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split("T")[0]);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleRefresh() {
    setRefreshKey((prev) => prev + 1);
  }

  const tabs = [
    { id: "calendar" as Tab, label: "Calendar", icon: Calendar },
    { id: "templates" as Tab, label: "Templates", icon: FileText },
    { id: "shopping" as Tab, label: "Shopping Lists", icon: ShoppingCart },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {onBack && (
        <Button
          variant="outline"
          onClick={onBack}
          className="border-steel/20 hover:bg-steel/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Basic Planner
        </Button>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-high-vis mb-2">Enhanced Meal Planner</h1>
        <p className="text-steel">
          Advanced meal planning with templates, macro tracking, and shopping lists
        </p>
      </div>

      {/* Macro Tracker */}
      <MacroTracker key={`macro-${refreshKey}`} userId={user.id} date={currentDate} />

      {/* Tabs */}
      <Card className="bg-gunmetal border-steel/20">
        <CardContent className="p-0">
          <div className="flex border-b border-steel/20">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-6 py-4
                    font-medium transition-colors relative
                    ${
                      isActive
                        ? "text-high-vis bg-steel/5"
                        : "text-steel hover:text-high-vis hover:bg-steel/5"
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-radar-green" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === "calendar" && (
          <MealCalendar
            key={`calendar-${refreshKey}`}
            userId={user.id}
            recipes={recipes}
            onAddRecipe={() => {
              // Could add a modal to create new recipes
              console.log("Add recipe functionality");
            }}
          />
        )}

        {activeTab === "templates" && (
          <TemplateManager
            key={`templates-${refreshKey}`}
            userId={user.id}
            onApplied={handleRefresh}
          />
        )}

        {activeTab === "shopping" && (
          <ShoppingListGenerator key={`shopping-${refreshKey}`} userId={user.id} />
        )}
      </div>

      {/* Instructions */}
      <Card className="bg-gunmetal border-steel/20">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-high-vis mb-3">Quick Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-steel">
            <div>
              <h4 className="font-medium text-high-vis mb-1">Calendar</h4>
              <p>
                Drag recipes from the left panel into calendar slots. Support for up to 6 meals per
                day (3 main meals + 3 snacks).
              </p>
            </div>
            <div>
              <h4 className="font-medium text-high-vis mb-1">Templates</h4>
              <p>
                Save your current week as a reusable template. Apply templates to quickly populate
                future weeks.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-high-vis mb-1">Shopping Lists</h4>
              <p>
                Generate shopping lists from any date range. Ingredients are automatically grouped
                by category.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Instructions */}
      <div className="block md:hidden">
        <Card className="bg-gunmetal border-steel/20 border-tactical-red/20">
          <CardContent className="p-4">
            <p className="text-xs text-steel">
              <strong className="text-high-vis">Mobile Tip:</strong> For the best drag-and-drop
              experience on the calendar, use this feature on a desktop or tablet device.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
