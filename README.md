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

### ✅ Phase 0: Foundation (COMPLETE)
- [x] Next.js 14+ with TypeScript initialized
- [x] Tailwind CSS configured with military theme colors
- [x] Folder structure created
- [x] Environment variables template ready
- [x] Supabase client setup
- [x] Middleware/Proxy configured
- [x] PWA manifest created
- [x] Custom fonts (Oswald, Inter) configured

### 🔄 Next Steps: Phase 1 - Supabase Backend
- [ ] Create Supabase project
- [ ] Run database migrations (tables, RLS, functions, storage)
- [ ] Generate TypeScript types from schema
- [ ] Seed initial data

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

- **[Product Requirements Document](./GLUTTON4GAMES_PRD.md)** - Full product specification
- **[Design System](./G4G_Design_System.md)** - Visual design specifications
- **[Implementation Plan](./.claude/plans/golden-strolling-robin.md)** - Phase-by-phase development plan
- **[Task Breakdown](./TASKS.md)** - Detailed task list with priorities and subtasks (ALL PHASES)

## License

Private - All rights reserved
