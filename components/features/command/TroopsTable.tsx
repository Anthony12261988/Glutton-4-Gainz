"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BadgeCheck, Ban, Loader2, UserPlus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/lib/types/database.types";

type Profile = Tables<"profiles">;

interface TroopsTableProps {
  troops: Profile[];
  coaches: Profile[];
  search: string;
  onSearchChange: (value: string) => void;
  currentUserId: string;
  onBanToggle: (id: string, banned: boolean) => Promise<void>;
  onCoachAssign: (userId: string, coachId: string | null) => Promise<void>;
  banLoading: string | null;
  assignLoading: string | null;
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
  coaches,
  search,
  onSearchChange,
  currentUserId,
  onBanToggle,
  onCoachAssign,
  banLoading,
  assignLoading,
}: TroopsTableProps) {
  const { toast } = useToast();
  const [selectedCoach, setSelectedCoach] = useState<Record<string, string>>(
    {}
  );

  const filteredTroops = troops.filter((troop) => {
    // Filter out coaches and admins - only show regular users/soldiers
    if (troop.role === "coach" || troop.role === "admin") return false;
    if (!search.trim()) return true;
    const query = search.trim().toLowerCase();
    return (
      troop.email.toLowerCase().includes(query) ||
      troop.role.toLowerCase().includes(query) ||
      troop.tier.toLowerCase().includes(query)
    );
  });

  const getCoachName = (coachId: string | null) => {
    if (!coachId) return null;
    const coach = coaches.find((c) => c.id === coachId);
    return coach?.email?.split("@")[0] || "Unknown";
  };

  const handleAssignCoach = async (userId: string) => {
    const coachId = selectedCoach[userId];
    if (!coachId) {
      toast({
        title: "Select a coach",
        description: "Please select a coach from the dropdown first.",
        variant: "destructive",
      });
      return;
    }
    await onCoachAssign(userId, coachId);
    setSelectedCoach((prev) => ({ ...prev, [userId]: "" }));
  };

  return (
    <Card className="border-steel/40 bg-gunmetal">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
        <div>
          <CardTitle>TROOP ROSTER</CardTitle>
          <CardDescription>
            Assign soldiers to coaches and manage their status.
          </CardDescription>
        </div>
        <div className="flex w-full flex-col gap-2 md:w-96 lg:max-w-lg">
          <Input
            placeholder="Filter by email, role, or tier"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-camo-black text-high-vis"
          />
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-steel/30 text-left text-xs uppercase tracking-wide text-muted-text">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Assigned Coach</th>
                <th className="px-4 py-3">Last Active</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel/20">
              {filteredTroops.map((troop) => {
                const disableBan =
                  troop.id === currentUserId || troop.role === "admin";
                const currentCoach = getCoachName(troop.coach_id);

                return (
                  <tr key={troop.id} className="hover:bg-camo-black/50">
                    <td className="px-4 py-3 font-medium text-high-vis">
                      {troop.email}
                    </td>
                    <td className="px-4 py-3 text-muted-text">{troop.tier}</td>
                    <td className="px-4 py-3">
                      {currentCoach ? (
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-radar-green/20 px-2 py-1 text-xs font-bold text-radar-green">
                            {currentCoach}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-text hover:text-tactical-red"
                            onClick={() => onCoachAssign(troop.id, null)}
                            disabled={assignLoading === troop.id}
                          >
                            {assignLoading === troop.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select
                            className="rounded border border-steel/30 bg-camo-black px-2 py-1 text-xs text-high-vis"
                            value={selectedCoach[troop.id] || ""}
                            onChange={(e) =>
                              setSelectedCoach((prev) => ({
                                ...prev,
                                [troop.id]: e.target.value,
                              }))
                            }
                          >
                            <option value="">Select coach...</option>
                            {coaches.map((coach) => (
                              <option key={coach.id} value={coach.id}>
                                {coach.email?.split("@")[0]}
                              </option>
                            ))}
                          </select>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => handleAssignCoach(troop.id)}
                            disabled={
                              !selectedCoach[troop.id] ||
                              assignLoading === troop.id
                            }
                          >
                            {assignLoading === troop.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <UserPlus className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      )}
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
                        <span className="ml-1 hidden lg:inline">
                          {troop.banned ? "Reinstate" : "Ban"}
                        </span>
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
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {filteredTroops.length === 0 ? (
            <div className="px-4 py-6 text-center text-muted-text">
              No troops match this filter.
            </div>
          ) : (
            filteredTroops.map((troop) => {
              const disableBan =
                troop.id === currentUserId || troop.role === "admin";
              const currentCoach = getCoachName(troop.coach_id);

              return (
                <div
                  key={troop.id}
                  className="rounded-sm border border-steel/30 bg-camo-black p-4 space-y-3"
                >
                  {/* Email & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-high-vis text-sm truncate">
                        {troop.email}
                      </p>
                      <p className="text-xs text-muted-text">
                        Tier: {troop.tier}
                      </p>
                    </div>
                    <StatusBadge banned={!!troop.banned} />
                  </div>

                  {/* Last Active */}
                  <div className="text-xs text-muted-text">
                    Last active: {formatTimestamp(troop.last_active)}
                  </div>

                  {/* Assigned Coach */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wide text-muted-text">
                      Assigned Coach
                    </label>
                    {currentCoach ? (
                      <div className="flex items-center gap-2">
                        <span className="flex-1 rounded-full bg-radar-green/20 px-3 py-2 text-xs font-bold text-radar-green text-center">
                          {currentCoach}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 text-muted-text hover:text-tactical-red"
                          onClick={() => onCoachAssign(troop.id, null)}
                          disabled={assignLoading === troop.id}
                        >
                          {assignLoading === troop.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <select
                          className="flex-1 rounded border border-steel/30 bg-gunmetal px-3 py-2 text-sm text-high-vis min-h-[44px]"
                          value={selectedCoach[troop.id] || ""}
                          onChange={(e) =>
                            setSelectedCoach((prev) => ({
                              ...prev,
                              [troop.id]: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select coach...</option>
                          {coaches.map((coach) => (
                            <option key={coach.id} value={coach.id}>
                              {coach.email?.split("@")[0]}
                            </option>
                          ))}
                        </select>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-auto px-3 py-2 min-h-[44px]"
                          onClick={() => handleAssignCoach(troop.id)}
                          disabled={
                            !selectedCoach[troop.id] ||
                            assignLoading === troop.id
                          }
                        >
                          {assignLoading === troop.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserPlus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Ban/Reinstate Button */}
                  <Button
                    variant={troop.banned ? "secondary" : "destructive"}
                    size="sm"
                    className="w-full min-h-[44px]"
                    disabled={disableBan || banLoading === troop.id}
                    onClick={() => onBanToggle(troop.id, !troop.banned)}
                  >
                    {banLoading === troop.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : troop.banned ? (
                      <>
                        <BadgeCheck className="h-4 w-4 mr-2" />
                        Reinstate
                      </>
                    ) : (
                      <>
                        <Ban className="h-4 w-4 mr-2" />
                        Ban
                      </>
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
