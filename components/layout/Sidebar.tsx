"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Crosshair,
  Utensils,
  BarChart3,
  Shield,
  Zap,
  Dumbbell,
  LogOut,
} from "lucide-react";

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
    icon: <Shield className="h-5 w-5" />,
    coachOnly: true,
  },
];

const adminNavItems: NavItem[] = [
  {
    href: "/command",
    label: "Command",
    icon: <Zap className="h-5 w-5" />,
  },
  {
    href: "/barracks",
    label: "Barracks",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    href: "/library",
    label: "Library",
    icon: <Dumbbell className="h-5 w-5" />,
  },
  {
    href: "/rations",
    label: "Rations",
    icon: <Utensils className="h-5 w-5" />,
  },
];

export interface SidebarProps {
  className?: string;
  isCoach?: boolean;
  isAdmin?: boolean;
}

export function Sidebar({
  className,
  isCoach = false,
  isAdmin = false,
}: SidebarProps) {
  const pathname = usePathname();

  // Build navigation based on role
  let displayItems: NavItem[] = [];

  if (isAdmin) {
    // Admins see only admin-specific navigation (Command is their main page)
    displayItems = [...adminNavItems];
  } else if (isCoach) {
    // Coaches see: Barracks first, then Library, Rations, Profile
    displayItems = [
      ...coachNavItems,
      ...userNavItems.filter((item) => !item.hideForCoach),
    ];
  } else {
    // Regular users see standard nav
    displayItems = [...userNavItems];
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-steel bg-camo-black md:block",
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo / Branding */}
        <div className="border-b border-steel p-6">
          <Link href={isAdmin ? "/command" : isCoach ? "/barracks" : "/dashboard"} className="flex items-center gap-3">
            <div className="rounded-sm bg-tactical-red p-2">
              <Crosshair className="h-6 w-6 text-high-vis" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold uppercase tracking-wider text-high-vis">
                G4G
              </h1>
              <p className="text-xs text-muted-text">Tactical Fitness</p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 p-4">
          {displayItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-sm px-4 py-3 transition-all",
                  isActive
                    ? "bg-tactical-red/10 text-tactical-red border-l-4 border-tactical-red"
                    : "text-steel hover:bg-gunmetal hover:text-high-vis"
                )}
              >
                <span
                  className={cn(isActive && "scale-110 transition-transform")}
                >
                  {item.icon}
                </span>
                <span className="font-heading text-sm font-bold uppercase tracking-wide">
                  {item.label}
                </span>
                {item.coachOnly && (
                  <span className="ml-auto rounded bg-tactical-red/20 px-2 py-0.5 text-[10px] font-bold text-tactical-red">
                    COACH
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer with Logout */}
        <div className="border-t border-steel p-4 space-y-3">
          <Link
            href="/auth/signout"
            className="flex items-center gap-3 rounded-sm px-4 py-3 text-steel hover:bg-tactical-red/10 hover:text-tactical-red transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-heading text-sm font-bold uppercase tracking-wide">
              Logout
            </span>
          </Link>
          <p className="text-center text-xs text-muted-text">
            © 2025 Glutton4Games
          </p>
        </div>
      </div>
    </aside>
  );
}
