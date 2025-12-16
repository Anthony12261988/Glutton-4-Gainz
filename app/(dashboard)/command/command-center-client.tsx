"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { TroopsTable } from "@/components/features/command/TroopsTable";
import { CoachTable } from "@/components/features/command/CoachTable";
import { InviteList } from "@/components/features/command/InviteList";
import { MotivationalCorner } from "@/components/gamification/motivational-corner";
import type { Tables } from "@/lib/types/database.types";
import { useToast } from "@/hooks/use-toast";
import { ShieldPlus, Sword, Users, Radio, Target, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";

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
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"troops" | "officers">("troops");
  const [troopRows, setTroopRows] = useState<Profile[]>(troops);
  const [coachRows] = useState<Profile[]>(coaches);
  const [inviteRows, setInviteRows] = useState<Invite[]>(invites);
  const [search, setSearch] = useState("");
  const [banLoading, setBanLoading] = useState<string | null>(null);
  const [assignLoading, setAssignLoading] = useState<string | null>(null);

  const pendingInvites = useMemo(
    () => inviteRows.filter((invite) => invite.status === "pending"),
    [inviteRows]
  );

  // Count only regular users (not coaches/admins)
  const soldierCount = useMemo(
    () =>
      troopRows.filter((t) => t.role !== "coach" && t.role !== "admin").length,
    [troopRows]
  );

  const handleBanToggle = async (id: string, nextBanned: boolean) => {
    setBanLoading(id);
    try {
      const response = await fetch("/api/admin/ban-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, banned: nextBanned }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update status");
      }

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

  const handleCoachAssign = async (userId: string, coachId: string | null) => {
    setAssignLoading(userId);
    try {
      const response = await fetch("/api/assign-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, coachId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to assign coach");
      }

      setTroopRows((prev) =>
        prev.map((troop) =>
          troop.id === userId ? { ...troop, coach_id: coachId } : troop
        )
      );

      toast({
        title: coachId ? "Coach assigned" : "Coach unassigned",
        description: coachId
          ? "Soldier has been assigned to their new officer."
          : "Soldier is now unassigned.",
      });
    } catch (error: any) {
      toast({
        title: "Assignment failed",
        description: error.message || "Could not assign coach.",
        variant: "destructive",
      });
    } finally {
      setAssignLoading(null);
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
      {/* Motivational Corner - Morning Briefing (First thing they see) */}
      <div className="space-y-3">
        <MotivationalCorner />
        {/* Quick action to manage briefings */}
        <div className="flex justify-end">
          <Link href="/barracks/content/briefing">
            <Button
              variant="outline"
              size="sm"
              className="border-tactical-red/30 text-tactical-red hover:bg-tactical-red/10"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Manage Briefings
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

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
            value={soldierCount}
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
        <TroopsTable
          troops={troopRows}
          coaches={coachRows}
          search={search}
          onSearchChange={setSearch}
          currentUserId={currentUserId}
          onBanToggle={handleBanToggle}
          onCoachAssign={handleCoachAssign}
          banLoading={banLoading}
          assignLoading={assignLoading}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <CoachTable coaches={coachRows} />
          <InviteList
            currentUserId={currentUserId}
            pendingInvites={pendingInvites}
            onInviteCreated={handleInviteCreated}
          />
        </div>
      )}
    </div>
  );
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
