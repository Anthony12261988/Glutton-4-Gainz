# Glutton4Games - Quick Start Guide

**Current Status**: Phases 0-2 Complete | Ready for Supabase Setup

---

## 🚀 View the App Right Now

```bash
npm run dev
```

Then visit:
- **http://localhost:3000** - Component showcase
- **http://localhost:3000/login** - Login page
- **http://localhost:3000/signup** - Signup page
- **http://localhost:3000/onboarding** - Day Zero Test

---

## ✅ What's Already Built

### All UI Components Complete
- ✅ Buttons, Cards, Forms, Dialogs, Toasts
- ✅ Progress Bars (XP tracking)
- ✅ Mission Cards (workout cards with video embed)
- ✅ Navigation (mobile + desktop)
- ✅ Badge Display (achievements with glow effects)
- ✅ Rank Badge (XP-based ranking system)
- ✅ 3 Chart Types (Consistency, Weight, XP)
- ✅ Tier Lock Overlay (content gating)
- ✅ Auth Pages (login, signup, onboarding with Day Zero Test)

### Database Schema Ready
- ✅ 12 SQL migration files in `supabase/migrations/`
- ✅ 9 database tables (profiles, workouts, user_logs, badges, metrics, recipes, meals, buddies, messages)
- ✅ Complete RLS policies
- ✅ Auto-XP calculation, badge awards, streak tracking
- ✅ Seed data (4 workouts, 8 recipes)

### Military Theme Fully Implemented
- ✅ Tactical Red (#D32F2F) accents
- ✅ Dark gunmetal backgrounds
- ✅ Oswald + Inter fonts
- ✅ Sharp edges, uppercase styling
- ✅ Glow effects for achievements

---

## 📋 Next Step: Set Up Supabase (5-10 minutes)

### Quick Setup
1. Go to https://supabase.com and create a project
2. Copy your credentials (URL + anon key)
3. Update `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Run all 12 migrations in Supabase SQL Editor (in order)
5. Run the seed data
6. Generate types: `supabase gen types typescript --project-id YOUR_ID > lib/types/database.types.ts`

**Detailed Instructions**: See [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

---

## 🎯 After Supabase Setup

You can immediately start Phase 3 (Authentication):
- Connect login/signup to real Supabase auth
- Implement Google OAuth
- Save Day Zero Test results to database
- Protect routes with actual session checks

---

## 📂 Project Structure

```
glutton4gainz/
├── app/
│   ├── (auth)/          # Auth pages (login, signup, onboarding)
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Demo page (component showcase)
│   └── globals.css      # Military theme styles
├── components/ui/       # All UI components (20+ files)
├── hooks/               # React hooks (use-toast)
├── lib/
│   ├── constants/       # Tier system, badge definitions
│   ├── supabase/        # Supabase client
│   ├── fonts.ts         # Font configuration
│   └── utils.ts         # Utilities
├── supabase/
│   ├── migrations/      # 12 SQL migration files
│   ├── seed.sql         # Sample data
│   └── README.md        # Database docs
├── TASKS.md             # Complete task breakdown (200+ tasks)
├── SUPABASE_SETUP.md    # Supabase setup guide
├── PROJECT_STATUS.md    # Current status + roadmap
└── QUICK_START.md       # This file
```

---

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm run start            # Start production server

# Linting
npm run lint             # Run ESLint
```

---

## 📊 Build Status

**Last Build**: ✅ Successful (0 errors)
- All components render correctly
- TypeScript checks passing
- 6 pages generated (/, /_not-found, /login, /signup, /onboarding)

---

## 🎨 Component Examples

### Progress Bar
```tsx
<ProgressBar current={750} max={1000} label="Rank: Recruit" />
```

### Mission Card
```tsx
<MissionCard
  title="STANDARD PATROL"
  description="Intermediate intensity circuit"
  videoUrl="dQw4w9WgXcQ"
  exercises={exercises}
  onComplete={handleComplete}
/>
```

### Rank Badge
```tsx
<RankBadge xp={2500} showProgress size="md" />
```

### Badge Display
```tsx
<BadgeDisplay badges={badgeArray} columns={4} />
```

### Charts
```tsx
<ConsistencyChart data={weeklyData} />
<WeightChart data={weightData} />
<XPChart data={xpData} />
```

---

## 🔐 Environment Variables

Required in `.env.local`:

```env
# Supabase (get from https://app.supabase.com)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (Phase 8 - not needed yet)
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📖 Documentation

| File | Purpose |
|------|---------|
| [QUICK_START.md](QUICK_START.md) | This file - quick reference |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Detailed status + roadmap |
| [SUPABASE_SETUP.md](SUPABASE_SETUP.md) | Step-by-step Supabase guide |
| [TASKS.md](TASKS.md) | Complete task breakdown |
| [supabase/README.md](supabase/README.md) | Database schema docs |

---

## 🐛 Troubleshooting

### Build fails
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Components not styled correctly
- Check `tailwind.config.ts` has correct theme colors
- Verify `app/globals.css` is imported in layout
- Check font variables are defined

### Supabase connection issues
- Verify `.env.local` has correct credentials
- Check Supabase project is not paused
- Test connection: `npx tsx test-db.ts` (create this file per SUPABASE_SETUP.md)

---

## 🎯 Roadmap Summary

| Phase | Status | Time Estimate |
|-------|--------|---------------|
| 0-2: Foundation + UI | ✅ DONE | - |
| 3: Authentication | 🟡 UI Ready | 6-8 hours |
| 4: Workout Engine | ⚪ Pending | 8-10 hours |
| 5: Analytics | ⚪ Pending | 4-6 hours |
| 6: Gamification | ⚪ Pending | 6-8 hours |
| 7: Meal Planner | ⚪ Pending | 8-10 hours |
| 8: Monetization | ⚪ Pending | 6-8 hours |
| 9-10: Coach Features | ⚪ Pending | 12-15 hours |
| 11-12: PWA + Deploy | ⚪ Pending | 8-10 hours |

**Remaining**: ~60-75 hours to production-ready MVP

---

## 💪 You're Ready!

Everything is set up and ready to go. Just:
1. Set up Supabase (10 minutes)
2. Start building Phase 3 (Authentication)

**Questions?** Check the detailed docs or the code comments.

---

**Built with**: Next.js 16, TypeScript, Tailwind CSS, Supabase, Shadcn/UI

**Theme**: Military-inspired tactical fitness training 🎖️
