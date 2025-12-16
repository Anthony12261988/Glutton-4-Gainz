# GLUTTON4GAINZ (G4G) - Military Fitness PWA

A tactical approach to fitness. Complete missions, earn ranks, dominate your goals.

## 🎯 Current Status: Production Ready ✅

All critical features are complete and tested. Ready for deployment after applying database migrations.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.local.example .env.local
# Fill in your Supabase and Stripe credentials
```

### 3. Apply Database Migrations
Open **Supabase Dashboard → SQL Editor** and run these migrations **in order**:

1. `supabase/migrations/043_allow_admin_briefings.sql`
2. `supabase/migrations/044_add_recipe_freemium_fields.sql`
3. `supabase/migrations/046_fix_recipes_rls_freemium.sql`
4. `supabase/migrations/046_seed_standard_issue_recipes.sql`
5. `supabase/migrations/047_create_zero_day_tests.sql`
6. `supabase/migrations/048_fix_briefings_read_policy.sql` (IMPORTANT: Fixes "Loading briefing..." issue)

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ✨ Key Features

### 🎖️ Gamification System
- **4-Tier Rank System**: .223 (Recruit) → .556 → .762 → .50 Cal (Elite)
- **XP & Streaks**: Earn XP for completing workouts, maintain daily streaks
- **Achievement Badges**: Unlock badges for milestones
- **Zero Day Assessment**: Fitness baseline test for ALL recruits to establish performance tier

### 💪 Workout System
- **Tier-Based Workouts**: Progressively harder workouts as you rank up
- **Video Demonstrations**: YouTube integration for exercise guides
- **Progress Tracking**: Log sets, reps, and completion status
- **Personal Records**: Track your best lifts and times

### 🍽️ Nutrition (Rations)
- **Freemium Model**: 5 free recipes for Recruits, all recipes for premium users
- **Meal Planning**: Plan meals by date (premium feature)
- **Macro Tracking**: Calories, protein, carbs, fat for each recipe
- **Custom Recipes**: Coaches can create custom recipes

### 📊 Analytics & Progress
- **Consistency Chart**: Visual representation of workout frequency
- **Weight Tracking**: Monitor body composition over time
- **XP Progress**: See your progression towards next rank
- **Fitness Dossier**: Comprehensive profile with goals and achievements

### 👥 Social Features
- **Buddy System**: Connect with workout partners
- **Motivational Corner**: Daily briefings pour positivity into soldiers as they conquer missions
- **Coach Dashboard**: Coaches can manage troops, create content, invite users
- **Real-Time Updates**: WebSocket-powered live updates for briefings and content

### 💳 Monetization
- **Stripe Integration**: Subscription payments for Soldier tier ($9.99/month)
- **Freemium Access**: Free users can unlock premium via Zero Day assessment
- **Premium Features**: Full recipe library, meal planning, advanced analytics

---

## 📋 Client Requirements (Implemented)

### ✅ Zero Day Assessment
- **Purpose**: Fitness baseline test for ALL recruits (not just tier progression)
- **Access**: Available to all soldiers and recruits
- **Function**: Establishes initial performance tier based on fitness test results
- **Retake**: Soldiers can retake anytime to track improvement and unlock higher tiers
- **Data**: All test attempts saved to `zero_day_tests` table for historical tracking

### ✅ Recruit (Free Tier) Features
1. **Zero Day Access**: Complete fitness assessment to establish baseline
2. **Basic Service Record**: Access to profile page with stats, badges, and progress
3. **Standard Rations**: View 5 standard issue recipes (marked with `is_standard_issue` flag)
4. **Tier-Based Workouts**: Access to workouts for their assigned tier
5. **Motivational Corner**: Inspirational briefings integrated with Rations page

### ✅ Motivational Corner Integration
- **Widget**: Displays daily mission briefings from coaches/admins
- **Location**: Integrated with Rations & Intel page (as requested)
- **Purpose**: Pours positivity into soldiers as they conquer their daily missions
- **Real-Time**: WebSocket-powered live updates when coaches publish new briefings

### ✅ Background Texture
- **Pattern**: Perforated metal dot texture (subtle, military-themed)
- **Implementation**: SVG-based pattern (`/diamond-plate.svg`)
- **Coverage**: Applied to all pages via `body` background in `globals.css`
- **Color Scheme**: Matches tactical theme (#0a0a0a base with #1a1a1a dots)

---

## 🏗️ Tech Stack

- **Framework**: Next.js 16+ (App Router, TypeScript, React 19)
- **Styling**: Tailwind CSS v3 + Custom Military Theme
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Payments**: Stripe Checkout + Webhooks
- **Charts**: Recharts
- **Icons**: Lucide React
- **UI Components**: Shadcn/UI

---

## 🎨 Design System

### Military Theme
- **Dark Mode Only**: Tactical, high-contrast design
- **Sharp Edges**: Minimal border radius, blocky UI
- **Military Terminology**: Missions, Rations, Barracks, Intel

### Color Palette
- **Camo Black**: `#0a0a0a` (main background with perforated metal dot texture)
- **Gunmetal**: `#1a1a1a` (cards, modals)
- **Tactical Red**: `#D32F2F` (primary accent)
- **Steel**: `#4a4a4a` (borders, dividers)
- **Radar Green**: `#10B981` (success states)
- **High Vis**: `#f5f5f5` (primary text)

### Typography
- **Headings**: Oswald (uppercase, bold, military-style)
- **Body**: Inter (clean, modern, legible)

---

## 📂 Project Structure

