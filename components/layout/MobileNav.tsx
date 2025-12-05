"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Crosshair, Utensils, BarChart3, Shield } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  coachOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Missions",
    icon: <Crosshair className="h-5 w-5" />,
  },
  {
    href: "/rations",
    label: "Rations",
    icon: <Utensils className="h-5 w-5" />,
  },
  {
    href: "/stats",
    label: "Intel",
    icon: <BarChart3 className="h-5 w-5" />,
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

  const displayItems = isCoach ? [...navItems, ...coachNavItems] : navItems;

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
                className={cn(
                  "transition-transform",
                  isActive && "scale-110"
                )}
              >
                {item.icon}
              </span>
              <span className="font-heading text-[10px] font-bold uppercase tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
