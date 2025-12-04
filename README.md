# GLUTTON4GAMES (G4G) - Military Fitness PWA

A tactical approach to fitness. Complete missions, earn ranks, dominate your goals.

## Tech Stack

- **Framework**: Next.js 16+ (App Router, TypeScript)
- **Styling**: Tailwind CSS v3 + Custom Military Theme
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Payments**: Stripe

## Project Status

**Current Phase**: Phases 0-2 Complete ✅ | Ready for Supabase Setup

### ✅ Phase 0: Foundation (COMPLETE)
- [x] Next.js 16 with TypeScript initialized
- [x] Tailwind CSS v3 configured with military theme colors
- [x] All dependencies installed (Supabase, Recharts, Lucide React, Stripe, Shadcn/UI)
- [x] Folder structure created
- [x] Environment variables template ready
- [x] Supabase client setup
- [x] Proxy middleware configured
- [x] PWA manifest created
- [x] Custom fonts (Oswald, Inter) configured

### ✅ Phase 1: Supabase Backend (READY TO DEPLOY)
- [x] 12 SQL migration files created
- [x] 9 database tables (profiles, workouts, user_logs, user_badges, body_metrics, recipes, meal_plans, buddies, messages)
- [x] Complete RLS policies for all tables
- [x] Database functions and triggers (XP calculation, badge awards, streak tracking)
- [x] Storage bucket configuration (avatars, content_assets)
- [x] Seed data created (4 workouts, 8 recipes)

### ✅ Phase 2: Design System & UI Components (COMPLETE)
- [x] 20+ UI components built and styled
  - Core: Button, Card, Input, Textarea, Dialog, Toast, Select, Tabs, Badge
  - Custom: ProgressBar, MissionCard, Navigation
  - Gamification: BadgeDisplay, RankBadge
  - Analytics: ConsistencyChart, WeightChart, XPChart
  - Gating: TierLockOverlay, LockedContent
- [x] Auth pages: Login, Signup, Onboarding (Day Zero Test)
- [x] Comprehensive demo page showcasing all components
- [x] Build passing with 0 TypeScript errors

### 🔄 Next Steps: Set Up Supabase
- [ ] Create Supabase project at https://supabase.com
- [ ] Run all 12 database migrations in order
- [ ] Run seed data
- [ ] Update `.env.local` with Supabase credentials
- [ ] Generate TypeScript types from schema

**See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions**

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Stripe account (for monetization features)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

4. Fill in your Supabase and Stripe credentials in `.env.local`

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
glutton4gainz/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── ui/                # Base UI components
│   ├── layout/            # Layout components
│   ├── auth/              # Authentication components
│   ├── workouts/          # Workout-related components
│   ├── charts/            # Analytics charts
│   ├── gamification/      # Badges, buddies
│   ├── nutrition/         # Meal planner components
│   └── coach/             # Coach dashboard components
├── lib/                   # Utilities and helpers
│   ├── auth/              # Authentication helpers
│   ├── queries/           # Database queries
│   ├── utils/             # Utility functions
│   ├── supabase/          # Supabase client
│   └── types/             # TypeScript types
├── hooks/                 # Custom React hooks
├── constants/             # Static data (badges, tiers)
├── public/                # Static assets
└── supabase/              # Supabase migrations and config

## Military Theme

### Colors
- **Camo Black**: `#0a0a0a` (main background)
- **Gunmetal**: `#1a1a1a` (cards, modals)
- **Tactical Red**: `#D32F2F` (primary accent)
- **Steel**: `#4a4a4a` (borders, dividers)
- **Radar Green**: `#10B981` (success states)

### Typography
- **Headings**: Oswald (uppercase, bold)
- **Body**: Inter (clean, legible)

### Design Principles
- Dark mode only
- Sharp edges (minimal border radius)
- High contrast
- Military terminology (Mission, Rations, Intel, Barracks)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Documentation

- **[Quick Start Guide](./QUICK_START.md)** - Get up and running in 5 minutes
- **[Project Status](./PROJECT_STATUS.md)** - Detailed progress report and roadmap
- **[Supabase Setup Guide](./SUPABASE_SETUP.md)** - Step-by-step Supabase configuration
- **[Task Breakdown](./TASKS.md)** - Complete 12-phase task list (200+ tasks)
- **[Product Requirements Document](./GLUTTON4GAMES_PRD.md)** - Full product specification
- **[Design System](./G4G_Design_System.md)** - Visual design specifications

## License

Private - All rights reserved
