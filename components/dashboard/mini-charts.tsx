"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { createClient } from "@/lib/supabase/client";
import { Flame, TrendingUp, Weight } from "lucide-react";

export function MiniCharts({ userId }: { userId: string }) {
  const [activityData, setActivityData] = useState<any[]>([]);
  const [xpData, setXpData] = useState<any[]>([]);
  const [weightData, setWeightData] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    loadStats();
  }, [userId]);

  async function loadStats() {
    const startDate7 = new Date();
    startDate7.setDate(startDate7.getDate() - 7);
    const startDate14 = new Date();
    startDate14.setDate(startDate14.getDate() - 14);

    // Get activity data
    const { data: activity } = await supabase
      .from("user_logs")
      .select("date")
      .eq("user_id", userId)
      .gte("date", startDate7.toISOString().split('T')[0])
      .order("date", { ascending: true });

    // Transform activity data to show 1 for each workout completed
    const activityByDate = (activity || []).reduce((acc: any, log: any) => {
      acc[log.date] = 1;
      return acc;
    }, {});

    const activityData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate7);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      activityData.push({ date: dateStr, completed: activityByDate[dateStr] || 0 });
    }

    // Get XP trend
    const { data: logs } = await supabase
      .from("user_logs")
      .select("date")
      .eq("user_id", userId)
      .gte("date", startDate14.toISOString().split('T')[0])
      .order("date", { ascending: true });

    let cumulativeXP = 0;
    const xpTrend = (logs || []).map(log => {
      cumulativeXP += 100;
      return { date: log.date, xp: cumulativeXP };
    });

    // Get weight trend
    const { data: weight } = await supabase
      .from("body_metrics")
      .select("recorded_at, weight")
      .eq("user_id", userId)
      .gte("recorded_at", startDate14.toISOString())
      .order("recorded_at", { ascending: true });

    setActivityData(activityData);
    setXpData(xpTrend);
    if (weight) setWeightData(weight);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* 7-Day Activity */}
      <Card className="bg-gunmetal border-steel/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-high-vis">
            <Flame className="h-4 w-4 text-tactical-red" />
            7-Day Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={60}>
            <BarChart data={activityData}>
              <Bar dataKey="completed" fill="#e63946" />
              <XAxis dataKey="date" hide />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* XP Trend */}
      <Card className="bg-gunmetal border-steel/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-high-vis">
            <TrendingUp className="h-4 w-4 text-radar-green" />
            XP Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={xpData}>
              <Line type="monotone" dataKey="xp" stroke="#00ff41" strokeWidth={2} dot={false} />
              <XAxis dataKey="date" hide />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weight Trend */}
      <Card className="bg-gunmetal border-steel/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-high-vis">
            <Weight className="h-4 w-4 text-high-vis" />
            Weight Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={weightData}>
              <Line type="monotone" dataKey="weight" stroke="#FFD60A" strokeWidth={2} dot={false} />
              <XAxis dataKey="recorded_at" hide />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
