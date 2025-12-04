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
  {
    href: "/barracks",
    label: "Barracks",
    icon: <Shield className="h-5 w-5 text-tactical-red" />,
  },
];

export interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-steel bg-camo-black/95 backdrop-blur-sm md:top-0 md:bottom-auto",
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-around px-4 py-2 md:justify-start md:gap-8 md:px-8 md:py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 transition-colors md:flex-row md:gap-2",
                isActive
                  ? "text-tactical-red"
                  : "text-steel hover:text-tactical-red"
              )}
            >
              <span
                className={cn(isActive && "scale-110 transition-transform")}
              >
                {item.icon}
              </span>
              <span className="font-heading text-[10px] font-bold uppercase tracking-wide md:text-xs">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
