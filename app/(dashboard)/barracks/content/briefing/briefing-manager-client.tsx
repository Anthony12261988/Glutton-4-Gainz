"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

export function BriefingManagerClient() {
  const [content, setContent] = useState("");

  // TODO: Implement daily_briefings table in Supabase
  // Table schema needed:
  // - id (uuid, primary key)
  // - content (text)
  // - created_at (timestamp)
  // - created_by (uuid, foreign key to profiles)

  const handleSave = async () => {
    // Placeholder until table is created
    alert("Daily Briefing feature coming soon! The database table needs to be created first.");
  };

  return (
    <div className="min-h-screen bg-camo-black pb-24 text-white">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Link
          href="/barracks"
          className="flex items-center text-steel hover:text-white mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Barracks
        </Link>

        <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis mb-8">
          Daily Briefing
        </h1>

        {/* Feature Coming Soon Notice */}
        <Card className="bg-tactical-red/10 border-tactical-red/30 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-tactical-red flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-heading font-bold text-tactical-red mb-1">FEATURE IN DEVELOPMENT</h3>
                <p className="text-sm text-muted-text">
                  The Daily Briefing feature requires database setup. Contact your admin to create the <code className="text-tactical-red">daily_briefings</code> table.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gunmetal border-steel/20 opacity-60">
          <CardHeader>
            <CardTitle className="text-white">Update Briefing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="briefing">Message to Troops</Label>
              <Textarea
                id="briefing"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-black/20 border-steel/30 min-h-[200px] text-lg"
                placeholder="Enter today's motivational message..."
                disabled
              />
            </div>

            <Button
              onClick={handleSave}
              className="w-full bg-tactical-red hover:bg-red-700"
              disabled
            >
              <Save className="mr-2 h-4 w-4" /> Publish Briefing (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
