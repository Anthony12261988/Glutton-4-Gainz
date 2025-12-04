"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface WeekCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  plannedDates: string[]; // Array of date strings 'YYYY-MM-DD' that have meals
}

export function WeekCalendar({
  selectedDate,
  onSelectDate,
  plannedDates,
}: WeekCalendarProps) {
  // Generate next 7 days starting from today
  const days = React.useMemo(() => {
    const result = [];
    const today = new Date();
    // Reset time to midnight for accurate comparison
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      result.push(date);
    }
    return result;
  }, []);

  const formatDateKey = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="flex w-full gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {days.map((date) => {
        const dateKey = formatDateKey(date);
        const isSelected = formatDateKey(selectedDate) === dateKey;
        const hasMeal = plannedDates.includes(dateKey);
        const isToday = formatDateKey(new Date()) === dateKey;

        return (
          <button
            key={dateKey}
            onClick={() => onSelectDate(date)}
            className={cn(
              "flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-sm border p-2 transition-all",
              isSelected
                ? "border-tactical-red bg-tactical-red/10"
                : "border-steel bg-gunmetal hover:border-tactical-red/50",
              isToday && !isSelected && "border-tactical-red/50"
            )}
          >
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                isSelected ? "text-tactical-red" : "text-muted-text"
              )}
            >
              {date.toLocaleDateString("en-US", { weekday: "short" })}
            </span>
            <span
              className={cn(
                "font-heading text-xl font-bold",
                isSelected ? "text-high-vis" : "text-steel"
              )}
            >
              {date.getDate()}
            </span>
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                hasMeal ? "bg-radar-green" : "bg-transparent"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
