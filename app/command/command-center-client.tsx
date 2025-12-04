"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import CoachInviteForm from "@/components/command/coach-invite-form";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/database.types";
import { useToast } from "@/hooks/use-toast";
import {
  BadgeCheck,
  Ban,
  ShieldPlus,
  Sword,
  Users,
  Radio,
  Target,
  Loader2,
} from "lucide-react";

type Profile = Tables<"profiles">;
type Invite = Tables<"coach_invites">;

interface CommandCenterClientProps {
  currentUserId: string;
  troops: Profile[];
  coaches: Profile[];
  invites: Invite[];
}

export default function CommandCenterClient({
  currentUserId,
  troops,
  coaches,
  invites,
}: CommandCenterClientProps) {
  const supabase = createClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"troops" | "officers">("troops");
  const [troopRows, setTroopRows] = useState<Profile[]>(troops);
  const [coachRows] = useState<Profile[]>(coaches);
  const [inviteRows, setInviteRows] = useState<Invite[]>(invites);
  const [search, setSearch] = useState("");
  const [banLoading, setBanLoading] = useState<string | null>(null);

  const pendingInvites = useMemo(
    () => inviteRows.filter((invite) => invite.status === "pending"),
    [inviteRows]
  );

  const filteredTroops = useMemo(() => {
    if (!search.trim()) return troopRows;
    const query = search.trim().toLowerCase();
    return troopRows.filter(
      (troop) =>
        troop.email.toLowerCase().includes(query) ||
        troop.role.toLowerCase().includes(query) ||
        troop.tier.toLowerCase().includes(query)
    );
  }, [troopRows, search]);

  const handleBanToggle = async (id: string, nextBanned: boolean) => {
    setBanLoading(id);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ banned: nextBanned })
        .eq("id", id);

      if (error) throw error;

      setTroopRows((prev) =>
        prev.map((troop) =>
          troop.id === id ? { ...troop, banned: nextBanned } : troop
        )
      );

      toast({
        title: nextBanned
          ? "Dishonorable discharge issued"
          : "Reinstatement approved",
        description: nextBanned
          ? "User has been locked out of operations."
          : "User restored to active duty.",
      });
    } catch (error: any) {
      toast({
        title: "Action failed",
        description: error.message || "Could not update status.",
        variant: "destructive",
      });
    } finally {
      setBanLoading(null);
    }
  };

  const handleInviteCreated = (invite: Invite) => {
    setInviteRows((prev) => {
      const existing = prev.find((item) => item.id === invite.id);
      if (existing) {
        return prev.map((item) => (item.id === invite.id ? invite : item));
      }
      return [invite, ...prev];
    });
  };

  return (
    <div className="space-y-8">
      <div className="rounded-sm border border-steel/40 bg-gradient-to-r from-gunmetal via-camo-black to-gunmetal p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_20px_60px_rgba(0,0,0,0.45)]">
        <p className="text-xs uppercase tracking-[0.4em] text-radar-green">
          Command Center
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-sm border border-radar-green/30 bg-radar-green/10 px-3 py-1 text-radar-green">
            <Radio className="h-4 w-4 animate-pulse" />
            Tactical HQ Online
          </div>
          <div className="flex items-center gap-2 text-muted-text">
            <Target className="h-4 w-4 text-tactical-red" />
            Admin clearance required
          </div>
        </div>
        <h1 className="mt-4 font-heading text-4xl font-black uppercase tracking-widest text-high-vis">
          COMMAND & CONTROL
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-steel">
          Direct every unit from a single console. Monitor troops, deploy
          officers, and keep the war room synchronized.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <IntelCard
            title="Troops enlisted"
            value={troopRows.length}
            icon={<Users className="h-5 w-5 text-radar-green" />}
          />
          <IntelCard
            title="Active officers"
            value={coachRows.length}
            icon={<ShieldPlus className="h-5 w-5 text-tactical-red" />}
          />
          <IntelCard
            title="Pending commissions"
            value={pendingInvites.length}
            icon={<Sword className="h-5 w-5 text-high-vis" />}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          variant={activeTab === "troops" ? "default" : "outline"}
          onClick={() => setActiveTab("troops")}
        >
          <Users className="h-4 w-4" />
          Troops
        </Button>
        <Button
          variant={activeTab === "officers" ? "default" : "outline"}
          onClick={() => setActiveTab("officers")}
        >
          <ShieldPlus className="h-4 w-4" />
          Officers
        </Button>
      </div>

      {activeTab === "troops" ? (
        <Card className="border-steel/40 bg-gunmetal">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
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
                onChange={(e) => setSearch(e.target.value)}
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
                      <td className="px-4 py-3 text-muted-text">
                        {troop.tier}
                      </td>
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
                          onClick={() =>
                            handleBanToggle(troop.id, !troop.banned)
                          }
                        >
                          {banLoading === troop.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : troop.banned ? (
                            <BadgeCheck className="h-4 w-4" />
                          ) : (
                            <Ban className="h-4 w-4" />
                          )}
                          {troop.banned
                            ? "Reinstate"
                            : "Dishonorable Discharge"}
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
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
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
                  {coachRows.map((coach) => (
                    <tr key={coach.id} className="hover:bg-camo-black/50">
                      <td className="px-4 py-3 font-medium text-high-vis">
                        {coach.email}
                      </td>
                      <td className="px-4 py-3 text-muted-text">
                        {coach.tier}
                      </td>
                      <td className="px-4 py-3 text-muted-text">
                        {formatTimestamp(coach.last_active)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge banned={!!coach.banned} />
                      </td>
                    </tr>
                  ))}
                  {coachRows.length === 0 && (
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

          <div className="space-y-6">
            <Card className="border-steel/40 bg-gradient-to-b from-gunmetal to-camo-black">
              <CardHeader>
                <CardTitle>COMMISSION OFFICER</CardTitle>
                <CardDescription>
                  Send classified orders via Resend. Invitees will bypass the
                  Day Zero gauntlet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CoachInviteForm
                  invitedBy={currentUserId}
                  onInviteCreated={handleInviteCreated}
                />
              </CardContent>
            </Card>

            <Card className="border-steel/40 bg-gunmetal">
              <CardHeader>
                <CardTitle>PENDING COMMISSIONS</CardTitle>
                <CardDescription>
                  Draft notices awaiting acceptance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingInvites.length === 0 && (
                  <p className="text-sm text-muted-text">
                    No pending invitations. Issue a draft to fill the ranks.
                  </p>
                )}
                {pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between rounded-sm border border-steel/30 bg-camo-black px-3 py-2"
                  >
                    <div>
                      <p className="font-medium text-high-vis">{invite.email}</p>
                      <p className="text-xs text-muted-text">
                        Issued {formatTimestamp(invite.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-radar-green">
                      <Sword className="h-4 w-4" />
                      Awaiting acceptance
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
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

function IntelCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-sm border border-steel/30 bg-camo-black/70 p-4">
      <div className="flex items-center justify-between text-muted-text">
        <span className="text-xs uppercase">{title}</span>
        {icon}
      </div>
      <p className="mt-2 font-heading text-3xl font-black text-high-vis">
        {value}
      </p>
    </div>
  );
}