```
glutton4gainz/
├── app/
│   ├── (auth)/              # Login, signup, onboarding
│   ├── (dashboard)/         # Main app (dashboard, rations, barracks, etc.)
│   ├── (app)/               # Public pages (pricing, success)
│   └── api/                 # API routes (Stripe webhooks)
├── components/
│   ├── ui/                  # Base UI components (buttons, cards, etc.)
│   ├── layout/              # Navigation, header, footer
│   ├── features/            # Feature-specific components
│   ├── gamification/        # Badges, briefings, rank system
│   ├── nutrition/           # Meal planner, recipe cards
│   └── charts/              # Analytics visualizations
├── lib/
│   ├── supabase/            # Supabase client & middleware
│   ├── stripe/              # Stripe integration & webhooks
│   ├── utils/               # Utility functions
│   ├── constants/           # Static data (tiers, badges)
│   └── types/               # TypeScript type definitions
├── hooks/                   # Custom React hooks
├── public/                  # Static assets
└── supabase/
    ├── migrations/          # Database migrations
    └── seed-admin-data.sql  # Seed data
```

---

## 🔐 User Roles & Access Control

### Role Hierarchy
1. **Recruit** (role: `user`, tier: `.223`) - Free user
2. **Soldier** (role: `soldier`) - Paid subscription ($9.99/month)
3. **Coach** (role: `coach`) - Trainer/admin with content management
4. **Admin** (role: `admin`) - System administrator

### Premium Access
Users get premium access if:
- They have Soldier role (paid subscription), OR
- They have higher tier (.556, .762, .50 Cal) earned via Zero Day assessment

### Feature Access
| Feature | Recruit (Free) | Soldier (Paid) | Coach | Admin |
|---------|----------------|----------------|-------|-------|
| Zero Day Assessment | ✅ | ✅ | ❌ | ❌ |
| Basic Service Record | ✅ | ✅ | ✅ | ✅ |
| Standard Rations (5 recipes) | ✅ | ✅ | ✅ | ✅ |
| Tier-Based Workouts | ✅ | ✅ | ✅ | ✅ |
| Motivational Corner | ✅ | ✅ | ✅ | ✅ |
| All Recipes | ❌ | ✅ | ✅ | ✅ |
| Meal Planning | ❌ | ✅ | ✅ | ✅ |
| Advanced Analytics | ❌ | ✅ | ✅ | ✅ |
| Create Content | ❌ | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ | ✅ |

---

## 📊 Database Schema

### Core Tables
- **profiles** - User profiles with tier, role, XP, streaks
- **workouts** - Tier-based workout templates
- **user_logs** - Workout completion logs
- **user_badges** - Earned achievement badges
- **body_metrics** - Weight, body fat tracking
- **recipes** - Meal recipes (with `is_standard_issue` flag)
- **meal_plans** - User meal planning
- **zero_day_tests** - Historical test attempts (NEW)
- **daily_briefings** - Motivational messages from coaches
- **coach_invites** - Coach invitation system
- **notifications** - In-app notifications (payment failures, etc.)

### Security
- **Row-Level Security (RLS)** enforced on all tables
- **Freemium model** enforced at database level
- **Role-based access control** via RLS policies

---

## 🚢 Deployment

### Prerequisites
- Supabase project with migrations applied
- Vercel account (or any Next.js host)
- Stripe account with webhook configured

### Steps
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel
4. Deploy

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
STRIPE_PRICE_ID=your_price_id
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## 🧪 Testing

### Test Admin Login
1. Run `npm run seed` to create admin user
2. Log in as `rajeshsunny@gmail.com` (use your Supabase auth)
3. Should redirect to `/command` (admin dashboard)

### Test Free Tier
1. Sign up as new user (auto-assigned .223 tier)
2. Navigate to `/rations`
3. Should see only 5 standard issue recipes

### Test Premium Access
1. Upgrade user to Soldier (via Stripe checkout)
2. Navigate to `/rations`
3. Should see all 8 recipes + meal planning

### Test Zero Day
1. Navigate to `/zero-day`
2. Complete fitness test
3. Check database: `SELECT * FROM zero_day_tests`
4. Verify test data is saved

---

## 📝 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm start         # Start production server
npm run lint      # Run ESLint
npm run seed      # Seed admin data to Supabase
```

---

## 🔄 Recent Updates (Dec 2024)

### Production-Ready Fixes ✅
- **Admin Briefings**: Fixed RLS to allow admins to publish briefings
- **Real-Time Updates**: Implemented WebSocket subscriptions for briefings
- **Zero Day Tracking**: Created `zero_day_tests` table for historical data
- **Freemium Model**: Database-enforced with `is_standard_issue` flag on recipes
- **Payment Notifications**: Webhook creates in-app notifications on payment failure
- **UX Improvements**: Removed `window.location.reload()` calls, added real-time state updates

---

## 📖 Documentation

All documentation has been consolidated into this README. Key sections:
- **Quick Start** - Get up and running in 5 minutes
- **Features** - Comprehensive feature overview
- **Tech Stack** - Technologies used
- **Database Schema** - Table structure and relationships
- **Deployment** - Production deployment guide
- **Testing** - Test scenarios and verification

---

## 🆘 Troubleshooting

### "Admin can't publish briefings"
→ Run migration 043 in Supabase SQL Editor

### "Free users see all recipes"
→ Run migrations 044, 045, and 046 in order

### "Zero Day doesn't save test data"
→ Run migration 047 to create `zero_day_tests` table

### "Briefings don't update in real-time"
→ Enable Supabase Realtime for `daily_briefings` table

---

## 📄 License

Private - All rights reserved

---

**Built with 💪 by the G4G team**
