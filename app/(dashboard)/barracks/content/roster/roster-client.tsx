"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { getPaginatedRoster } from "@/lib/queries/paginated";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { Search, Eye, Shield, TrendingUp, Flame, Award } from "lucide-react";
import { TableSkeleton } from "@/components/loading/table-skeleton";

interface RosterClientProps {
  coachId: string;
}

export default function RosterClient({ coachId }: RosterClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Paginated query for roster
  const {
    data: soldiers,
    total,
    page,
    pageSize,
    totalPages,
    loading,
    error,
    goToPage,
  } = usePaginatedQuery({
    queryFn: useCallback(
      (p, ps) => getPaginatedRoster(coachId, p, ps, debouncedSearch),
      [coachId, debouncedSearch]
    ),
    pageSize: 20,
    initialPage: 1,
  });

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Debounce search by 500ms
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
      goToPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  };

  const handleViewProfile = (userId: string) => {
    router.push(`/barracks/content/roster/${userId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
            SOLDIER ROSTER
          </h1>
          <p className="text-sm text-steel/80 mt-1">
            View and monitor all soldiers in your command
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-sm border border-tactical-red bg-tactical-red/10 px-3 py-1">
          <Shield className="h-4 w-4 text-tactical-red" />
          <span className="font-heading font-bold text-tactical-red uppercase text-sm">
            Coach Mode
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-steel" />
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-sm border border-tactical-red bg-tactical-red/10 p-4">
          <p className="text-sm text-tactical-red">
            Error loading roster: {error.message}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && <TableSkeleton rows={10} columns={5} />}

      {/* Roster Table */}
      {!loading && soldiers && soldiers.length > 0 && (
        <div className="rounded-sm border border-steel/20 bg-gunmetal overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gunmetal-light border-b border-steel/20">
                <tr>
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-steel">
                    Soldier
                  </th>
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-steel">
                    Tier
                  </th>
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-steel">
                    Role
                  </th>
                  <th className="text-center p-4 text-xs font-bold uppercase tracking-wider text-steel">
                    Streak
                  </th>
                  <th className="text-center p-4 text-xs font-bold uppercase tracking-wider text-steel">
                    Workouts
                  </th>
                  <th className="text-center p-4 text-xs font-bold uppercase tracking-wider text-steel">
                    XP
                  </th>
                  <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-steel">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel/20">
                {soldiers.map((soldier: any) => (
                  <tr
                    key={soldier.id}
                    className="hover:bg-gunmetal-light transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-white">{soldier.full_name}</p>
                        <p className="text-xs text-steel/60">{soldier.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-tactical-red/10 border border-tactical-red/20 text-xs font-bold text-tactical-red">
                        <TrendingUp className="h-3 w-3" />
                        {soldier.tier}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-steel capitalize">
                        {soldier.role}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="font-bold text-white">
                          {soldier.current_streak || 0}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-bold text-white">
                        {soldier.workout_count || 0}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <Award className="h-4 w-4 text-radar-green" />
                        <span className="font-bold text-white">
                          {soldier.xp || 0}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewProfile(soldier.id)}
                        className="text-tactical-red hover:text-white hover:bg-tactical-red"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-steel/20 p-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={goToPage}
                itemsPerPage={pageSize}
                totalItems={total}
              />
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && soldiers && soldiers.length === 0 && (
        <div className="rounded-sm border border-steel/20 bg-gunmetal p-12 text-center">
          <Shield className="h-12 w-12 text-steel mx-auto mb-4" />
          <h3 className="font-heading text-xl text-white mb-2">
            NO SOLDIERS FOUND
          </h3>
          <p className="text-sm text-steel/80">
            {searchQuery
              ? "No soldiers match your search criteria."
              : "No soldiers have joined yet."}
          </p>
        </div>
      )}
    </div>
  );
}
