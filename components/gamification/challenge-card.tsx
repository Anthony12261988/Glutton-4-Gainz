"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Calendar, Target, Users } from "lucide-react";
import { joinChallenge, leaveChallenge } from "@/lib/queries/challenges";
import { useToast } from "@/hooks/use-toast";

export function ChallengeCard({ challenge, userParticipation, onUpdate }: any) {
  const { toast } = useToast();
  const isJoined = !!userParticipation;
  const progress = userParticipation?.progress || 0;
  const progressPercent = Math.min((progress / challenge.target_value) * 100, 100);

  async function handleJoin() {
    const { error } = await joinChallenge(challenge.id);
    if (error) {
      toast({ title: "JOIN FAILED", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "CHALLENGE JOINED", description: "Good luck, soldier!" });
      onUpdate();
    }
  }

  async function handleLeave() {
    if (!confirm("Leave this challenge? Your progress will be lost.")) return;

    const { error } = await leaveChallenge(challenge.id);
    if (error) {
      toast({ title: "LEAVE FAILED", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "CHALLENGE LEFT", description: "You've left the challenge." });
      onUpdate();
    }
  }

  return (
    <Card className="bg-gunmetal border-steel/20">
      <CardHeader>
        <CardTitle className="text-high-vis flex items-center gap-2">
          <Trophy className="h-5 w-5 text-high-vis" />
          {challenge.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-text">{challenge.description}</p>

        <div className="flex items-center gap-2 text-xs text-steel">
          <Calendar className="h-3 w-3" />
          {new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}
        </div>

        <div className="flex items-center gap-2 text-xs text-steel">
          <Target className="h-3 w-3" />
          Target: {challenge.target_value} {challenge.challenge_type?.replace('_', ' ')}
        </div>

        {challenge.participants_count && (
          <div className="flex items-center gap-2 text-xs text-steel">
            <Users className="h-3 w-3" />
            {challenge.participants_count[0]?.count || 0} participants
          </div>
        )}

        {isJoined ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-text">Progress</span>
              <span className="text-high-vis font-bold">
                {progress} / {challenge.target_value}
              </span>
            </div>
            <Progress value={progressPercent} className="bg-gunmetal" />
            {userParticipation.completed && (
              <p className="text-xs text-radar-green font-bold">✓ COMPLETED</p>
            )}
            {!userParticipation.completed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLeave}
                className="w-full text-tactical-red hover:bg-tactical-red/10"
              >
                Leave Challenge
              </Button>
            )}
          </div>
        ) : (
          <Button
            onClick={handleJoin}
            className="w-full bg-tactical-red hover:bg-red-700"
          >
            Join Challenge
          </Button>
        )}

        {challenge.badge_reward && (
          <div className="bg-high-vis/5 border border-high-vis/20 rounded-sm p-2">
            <p className="text-xs text-high-vis">
              🏆 Reward: {challenge.badge_reward} Badge
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
