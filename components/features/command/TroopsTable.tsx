"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BadgeCheck, Ban, Loader2 } from "lucide-react";
import type { Tables } from "@/lib/types/database.types";

type Profile = Tables<"profiles">;

interface TroopsTableProps {
  troops: Profile[];
  search: string;
  onSearchChange: (value: string) => void;
  currentUserId: string;
  onBanToggle: (id: string, banned: boolean) => Promise<void>;
  banLoading: string | null;
}

function StatusBadge({ banned }: { banned: boolean }) {
  return banned ? (
    <span className="inline-flex rounded-full bg-tactical-red/20 px-2 py-1 text-xs font-bold text-tactical-red">
      BANNED
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-radar-green/20 px-2 py-1 text-xs font-bold text-radar-green">
      ACTIVE
    </span>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

export function TroopsTable({
  troops,
  search,
  onSearchChange,
  currentUserId,
  onBanToggle,
  banLoading,
}: TroopsTableProps) {
  const filteredTroops = troops.filter((troop) => {
    if (!search.trim()) return true;
    const query = search.trim().toLowerCase();
    return (
      troop.email.toLowerCase().includes(query) ||
      troop.role.toLowerCase().includes(query) ||
      troop.tier.toLowerCase().includes(query)
    );
  });

  return (
    <Card className="border-steel/40 bg-gunmetal">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
        <div>
          <CardTitle>TROOP ROSTER</CardTitle>
          <CardDescription>
            Full visibility of every soldier and their current status.
          </CardDescription>
        </div>
        <div className="flex w-full flex-col gap-2 md:w-80">
          <Input
            placeholder="Filter by email, role, or tier"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-camo-black text-high-vis"
          />
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-steel/30 text-left text-xs uppercase tracking-wide text-muted-text">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Last Active</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel/20">
            {filteredTroops.map((troop) => {
              const disableBan =
                troop.id === currentUserId || troop.role === "admin";
              return (
                <tr key={troop.id} className="hover:bg-camo-black/50">
                  <td className="px-4 py-3 font-medium text-high-vis">
                    {troop.email}
                  </td>
                  <td className="px-4 py-3 text-muted-text">{troop.tier}</td>
                  <td className="px-4 py-3 text-muted-text capitalize">
                    {troop.role}
                  </td>
                  <td className="px-4 py-3 text-muted-text">
                    {formatTimestamp(troop.last_active)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge banned={!!troop.banned} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant={troop.banned ? "secondary" : "destructive"}
                      size="sm"
                      disabled={disableBan || banLoading === troop.id}
                      onClick={() => onBanToggle(troop.id, !troop.banned)}
                    >
                      {banLoading === troop.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : troop.banned ? (
                        <BadgeCheck className="h-4 w-4" />
                      ) : (
                        <Ban className="h-4 w-4" />
                      )}
                      {troop.banned ? "Reinstate" : "Dishonorable Discharge"}
                    </Button>
                  </td>
                </tr>
              );
            })}
            {filteredTroops.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-muted-text"
                >
                  No troops match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
