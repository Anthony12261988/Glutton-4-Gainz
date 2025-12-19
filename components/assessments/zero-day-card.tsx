"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, AlertTriangle } from "lucide-react";

export function ZeroDayCard() {
  return (
    <Card className="relative border-tactical-red transition-all hover:shadow-2xl">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-sm border-2 border-tactical-red bg-tactical-red/10 p-2">
            <Shield className="h-6 w-6 text-tactical-red" strokeWidth={2.5} />
          </div>
          <CardTitle className="text-tactical-red">ZERO-DAY ASSESSMENT</CardTitle>
        </div>
        <CardDescription className="text-muted-text">
          Complete your fitness baseline assessment to establish your performance tier
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-sm border border-steel/30 bg-gunmetal/50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-tactical-red flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-high-vis font-semibold mb-1">
                ASSESSMENT PROTOCOL
              </p>
              <p className="text-xs text-muted-text leading-relaxed">
                Zero Day is your fitness baseline assessment. Complete the three-part test to establish your performance tier.
                Your tier determines workout difficulty. You can retake this assessment anytime to track improvement.
              </p>
              <p className="text-xs text-steel mt-2">
                Note: Training programs require Soldier upgrade (payment), not tier level.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-muted-text">
            ASSESSMENT TESTS
          </h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-3 border-l-2 border-tactical-red pl-4">
              <span className="font-heading mt-0.5 text-tactical-red">▸</span>
              <div className="flex-1">
                <p className="font-semibold text-high-vis">TEST 1: PUSHUPS</p>
                <p className="text-sm text-muted-text">Maximum reps in one set</p>
              </div>
            </li>
            <li className="flex items-start gap-3 border-l-2 border-tactical-red pl-4">
              <span className="font-heading mt-0.5 text-tactical-red">▸</span>
              <div className="flex-1">
                <p className="font-semibold text-high-vis">TEST 2: JUMP SQUATS</p>
                <p className="text-sm text-muted-text">Maximum reps in one set</p>
              </div>
            </li>
            <li className="flex items-start gap-3 border-l-2 border-tactical-red pl-4">
              <span className="font-heading mt-0.5 text-tactical-red">▸</span>
              <div className="flex-1">
                <p className="font-semibold text-high-vis">TEST 3: PLANK HOLD</p>
                <p className="text-sm text-muted-text">Maximum time held in seconds</p>
              </div>
            </li>
          </ul>
        </div>
      </CardContent>

      <CardFooter>
        <Link href="/zero-day" className="w-full">
          <Button size="lg" className="w-full bg-tactical-red hover:bg-red-700">
            START ASSESSMENT
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

