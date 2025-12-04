"use client";

import {
  ConsistencyChart,
  WeightChart,
  XPChart,
} from "@/components/ui/stats-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Activity } from "lucide-react";

interface StatsClientProps {
  consistencyData: any[];
  weightData: any[];
  xpData: any[]; // Assuming we might want to chart XP growth, or just use consistency
}

export default function StatsClient({
  consistencyData,
  weightData,
}: StatsClientProps) {
  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
            INTEL REPORT
          </h1>
          <p className="text-sm text-muted-text">
            Performance analytics and metrics.
          </p>
        </div>
        <div className="rounded-sm border border-tactical-red bg-tactical-red/10 p-2">
          <BarChart3 className="h-6 w-6 text-tactical-red" />
        </div>
      </div>

      {/* Consistency Chart */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-tactical-red" />
          <h3 className="font-heading text-sm font-bold uppercase text-muted-text">
            MISSION CONSISTENCY
          </h3>
        </div>
        <ConsistencyChart data={consistencyData} />
      </div>

      {/* Weight Chart */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-tactical-red" />
          <h3 className="font-heading text-sm font-bold uppercase text-muted-text">
            BODY METRICS
          </h3>
        </div>
        {weightData.length > 0 ? (
          <WeightChart data={weightData} />
        ) : (
          <Card>
            <CardContent className="flex h-[300px] items-center justify-center text-muted-text">
              No weight data recorded.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
