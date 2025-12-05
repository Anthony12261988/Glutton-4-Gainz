"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, UserPlus, Loader2 } from "lucide-react";

interface BuddyProfile {
  id: string;
  email: string;
  avatar_url?: string | null;
  tier: string;
  last_active: string | null;
}

interface BuddySearchFormProps {
  onSearch: (email: string) => Promise<BuddyProfile | null>;
  onAddBuddy: (buddyId: string) => Promise<void>;
}

export function BuddySearchForm({
  onSearch,
  onAddBuddy,
}: BuddySearchFormProps) {
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<BuddyProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;

    setIsSearching(true);
    try {
      const result = await onSearch(searchEmail);
      if (result) {
        setSearchResults([result]);
      } else {
        setSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = async (buddyId: string) => {
    await onAddBuddy(buddyId);
    setSearchResults([]);
    setSearchEmail("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-tactical-red" />
          RECRUIT BUDDY
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Enter email address..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="bg-gunmetal"
          />
          <Button type="submit" disabled={isSearching}>
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </form>

        {searchResults.length > 0 && (
          <div className="rounded-sm border border-steel bg-gunmetal p-3 space-y-3">
            {searchResults.map((buddy) => (
              <div
                key={buddy.id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-high-vis">{buddy.email}</p>
                  <p className="text-xs text-tactical-red">
                    Tier: {buddy.tier}
                  </p>
                </div>
                <Button size="sm" onClick={() => handleAdd(buddy.id)}>
                  ADD
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
