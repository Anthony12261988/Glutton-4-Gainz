"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, X, ChevronRight } from "lucide-react";

interface DossierPromptCardProps {
  className?: string;
}

export function DossierPromptCard({ className }: DossierPromptCardProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <Card className={`border-amber-500/30 bg-amber-500/5 relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 h-6 w-6 p-0 text-muted-text hover:text-high-vis"
      >
        <X className="h-4 w-4" />
      </Button>
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          <div className="rounded-sm border border-amber-500 bg-amber-500/20 p-2">
            <ClipboardList className="h-6 w-6 text-amber-500" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-heading font-bold text-amber-500 uppercase">
              Complete Your Dossier
            </h3>
            <p className="text-sm text-muted-text">
              Help us personalize your training by completing your fitness profile. 
              It only takes 2 minutes.
            </p>
            <Link href="/dossier">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black">
                Complete Now
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
