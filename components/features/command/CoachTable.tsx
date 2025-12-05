"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Tables } from "@/lib/types/database.types";

type Profile = Tables<"profiles">;

interface CoachTableProps {
  coaches: Profile[];
}

function StatusBadge({ banned }: { banned: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-sm px-2 py-1 text-xs font-semibold uppercase ${
        banned
          ? "border border-tactical-red/40 bg-tactical-red/10 text-tactical-red"
          : "border border-radar-green/30 bg-radar-green/10 text-radar-green"
      }`}
    >
      {banned ? "Dishonorable" : "Active"}
    </span>
  );
}

function formatTimestamp(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CoachTable({ coaches }: CoachTableProps) {
  return (
    <Card className="lg:col-span-2 border-steel/40 bg-gunmetal">
      <CardHeader>
        <CardTitle>ACTIVE OFFICERS</CardTitle>
        <CardDescription>
          Coaches currently on duty and leading squads.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-steel/30 text-left text-xs uppercase tracking-wide text-muted-text">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Last Active</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel/20">
            {coaches.map((coach) => (
              <tr key={coach.id} className="hover:bg-camo-black/50">
                <td className="px-4 py-3 font-medium text-high-vis">
                  {coach.email}
                </td>
                <td className="px-4 py-3 text-muted-text">{coach.tier}</td>
                <td className="px-4 py-3 text-muted-text">
                  {formatTimestamp(coach.last_active)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge banned={!!coach.banned} />
                </td>
              </tr>
            ))}
            {coaches.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-muted-text"
                >
                  No officers commissioned yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
