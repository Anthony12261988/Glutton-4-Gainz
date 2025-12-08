"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Lock,
  Flame,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface LeaderboardEntry {
  id: string;
  email: string;
  xp: number;
  tier: string;
  current_streak: number;
  avatar_url: string | null;
}

interface LeaderboardClientProps {
  leaderboard: LeaderboardEntry[];
  currentUserId: string;
  userRank: number;
  isPremium: boolean;
  userXp: number;
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 0:
      return <Crown className="h-6 w-6 text-yellow-400" />;
    case 1:
      return <Medal className="h-6 w-6 text-gray-300" />;
    case 2:
      return <Award className="h-6 w-6 text-amber-600" />;
    default:
      return (
        <span className="font-heading text-lg font-bold text-steel">
          {rank + 1}
        </span>
      );
  }
}

function getRankBgColor(rank: number) {
  switch (rank) {
    case 0:
      return "bg-yellow-400/10 border-yellow-400/30";
    case 1:
      return "bg-gray-300/10 border-gray-300/30";
    case 2:
      return "bg-amber-600/10 border-amber-600/30";
    default:
      return "bg-gunmetal border-steel/20";
  }
}

// Extract display name from email
function getDisplayName(email: string): string {
  const name = email.split("@")[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function LeaderboardClient({
  leaderboard,
  currentUserId,
  userRank,
  isPremium,
  userXp,
}: LeaderboardClientProps) {
  if (!isPremium) {
    return (
      <div className="space-y-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
              SQUAD LEADERBOARD
            </h1>
            <p className="text-sm text-muted-text">Top soldiers by XP</p>
          </div>
          <div className="rounded-sm border border-tactical-red bg-tactical-red/10 p-2">
            <Trophy className="h-6 w-6 text-tactical-red" />
          </div>
        </div>

        {/* Premium Lock */}
        <Card className="border-steel/30 bg-gunmetal">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 w-fit rounded-full border border-steel bg-black/30 p-4">
              <Lock className="h-8 w-8 text-steel" />
            </div>
            <h3 className="font-heading text-xl font-bold text-high-vis mb-2">
              PREMIUM INTEL REQUIRED
            </h3>
            <p className="text-muted-text mb-6 max-w-md mx-auto">
              Upgrade to Premium to access the Squad Leaderboard and see how you
              rank against other soldiers.
            </p>
            <Link href="/pricing">
              <Button className="bg-tactical-red hover:bg-red-700">
                <TrendingUp className="mr-2 h-4 w-4" />
                Upgrade to Premium
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
            SQUAD LEADERBOARD
          </h1>
          <p className="text-sm text-muted-text">Top soldiers by XP</p>
        </div>
        <div className="rounded-sm border border-tactical-red bg-tactical-red/10 p-2">
          <Trophy className="h-6 w-6 text-tactical-red" />
        </div>
      </div>

      {/* Your Rank Card */}
      <Card className="border-radar-green/30 bg-radar-green/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-radar-green bg-radar-green/20">
                <span className="font-heading text-xl font-bold text-radar-green">
                  {userRank >= 0 ? userRank + 1 : "-"}
                </span>
              </div>
              <div>
                <p className="font-heading font-bold text-radar-green">
                  YOUR RANK
                </p>
                <p className="text-sm text-muted-text">
                  {userXp.toLocaleString()} XP
                </p>
              </div>
            </div>
            {userRank > 0 && leaderboard[userRank - 1] && (
              <div className="text-right">
                <p className="text-xs text-muted-text">XP to next rank</p>
                <p className="font-heading font-bold text-high-vis">
                  {(leaderboard[userRank - 1].xp - userXp).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {/* 2nd Place */}
          <Card className={`${getRankBgColor(1)} mt-8`}>
            <CardContent className="py-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center">
                {getRankIcon(1)}
              </div>
              <p className="font-heading text-sm font-bold text-high-vis truncate">
                {getDisplayName(leaderboard[1].email)}
              </p>
              <p className="text-xs text-muted-text">{leaderboard[1].tier}</p>
              <p className="font-heading text-lg font-bold text-gray-300">
                {leaderboard[1].xp.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {/* 1st Place */}
          <Card className={`${getRankBgColor(0)}`}>
            <CardContent className="py-6 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center">
                {getRankIcon(0)}
              </div>
              <p className="font-heading font-bold text-high-vis truncate">
                {getDisplayName(leaderboard[0].email)}
              </p>
              <p className="text-xs text-muted-text">{leaderboard[0].tier}</p>
              <p className="font-heading text-xl font-bold text-yellow-400">
                {leaderboard[0].xp.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {/* 3rd Place */}
          <Card className={`${getRankBgColor(2)} mt-8`}>
            <CardContent className="py-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center">
                {getRankIcon(2)}
              </div>
              <p className="font-heading text-sm font-bold text-high-vis truncate">
                {getDisplayName(leaderboard[2].email)}
              </p>
              <p className="text-xs text-muted-text">{leaderboard[2].tier}</p>
              <p className="font-heading text-lg font-bold text-amber-600">
                {leaderboard[2].xp.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full Leaderboard List */}
      <div className="space-y-2">
        {leaderboard.slice(3).map((entry, index) => {
          const rank = index + 3;
          const isCurrentUser = entry.id === currentUserId;

          return (
            <Card
              key={entry.id}
              className={`${
                isCurrentUser
                  ? "border-radar-green/30 bg-radar-green/5"
                  : "border-steel/20 bg-gunmetal"
              }`}
            >
              <CardContent className="py-3">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex h-8 w-8 items-center justify-center">
                    {getRankIcon(rank)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <p
                      className={`font-heading font-bold ${
                        isCurrentUser ? "text-radar-green" : "text-high-vis"
                      }`}
                    >
                      {getDisplayName(entry.email)}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-radar-green">
                          (YOU)
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-text">
                      <span>{entry.tier}</span>
                      {entry.current_streak > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Flame className="h-3 w-3 text-orange-500" />
                            {entry.current_streak} day streak
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right">
                    <p
                      className={`font-heading font-bold ${
                        isCurrentUser ? "text-radar-green" : "text-tactical-red"
                      }`}
                    >
                      {entry.xp.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-text">XP</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {leaderboard.length === 0 && (
        <Card className="border-steel/20 bg-gunmetal">
          <CardContent className="py-12 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-steel" />
            <p className="text-muted-text">
              No rankings yet. Complete workouts to earn XP!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
