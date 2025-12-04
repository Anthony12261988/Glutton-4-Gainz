"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function BriefingManagerPage() {
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchBriefing = async () => {
      const { data, error } = await supabase
        .from("daily_briefings")
        .select("content")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setContent(data.content);
      }
    };

    fetchBriefing();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("daily_briefings")
        .insert([{ content }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Daily briefing updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-camo-black pb-24 text-white">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Link href="/barracks" className="flex items-center text-steel hover:text-white mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Barracks
        </Link>

        <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis mb-8">
          Daily Briefing
        </h1>

        <Card className="bg-gunmetal border-steel/20">
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
              />
            </div>

            <Button 
              onClick={handleSave} 
              className="w-full bg-tactical-red hover:bg-red-700"
              disabled={loading}
            >
              <Save className="mr-2 h-4 w-4" /> {loading ? "Publishing..." : "Publish Briefing"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
