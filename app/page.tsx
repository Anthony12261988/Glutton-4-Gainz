import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Activity,
  ArrowRight,
  Badge,
  Flame,
  Shield,
  Target,
  Trophy,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Glutton4Gainz | Stop Exercising. Start Training.",
  description:
    "A tier-based military fitness platform. Complete daily missions, rank up from Recruit to General, and dominate the leaderboard.",
  keywords: [
    "tactical fitness",
    "military workout",
    "discipline app",
    "tier training",
    "gamified fitness",
    "Glutton4Gainz",
  ],
  openGraph: {
    title: "Glutton4Gainz – Your Mission Starts Now.",
    description:
      "Join the elite tactical fitness platform that treats every workout like a mandatory mission.",
    url: "https://glutton4gainz.com",
    siteName: "Glutton4Gainz",
  },
};

const philosophyPoints = [
  {
    title: "No Decision Fatigue",
    body: "One mission per day. You execute or you fail. Orders are clear.",
    icon: <Target className="h-6 w-6 text-tactical-red" />,
  },
  {
    title: "Earn Your Rank",
    body: "Status isn’t sold—it’s earned. Climb from Recruit to General through sweat.",
    icon: <Badge className="h-6 w-6 text-tactical-red" />,
  },
  {
    title: "Tier-Based Progression",
    body: "Calibrate your caliber: .223, .556, .762, or .50 Cal protocols await.",
    icon: <Shield className="h-6 w-6 text-tactical-red" />,
  },
];

const featureCards = [
  {
    label: "CHOOSE YOUR CALIBER.",
    title: "THE TIER SYSTEM",
    body:
      "Start at .223 (Novice) and prove your worth in the Day Zero test to unlock .556, .762, and the elite .50 Cal tiers.",
  },
  {
    label: "ONE DAY. ONE MISSION.",
    title: "DAILY MISSIONS",
    body:
      "A fresh tactical workout drops daily at 0500 with intel, video, and a clear objective. Execution is mandatory.",
  },
  {
    label: "FUEL THE MACHINE.",
    title: "RATIONS & INTEL",
    body:
      "Hit the Rations dashboard for high-protein meal directives that repair tissue and keep you operational.",
  },
  {
    label: "NO SOLDIER LEFT BEHIND.",
    title: "SQUAD ACCOUNTABILITY",
    body:
      "Monitor your squad’s activity. If a buddy goes dark for 24 hours, send a Wake Up nudge. Move together, win together.",
  },
];

const onboardingScreens = [
  {
    title: "WELCOME TO THE GRIND.",
    body: "This isn't a game. It's a transformation.",
    icon: <Flame className="h-6 w-6 text-tactical-red" />,
  },
  {
    title: "EARN YOUR STRIPES.",
    body: "Complete missions to gain XP. Rank up from Recruit to Commander.",
    icon: <Trophy className="h-6 w-6 text-tactical-red" />,
  },
  {
    title: "DATA DRIVEN WARFARE.",
    body: "Track consistency and body metrics with military precision.",
    icon: <Activity className="h-6 w-6 text-tactical-red" />,
  },
];

