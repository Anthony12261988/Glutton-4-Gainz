"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Eye,
  Shield,
  TrendingUp,
  Flame,
  Award,
  Target,
  Calendar,
  Mail,
} from "lucide-react";

interface SpyModeProfileProps {
  soldier: any;
  recentLogs: any[];
  badges: any[];
}

export default function SpyModeProfile({
  soldier,
  recentLogs,
  badges,
}: SpyModeProfileProps) {
  const router = useRouter();

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-steel hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Roster
        </Button>

        <div className="flex items-center gap-2 rounded-sm border border-orange-500 bg-orange-500/10 px-3 py-1">
          <Eye className="h-4 w-4 text-orange-500" />
          <span className="font-heading font-bold text-orange-500 uppercase text-sm">
            Spy Mode Active
          </span>
        </div>
      </div>

      {/* Soldier Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-tactical-red" />
            Soldier Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-steel/60 uppercase tracking-wide mb-1">
                Full Name
              </p>
              <p className="text-lg font-bold text-white">{soldier.full_name}</p>
            </div>

            <div>
              <p className="text-xs text-steel/60 uppercase tracking-wide mb-1">
                Email
              </p>
              <p className="text-sm text-steel flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {soldier.email}
              </p>
            </div>

            <div>
              <p className="text-xs text-steel/60 uppercase tracking-wide mb-1">
                Tier
              </p>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-tactical-red/10 border border-tactical-red/20 text-sm font-bold text-tactical-red">
                <TrendingUp className="h-4 w-4" />
                {soldier.tier}
              </span>
            </div>

            <div>
              <p className="text-xs text-steel/60 uppercase tracking-wide mb-1">
                Role
              </p>
              <p className="text-sm text-white capitalize">{soldier.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Flame className="h-8 w-8 text-orange-500 mb-2" />
              <p className="text-2xl font-black text-white">
                {soldier.current_streak || 0}
              </p>
              <p className="text-xs text-steel/60 uppercase tracking-wide">
                Day Streak
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Target className="h-8 w-8 text-radar-green mb-2" />
              <p className="text-2xl font-black text-white">
                {soldier.workout_count || 0}
              </p>
              <p className="text-xs text-steel/60 uppercase tracking-wide">
                Workouts
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Award className="h-8 w-8 text-yellow-500 mb-2" />
              <p className="text-2xl font-black text-white">{soldier.xp || 0}</p>
              <p className="text-xs text-steel/60 uppercase tracking-wide">
                Total XP
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Shield className="h-8 w-8 text-tactical-red mb-2" />
              <p className="text-2xl font-black text-white">{badges.length}</p>
              <p className="text-xs text-steel/60 uppercase tracking-wide">
                Badges
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-radar-green" />
            Recent Workout Logs (Last 10)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-steel/60 text-center py-8">
              No workout logs yet
            </p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-sm border border-steel/20 bg-gunmetal-light"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {new Date(log.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    {log.notes && (
                      <p className="text-xs text-steel/60 mt-1">{log.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-steel/60">Duration</p>
                    <p className="text-sm font-bold text-white">
                      {log.duration} min
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Earned Badges ({badges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <p className="text-sm text-steel/60 text-center py-8">
              No badges earned yet
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {badges.map((badge: any) => (
                <div
                  key={badge.id}
                  className="p-4 rounded-sm border border-radar-green/20 bg-radar-green/5 text-center"
                >
                  <Award className="h-8 w-8 text-radar-green mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">{badge.name}</p>
                  <p className="text-xs text-steel/60 mt-1">
                    {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
