"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Dumbbell, Play, Clock, Lock, Filter, X } from "lucide-react";
import Link from "next/link";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
}

interface Workout {
  id: string;
  title: string;
  description: string | null;
  tier: string;
  scheduled_date: string;
  video_url: string | null;
  sets_reps: Exercise[] | any;
}

interface WorkoutLibraryClientProps {
  workouts: Workout[];
  userTier: string;
  tiers: string[];
}

// Tier hierarchy for access control
const TIER_ORDER = [".223", ".308", ".50 Cal"];

function canAccessTier(userTier: string, workoutTier: string): boolean {
  const userIndex = TIER_ORDER.indexOf(userTier);
  const workoutIndex = TIER_ORDER.indexOf(workoutTier);
  // User can access their tier and below
  return workoutIndex <= userIndex;
}

export function WorkoutLibraryClient({
  workouts,
  userTier,
  tiers,
}: WorkoutLibraryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredWorkouts = useMemo(() => {
    return workouts.filter((workout) => {
      const matchesSearch =
        !searchQuery ||
        workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workout.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTier = !selectedTier || workout.tier === selectedTier;

      return matchesSearch && matchesTier;
    });
  }, [workouts, searchQuery, selectedTier]);

  // Group workouts by tier
  const groupedWorkouts = useMemo(() => {
    const groups: Record<string, Workout[]> = {};
    filteredWorkouts.forEach((workout) => {
      if (!groups[workout.tier]) {
        groups[workout.tier] = [];
      }
      groups[workout.tier].push(workout);
    });
    return groups;
  }, [filteredWorkouts]);

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
            WORKOUT LIBRARY
          </h1>
          <p className="text-sm text-muted-text">
            Browse all available missions
          </p>
        </div>
        <div className="rounded-sm border border-tactical-red bg-tactical-red/10 p-2">
          <Dumbbell className="h-6 w-6 text-tactical-red" />
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-text" />
            <Input
              placeholder="Search workouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gunmetal border-steel/30 pl-10"
            />
          </div>
          <Button
            variant="outline"
            className={`border-steel/30 ${
              showFilters ? "bg-tactical-red/20" : ""
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter Pills */}
        {showFilters && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedTier === null ? "default" : "outline"}
              className={
                selectedTier === null ? "bg-tactical-red" : "border-steel/30"
              }
              onClick={() => setSelectedTier(null)}
            >
              All Tiers
            </Button>
            {tiers.map((tier) => (
              <Button
                key={tier}
                size="sm"
                variant={selectedTier === tier ? "default" : "outline"}
                className={
                  selectedTier === tier ? "bg-tactical-red" : "border-steel/30"
                }
                onClick={() => setSelectedTier(tier)}
              >
                {tier}
              </Button>
            ))}
            {selectedTier && (
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-text"
                onClick={() => setSelectedTier(null)}
              >
                <X className="mr-1 h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-text">
        Showing {filteredWorkouts.length} of {workouts.length} workouts
      </p>

      {/* Grouped Workouts */}
      {TIER_ORDER.map((tier) => {
        const tierWorkouts = groupedWorkouts[tier];
        if (!tierWorkouts || tierWorkouts.length === 0) return null;

        const canAccess = canAccessTier(userTier, tier);

        return (
          <div key={tier} className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-high-vis">
                {tier}
              </h2>
              {!canAccess && (
                <span className="flex items-center gap-1 rounded-sm bg-steel/20 px-2 py-0.5 text-xs text-muted-text">
                  <Lock className="h-3 w-3" />
                  Premium
                </span>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tierWorkouts.map((workout) => (
                <Card
                  key={workout.id}
                  className={`border-steel/20 bg-gunmetal transition-all ${
                    canAccess
                      ? "hover:border-tactical-red/50 cursor-pointer"
                      : "opacity-60"
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg text-white">
                        {workout.title}
                      </CardTitle>
                      {!canAccess && <Lock className="h-4 w-4 text-steel" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {workout.description && (
                      <p className="text-sm text-muted-text mb-3 line-clamp-2">
                        {workout.description}
                      </p>
                    )}

                    {/* Exercise Preview */}
                    {Array.isArray(workout.sets_reps) &&
                      workout.sets_reps.length > 0 && (
                        <div className="mb-3 space-y-1">
                          {workout.sets_reps
                            .slice(0, 3)
                            .map((ex: Exercise, idx: number) => (
                              <p key={idx} className="text-xs text-steel">
                                • {ex.name} - {ex.sets}×{ex.reps}
                              </p>
                            ))}
                          {workout.sets_reps.length > 3 && (
                            <p className="text-xs text-muted-text">
                              +{workout.sets_reps.length - 3} more exercises
                            </p>
                          )}
                        </div>
                      )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-text">
                        <Clock className="h-3 w-3" />
                        {new Date(workout.scheduled_date).toLocaleDateString()}
                      </div>
                      {canAccess && workout.video_url && (
                        <a
                          href={workout.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-tactical-red hover:underline"
                        >
                          <Play className="h-3 w-3" />
                          Watch
                        </a>
                      )}
                    </div>

                    {!canAccess && (
                      <Link href="/pricing">
                        <Button
                          size="sm"
                          className="mt-3 w-full bg-tactical-red hover:bg-red-700"
                        >
                          Upgrade to Access
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Empty State */}
      {filteredWorkouts.length === 0 && (
        <Card className="border-steel/20 bg-gunmetal">
          <CardContent className="py-12 text-center">
            <Dumbbell className="mx-auto mb-4 h-12 w-12 text-steel" />
            <h3 className="font-heading text-xl text-high-vis mb-2">
              NO WORKOUTS FOUND
            </h3>
            <p className="text-muted-text">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "No workouts available yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