export default function Home() {
  return (
    <main className="relative overflow-hidden text-high-vis">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-10 h-64 w-64 rounded-full bg-tactical-red/20 blur-[120px]" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-emerald-500/10 blur-[140px]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-camo-black via-camo-black/80 to-transparent" />
      </div>

      <section className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-20 pt-16 lg:flex-row lg:items-center lg:gap-16 lg:pt-24">
        <div className="relative flex-1">
          {/* Logo Badge */}
          <div className="mb-6 inline-flex items-center gap-3">
            <div className="rounded-sm bg-tactical-red p-2">
              <Image
                src="/G4G_Logo_2.png"
                alt="Glutton4Gainz"
                width={32}
                height={32}
                className="h-auto w-auto"
              />
            </div>
            <div className="inline-flex items-center gap-2 rounded-sm bg-gunmetal/70 px-3 py-2 text-xs font-semibold tracking-[0.24em] text-muted-text ring-1 ring-steel/60">
              <span className="h-2 w-2 rounded-full bg-radar-green" />
              STOP EXERCISING. START TRAINING.
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            YOUR MISSION STARTS NOW.
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-muted-text">
            Motivation is fleeting. Discipline is forever. Join the elite tactical
            fitness platform that treats every workout like a mandatory mission.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <Link href="/signup" className="w-full sm:w-auto">
                ENLIST NOW
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-steel text-high-vis hover:bg-gunmetal">
              <Link href="#features" className="w-full sm:w-auto">
                RECON THE APP
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Daily drop", value: "0500 HOURS" },
              { label: "Ranks", value: "RECRUIT → GENERAL" },
              { label: "Protocol", value: "ONE MISSION. NO EXCUSES." },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-sm border border-steel/50 bg-gunmetal/60 px-4 py-3"
              >
                <p className="text-xs uppercase tracking-wide text-muted-text">
                  {item.label}
                </p>
                <p className="text-lg font-semibold text-high-vis">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex-1">
          <div className="rounded-sm border border-tactical-red/40 bg-gunmetal/70 p-6 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-muted-text">Mission Brief</p>
                <p className="text-2xl font-semibold text-high-vis">Day Zero Assessment</p>
              </div>
              <span className="rounded-sm bg-tactical-red/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-tactical-red">
                Live
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted-text">
              <div className="rounded-sm border border-steel/40 bg-camo-black/60 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-text">Tier Target</p>
                <p className="text-xl font-semibold text-high-vis">.223 → .556</p>
              </div>
              <div className="rounded-sm border border-steel/40 bg-camo-black/60 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-text">Time on Task</p>
                <p className="text-xl font-semibold text-high-vis">22 MIN</p>
              </div>
              <div className="rounded-sm border border-steel/40 bg-camo-black/60 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-text">Objective</p>
                <p className="text-xl font-semibold text-high-vis">Complete or Repeat</p>
              </div>
              <div className="rounded-sm border border-steel/40 bg-camo-black/60 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-text">Comms</p>
                <p className="text-xl font-semibold text-high-vis">Squad Link Live</p>
              </div>
            </div>
            <div className="mt-6 rounded-sm border border-steel/50 bg-camo-black/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm uppercase tracking-wide text-muted-text">Next Deployment</p>
                <p className="text-lg font-semibold text-high-vis">0500 HOURS</p>
              </div>
              <p className="mt-2 text-sm text-muted-text">
                Briefing, video intel, and rations unlock at dawn. Be ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="philosophy"
        className="relative mx-auto max-w-6xl px-6 py-16 lg:py-20"
      >
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-text">
            WHY GLUTTON4GAINZ
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            STOP GUESSING. START EXECUTING.
          </h2>
          <p className="mt-4 text-lg text-muted-text">
            Civilian apps overwhelm you with choices. Glutton4Gainz gives you orders.
            We don't sell beach bodies. We build combat-ready discipline.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {philosophyPoints.map((point) => (
            <div
              key={point.title}
              className="rounded-sm border border-steel/50 bg-gunmetal/60 p-5 shadow-lg"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-sm bg-tactical-red/15">
                {point.icon}
              </div>
              <h3 className="text-lg font-semibold">{point.title}</h3>
              <p className="mt-2 text-sm text-muted-text">{point.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="features"
        className="relative mx-auto max-w-6xl px-6 py-16 lg:py-20"
      >
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-text">
              THE ARMORY
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              SYSTEMS BUILT FOR OPERATORS.
            </h2>
            <p className="mt-3 text-muted-text">
              Tiered training, daily missions, precision nutrition, and squad accountability
              in one tactical dashboard.
            </p>
          </div>
          <Button asChild variant="outline" className="border-steel text-high-vis">
            <Link href="/login">ALREADY ENLISTED? ENTER HQ</Link>
          </Button>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {featureCards.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col gap-3 rounded-sm border border-steel/60 bg-gunmetal/70 p-6 shadow-lg transition hover:-translate-y-1 hover:border-tactical-red/70"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-text">
                {feature.label}
              </p>
              <h3 className="text-2xl font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-text">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="pricing"
        className="relative mx-auto max-w-6xl px-6 py-16 lg:py-20"
      >
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-text">
            THE CONTRACT
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            PICK YOUR CLEARANCE LEVEL.
          </h2>
          <p className="mt-3 text-muted-text">
            Two ways in. One expectation: show up daily.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-sm border border-steel/60 bg-gunmetal/70 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold">RECRUIT</h3>
              <span className="rounded-sm bg-steel/30 px-3 py-1 text-xs font-bold uppercase tracking-wide text-muted-text">
                Free
              </span>
            </div>
            <p className="text-4xl font-bold">$0</p>
            <ul className="mt-2 space-y-2 text-sm text-muted-text">
              <li>• Tier .223 (Novice) Missions</li>
              <li>• Basic Service Record (Stats)</li>
              <li>• Standard Rations (Daily Meal View)</li>
            </ul>
            <Button asChild className="mt-2">
              <Link href="/signup">REPORT FOR DUTY</Link>
            </Button>
          </div>

          <div className="relative flex flex-col gap-4 rounded-sm border border-tactical-red bg-gradient-to-br from-tactical-red/15 via-gunmetal to-gunmetal p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold">SOLDIER</h3>
              <span className="rounded-sm bg-tactical-red/25 px-3 py-1 text-xs font-bold uppercase tracking-wide text-tactical-red">
                Premium
              </span>
            </div>
            <p className="text-4xl font-bold">$9.99</p>
            <p className="text-sm uppercase tracking-wide text-muted-text">per month</p>
            <ul className="mt-2 space-y-2 text-sm text-muted-text">
              <li>• ALL TIERS UNLOCKED (.223 - .50 Cal)</li>
              <li>• Advanced Analytics (Weight & Consistency Charts)</li>
              <li>• Meal Planner (7-Day Ration Calendar)</li>
              <li>• Squad Leaderboards</li>
            </ul>
            <Button asChild size="lg" className="mt-2">
              <Link href="/signup">UPGRADE CLEARANCE</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-text">
            ONBOARDING INTEL
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            PREP FOR DEPLOYMENT.
          </h2>
          <p className="mt-3 text-muted-text">
            A glimpse of what new recruits see on day one.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {onboardingScreens.map((screen) => (
            <div
              key={screen.title}
              className="flex flex-col gap-3 rounded-sm border border-steel/60 bg-gunmetal/70 p-5 shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-tactical-red/15">
                {screen.icon}
              </div>
              <h3 className="text-lg font-semibold">{screen.title}</h3>
              <p className="text-sm text-muted-text">{screen.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-steel/50 bg-gunmetal/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">GLUTTON4GAINZ © 2024.</p>
            <p className="text-xs uppercase tracking-wide text-muted-text">
              DISCIPLINE. STRENGTH. HONOR.
            </p>
          </div>
          <div className="flex gap-6 text-sm text-muted-text">
            <Link href="/privacy">Privacy Protocol</Link>
            <Link href="/terms">Terms of Engagement</Link>
            <Link href="/support">Support Channel</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
