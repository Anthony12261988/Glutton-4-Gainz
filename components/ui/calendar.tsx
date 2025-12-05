"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center h-10",
        caption_label: "text-sm font-medium text-high-vis hidden",
        dropdowns: "flex gap-2 justify-center",
        dropdown: "bg-gunmetal border border-steel/30 rounded px-2 py-1 text-sm text-high-vis focus:outline-none focus:ring-1 focus:ring-tactical-red",
        nav: "flex items-center gap-1",
        button_previous: cn(
          "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 border border-steel/30 rounded inline-flex items-center justify-center hover:bg-steel/20 text-high-vis"
        ),
        button_next: cn(
          "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 border border-steel/30 rounded inline-flex items-center justify-center hover:bg-steel/20 text-high-vis"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-muted-text w-9 font-normal text-[0.8rem] text-center",
        week: "flex w-full mt-2",
        day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-tactical-red/20 [&:has([aria-selected])]:rounded-md",
        day_button: cn(
          "h-9 w-9 p-0 font-normal rounded-md inline-flex items-center justify-center text-high-vis hover:bg-steel/20 focus:outline-none focus:ring-1 focus:ring-tactical-red aria-selected:bg-tactical-red aria-selected:text-white aria-selected:hover:bg-tactical-red/90"
        ),
        range_end: "day-range-end",
        selected: "bg-tactical-red text-white hover:bg-tactical-red/90",
        today: "bg-olive-drab/30 text-high-vis",
        outside: "text-muted-text/50 aria-selected:bg-tactical-red/50 aria-selected:text-white/80",
        disabled: "text-muted-text/30 cursor-not-allowed",
        range_middle: "aria-selected:bg-tactical-red/20",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
