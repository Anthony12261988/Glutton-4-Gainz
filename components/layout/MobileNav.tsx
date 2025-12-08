"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Crosshair, Utensils, BarChart3, Shield, Dumbbell } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  coachOnly?: boolean;
  hideForCoach?: boolean;
}

// Items for regular users
const userNavItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Missions",
    icon: <Crosshair className="h-5 w-5" />,
    hideForCoach: true,
  },
  {
    href: "/rations",
    label: "Rations",
    icon: <Utensils className="h-5 w-5" />,
  },
  {
    href: "/library",
    label: "Library",
    icon: <Dumbbell className="h-5 w-5" />,
  },
  {
    href: "/stats",
    label: "Intel",
    icon: <BarChart3 className="h-5 w-5" />,
    hideForCoach: true,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: <Shield className="h-5 w-5" />,
  },
];

const coachNavItems: NavItem[] = [
  {
    href: "/barracks",
    label: "Barracks",
    icon: <Shield className="h-5 w-5 text-tactical-red" />,
    coachOnly: true,
  },
];

export interface MobileNavProps {
  className?: string;
  isCoach?: boolean;
}

export function MobileNav({ className, isCoach = false }: MobileNavProps) {
  const pathname = usePathname();

  // Build navigation based on role
  let displayItems: NavItem[];

  if (isCoach) {
    // Coaches see: Barracks first, then Library, Rations, Profile (no Missions/Intel)
    displayItems = [
      ...coachNavItems,
      ...userNavItems.filter((item) => !item.hideForCoach),
    ];
  } else {
    // Regular users see standard nav
    displayItems = userNavItems;
  }

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-steel bg-camo-black/95 backdrop-blur-sm md:hidden",
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-around px-4 py-2">
        {displayItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 transition-colors",
                isActive
                  ? "text-tactical-red"
                  : "text-steel hover:text-tactical-red"
              )}
            >
              <span
                className={cn("transition-transform", isActive && "scale-110")}
              >
                {item.icon}
              </span>
              <span className="font-heading text-xs font-bold uppercase tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
