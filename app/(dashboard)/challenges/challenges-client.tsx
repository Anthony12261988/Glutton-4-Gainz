"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getUserChallenges } from "@/lib/queries/challenges";
import { ChallengeCard } from "@/components/gamification/challenge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target } from "lucide-react";

export default function ChallengesClient({ challenges, userId }: any) {
  const [userChallenges, setUserChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserChallenges();
  }, [userId]);

  async function loadUserChallenges() {
    const { data } = await getUserChallenges(userId);
    setUserChallenges(data || []);
    setLoading(false);
  }

  const activeChallenges = challenges.filter((c: any) => c.status === 'active');
  const myActiveChallenges = userChallenges.filter((uc: any) =>
    uc.challenge?.status === 'active' && !uc.completed
  );
  const myCompletedChallenges = userChallenges.filter((uc: any) => uc.completed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
          Challenges
        </h1>
        <p className="text-sm text-muted-text">
          Join community challenges and earn badges
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="bg-gunmetal border border-steel/20">
          <TabsTrigger value="available" className="data-[state=active]:bg-tactical-red">
            <Target className="h-4 w-4 mr-2" />
            Available
          </TabsTrigger>
          <TabsTrigger value="my-challenges" className="data-[state=active]:bg-tactical-red">
            <Trophy className="h-4 w-4 mr-2" />
            My Challenges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4 mt-6">
          {activeChallenges.length === 0 ? (
            <div className="text-center py-12">
              <Image
                src="/imageAssests/Branding/Glutton4Gainz FF_Highlight Icon Coaching.png"
                alt="Challenges"
                width={120}
                height={120}
                className="mx-auto mb-4 opacity-60"
              />
              <p className="text-muted-text">No active challenges at the moment.</p>
            </div>
          ) : (
            activeChallenges.map((challenge: any) => {
              const participation = userChallenges.find((uc: any) => uc.challenge_id === challenge.id);
              return (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  userParticipation={participation}
                  onUpdate={loadUserChallenges}
                />
              );
            })
          )}
        </TabsContent>

        <TabsContent value="my-challenges" className="space-y-4 mt-6">
          {loading ? (
            <p className="text-center text-muted-text">Loading your challenges...</p>
          ) : (
            <>
              {myActiveChallenges.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-high-vis">Active</h3>
                  {myActiveChallenges.map((uc: any) => (
                    <ChallengeCard
                      key={uc.id}
                      challenge={uc.challenge}
                      userParticipation={uc}
                      onUpdate={loadUserChallenges}
                    />
                  ))}
                </div>
              )}

              {myCompletedChallenges.length > 0 && (
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-bold text-high-vis">Completed</h3>
                  {myCompletedChallenges.map((uc: any) => (
                    <ChallengeCard
                      key={uc.id}
                      challenge={uc.challenge}
                      userParticipation={uc}
                      onUpdate={loadUserChallenges}
                    />
                  ))}
                </div>
              )}

              {myActiveChallenges.length === 0 && myCompletedChallenges.length === 0 && (
                <div className="text-center py-12">
                  <Image
                    src="/imageAssests/Branding/Glutton4Gainz FF_Highlight Icon Inspiration.png"
                    alt="Join challenges"
                    width={120}
                    height={120}
                    className="mx-auto mb-4 opacity-60"
                  />
                  <p className="text-muted-text">You haven't joined any challenges yet.</p>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
