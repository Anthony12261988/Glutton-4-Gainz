"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ArrowRight, X } from "lucide-react";
import { useState } from "react";

export function CoachProfilePrompt() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <Card className="mb-6 border-radar-green/30 bg-gradient-to-r from-gunmetal to-camo-black">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-sm bg-radar-green/20 p-2">
            <User className="h-5 w-5 text-radar-green" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-high-vis">
              Complete Your Officer Profile
            </h3>
            <p className="mt-1 text-xs text-muted-text">
              Add your profile picture so your trainees know who you are.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/profile">
            <Button size="sm" className="gap-1">
              Complete Profile
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-text hover:text-high-vis"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
