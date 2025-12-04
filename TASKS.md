# GLUTTON4GAMES (G4G) - Complete Task Breakdown

## Priority Legend
- 🔴 **P0 (Critical)** - Core functionality, blocking other work
- 🟠 **P1 (High)** - Essential features for MVP
- 🟡 **P2 (Medium)** - Important but not blocking
- 🟢 **P3 (Low)** - Nice to have, polish

---

## ✅ PHASE 0: PROJECT FOUNDATION (COMPLETE)

### Status: ✅ All tasks completed

**Deliverables:**
- [x] Next.js 16+ with TypeScript initialized
- [x] Tailwind CSS v3 configured with military theme
- [x] All dependencies installed
- [x] Folder structure created
- [x] Foundation files (Supabase client, proxy, types)
- [x] PWA manifest configured
- [x] Fonts (Oswald, Inter) configured
- [x] Build verification successful

---

## 🔄 PHASE 1: SUPABASE BACKEND SETUP

**Priority:** 🔴 P0 (Critical - Blocks all features)

**Dependencies:** Phase 0 complete ✅

**Estimated Time:** 3-4 hours

### 1.1 Supabase Project Setup 🔴 P0
**Tasks:**
- [ ] Create Supabase project at supabase.com
- [ ] Get project URL and anon key
- [ ] Get service role key (for admin functions)
- [ ] Update `.env.local` with credentials
- [ ] Test connection from Next.js app

**Files Created:**
- `.env.local` (from `.env.local.example`)

---

### 1.2 Database Schema - Core Tables 🔴 P0

#### 1.2.1 Create `profiles` table
**Priority:** 🔴 P0 (Required for auth)

**SQL Tasks:**
- [ ] Create table with columns:
  - `id` (uuid, FK to auth.users, PK)
  - `email` (text, unique, not null)
  - `role` (text, default 'user', CHECK in ['user', 'coach'])
  - `tier` (text, default '.223')
  - `xp` (integer, default 0)
  - `current_streak` (integer, default 0)
  - `coach_id` (uuid, nullable, FK to profiles.id)
  - `last_active` (timestamptz, default now())
  - `avatar_url` (text, nullable)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())
- [ ] Add indexes on: email, coach_id, role, last_active
- [ ] Create trigger to auto-update `updated_at`

**Files:**
- `supabase/migrations/001_create_profiles.sql`

---

#### 1.2.2 Create `workouts` table
**Priority:** 🔴 P0 (Core feature)

**SQL Tasks:**
- [ ] Create table with columns:
  - `id` (uuid, PK, default gen_random_uuid())
  - `tier` (text, not null)
  - `title` (text, not null)
  - `description` (text)
  - `video_url` (text, YouTube video ID or URL)
  - `scheduled_date` (date, not null)
  - `sets_reps` (jsonb, format: [{"exercise": "Pushups", "reps": "20"}])
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())
- [ ] Add indexes on: tier, scheduled_date
- [ ] Create trigger to auto-update `updated_at`
- [ ] Add check constraint on tier values

**Files:**
- `supabase/migrations/002_create_workouts.sql`

---

#### 1.2.3 Create `user_logs` table
**Priority:** 🔴 P0 (Core feature)

**SQL Tasks:**
- [ ] Create table with columns:
  - `id` (uuid, PK, default gen_random_uuid())
  - `user_id` (uuid, FK to profiles.id, not null, ON DELETE CASCADE)
  - `workout_id` (uuid, FK to workouts.id, not null, ON DELETE CASCADE)
  - `date` (date, not null, default current_date)
  - `duration` (integer, minutes, not null)
  - `notes` (text, nullable)
  - `created_at` (timestamptz, default now())
- [ ] Add indexes on: user_id, date, workout_id
- [ ] Add unique constraint on (user_id, workout_id, date) to prevent duplicate logs

**Files:**
- `supabase/migrations/003_create_user_logs.sql`

---

#### 1.2.4 Create `user_badges` table
**Priority:** 🟠 P1 (Gamification)

**SQL Tasks:**
- [ ] Create table with columns:
  - `id` (uuid, PK, default gen_random_uuid())
  - `user_id` (uuid, FK to profiles.id, not null, ON DELETE CASCADE)
  - `badge_name` (text, not null)
  - `earned_at` (timestamptz, default now())
- [ ] Add indexes on: user_id, badge_name
- [ ] Add unique constraint on (user_id, badge_name) to prevent duplicates

**Files:**
- `supabase/migrations/004_create_user_badges.sql`

---

#### 1.2.5 Create `body_metrics` table
**Priority:** 🟠 P1 (Analytics)

**SQL Tasks:**
- [ ] Create table with columns:
  - `id` (uuid, PK, default gen_random_uuid())
  - `user_id` (uuid, FK to profiles.id, not null, ON DELETE CASCADE)
  - `weight` (numeric(5,2), not null)
  - `recorded_at` (date, not null, default current_date)
  - `created_at` (timestamptz, default now())
- [ ] Add indexes on: user_id, recorded_at
- [ ] Add unique constraint on (user_id, recorded_at)

**Files:**
- `supabase/migrations/005_create_body_metrics.sql`

---

#### 1.2.6 Create `recipes` table
**Priority:** 🟡 P2 (Premium feature)

**SQL Tasks:**
- [ ] Create table with columns:
  - `id` (uuid, PK, default gen_random_uuid())
  - `title` (text, not null)
  - `image_url` (text, nullable)
  - `calories` (integer, not null)
  - `protein` (integer, not null)
  - `carbs` (integer, not null)
  - `fat` (integer, not null)
  - `instructions` (text, not null)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())
- [ ] Add trigger to auto-update `updated_at`

**Files:**
- `supabase/migrations/006_create_recipes.sql`

---

#### 1.2.7 Create `meal_plans` table
**Priority:** 🟡 P2 (Premium feature)

**SQL Tasks:**
- [ ] Create table with columns:
  - `id` (uuid, PK, default gen_random_uuid())
  - `user_id` (uuid, FK to profiles.id, not null, ON DELETE CASCADE)
  - `recipe_id` (uuid, FK to recipes.id, not null, ON DELETE CASCADE)
  - `assigned_date` (date, not null)
  - `created_at` (timestamptz, default now())
- [ ] Add indexes on: user_id, assigned_date
- [ ] Add unique constraint on (user_id, assigned_date)

**Files:**
- `supabase/migrations/007_create_meal_plans.sql`

---

#### 1.2.8 Create `buddies` table
**Priority:** 🟡 P2 (Social features)

**SQL Tasks:**
- [ ] Create table with columns:
  - `id` (uuid, PK, default gen_random_uuid())
  - `user_id` (uuid, FK to profiles.id, not null, ON DELETE CASCADE)
  - `buddy_id` (uuid, FK to profiles.id, not null, ON DELETE CASCADE)
  - `status` (text, default 'pending', CHECK in ['pending', 'accepted'])
  - `created_at` (timestamptz, default now())
- [ ] Add indexes on: user_id, buddy_id, status
- [ ] Add check constraint: user_id != buddy_id
- [ ] Add unique constraint on (user_id, buddy_id)

**Files:**
- `supabase/migrations/008_create_buddies.sql`

---

#### 1.2.9 Create `messages` table
**Priority:** 🟡 P2 (Coach feature)

**SQL Tasks:**
- [ ] Create table with columns:
  - `id` (uuid, PK, default gen_random_uuid())
  - `sender_id` (uuid, FK to profiles.id, not null, ON DELETE CASCADE)
  - `receiver_id` (uuid, FK to profiles.id, not null, ON DELETE CASCADE)
  - `content` (text, not null)
  - `is_read` (boolean, default false)
  - `created_at` (timestamptz, default now())
- [ ] Add indexes on: sender_id, receiver_id, is_read, created_at

**Files:**
- `supabase/migrations/009_create_messages.sql`

---

### 1.3 Row Level Security (RLS) Policies 🔴 P0

#### 1.3.1 RLS for `profiles` table
**Priority:** 🔴 P0

**Tasks:**
- [ ] Enable RLS on `profiles` table
- [ ] **SELECT policy**: Users can read own profile, coaches can read assigned users
  ```sql
  CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

  CREATE POLICY "Coaches can read assigned users"
  ON profiles FOR SELECT
  USING (
    auth.uid() IN (
      SELECT coach_id FROM profiles WHERE id = auth.uid() AND role = 'coach'
    )
  );
  ```
- [ ] **UPDATE policy**: Users can update own profile
- [ ] **INSERT policy**: Auto-handled by trigger on auth.users

**Files:**
- `supabase/migrations/010_rls_profiles.sql`

---

#### 1.3.2 RLS for `workouts` table
**Priority:** 🔴 P0

**Tasks:**
- [ ] Enable RLS on `workouts` table
- [ ] **SELECT policy**: All authenticated users can read workouts
- [ ] **INSERT/UPDATE/DELETE policies**: Only coaches can modify workouts

**Files:**
- `supabase/migrations/011_rls_workouts.sql`

---

#### 1.3.3 RLS for `user_logs` table
**Priority:** 🔴 P0

**Tasks:**
- [ ] Enable RLS on `user_logs` table
- [ ] **SELECT policy**: Users can read own logs, coaches can read assigned users' logs
- [ ] **INSERT policy**: Users can insert own logs
- [ ] **UPDATE/DELETE policy**: Users can modify own logs

**Files:**
- `supabase/migrations/012_rls_user_logs.sql`

---

#### 1.3.4 RLS for `user_badges` table
**Priority:** 🟠 P1

**Tasks:**
- [ ] Enable RLS on `user_badges` table
- [ ] **SELECT policy**: Users can read own badges
- [ ] **INSERT policy**: Only via service role (database functions)
- [ ] **No UPDATE/DELETE**: Badges are permanent

**Files:**
- `supabase/migrations/013_rls_user_badges.sql`

---

#### 1.3.5 RLS for `body_metrics` table
**Priority:** 🟠 P1

**Tasks:**
- [ ] Enable RLS on `body_metrics` table
- [ ] **SELECT/INSERT/UPDATE/DELETE policies**: Users can only CRUD own metrics

**Files:**
- `supabase/migrations/014_rls_body_metrics.sql`

---

#### 1.3.6 RLS for `recipes` table
**Priority:** 🟡 P2

**Tasks:**
- [ ] Enable RLS on `recipes` table
- [ ] **SELECT policy**: All authenticated users can read recipes
- [ ] **INSERT/UPDATE/DELETE policies**: Only coaches can modify recipes

**Files:**
- `supabase/migrations/015_rls_recipes.sql`

---

#### 1.3.7 RLS for `meal_plans` table
**Priority:** 🟡 P2

**Tasks:**
- [ ] Enable RLS on `meal_plans` table
- [ ] **SELECT/INSERT/UPDATE/DELETE policies**: Users can only CRUD own meal plans
- [ ] **Additional check**: Only users with role='user' and tier check (premium feature)

**Files:**
- `supabase/migrations/016_rls_meal_plans.sql`

---

#### 1.3.8 RLS for `buddies` table
**Priority:** 🟡 P2

**Tasks:**
- [ ] Enable RLS on `buddies` table
- [ ] **SELECT policy**: Users can read where user_id OR buddy_id matches
- [ ] **INSERT policy**: Users can create buddy relationships
- [ ] **UPDATE policy**: Users can accept buddy requests (status change)
- [ ] **DELETE policy**: Users can delete own buddy relationships

**Files:**
- `supabase/migrations/017_rls_buddies.sql`

---

#### 1.3.9 RLS for `messages` table
**Priority:** 🟡 P2

**Tasks:**
- [ ] Enable RLS on `messages` table
- [ ] **SELECT policy**: Users can read messages where sender_id OR receiver_id matches
- [ ] **INSERT policy**: Users can send messages
- [ ] **UPDATE policy**: Users can mark messages as read (only is_read field)
- [ ] **DELETE policy**: Users can delete own sent messages

**Files:**
- `supabase/migrations/018_rls_messages.sql`

---

### 1.4 Database Functions & Triggers 🔴 P0

#### 1.4.1 Auto-create profile on signup
**Priority:** 🔴 P0

**Tasks:**
- [ ] Create function `handle_new_user()` that:
  - Inserts new row in `profiles` table
  - Uses `auth.users.id` as profile id
  - Sets email from `auth.users.email`
  - Sets default role to 'user'
  - Sets default tier to '.223'
- [ ] Create trigger on `auth.users` INSERT to call function

**Files:**
- `supabase/migrations/019_function_auto_create_profile.sql`

---

#### 1.4.2 Update XP on workout log
**Priority:** 🔴 P0

**Tasks:**
- [ ] Create function `handle_workout_log()` that:
  - Adds 100 XP to user's profile
  - Updates `last_active` to now()
  - Calls badge check functions
- [ ] Create trigger on `user_logs` INSERT to call function

**Files:**
- `supabase/migrations/020_function_update_xp.sql`

---

#### 1.4.3 Calculate streak
**Priority:** 🟠 P1

**Tasks:**
- [ ] Create function `calculate_streak(user_id uuid)` that:
  - Queries `user_logs` ordered by date DESC
  - Counts consecutive days
  - Returns streak count
- [ ] Create function `update_streak()` that:
  - Calls `calculate_streak()`
  - Updates `current_streak` in profiles
- [ ] Create trigger on `user_logs` INSERT to call function

**Files:**
- `supabase/migrations/021_function_calculate_streak.sql`

---

#### 1.4.4 Auto-award "First Blood" badge
**Priority:** 🟠 P1

**Tasks:**
- [ ] Create function `award_first_blood_badge()` that:
  - Checks if user has any user_logs
  - If count = 1, insert "First Blood" badge
- [ ] Call this function from `handle_workout_log()`

**Files:**
- `supabase/migrations/022_function_first_blood_badge.sql`

---

#### 1.4.5 Auto-award "Iron Week" badge
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create function `award_iron_week_badge()` that:
  - Checks if current_streak >= 7
  - If true and badge not yet awarded, insert "Iron Week" badge
- [ ] Call this function from `update_streak()`

**Files:**
- `supabase/migrations/023_function_iron_week_badge.sql`

---

### 1.5 Storage Buckets & Policies 🟠 P1

#### 1.5.1 Create `avatars` bucket
**Priority:** 🟠 P1

**Tasks:**
- [ ] Create storage bucket `avatars`
- [ ] Set public read access
- [ ] Create policy: Authenticated users can upload to their own folder (`{uid}/*`)
- [ ] Create policy: Users can update/delete only their own files
- [ ] Set file size limit (e.g., 5MB)
- [ ] Set allowed MIME types: image/jpeg, image/png, image/webp

**Files:**
- `supabase/migrations/024_storage_avatars.sql`

---

#### 1.5.2 Create `content_assets` bucket
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create storage bucket `content_assets`
- [ ] Set public read access
- [ ] Create policy: Only users with role='coach' can upload
- [ ] Create policy: Only coaches can update/delete
- [ ] Set file size limit (e.g., 10MB)
- [ ] Set allowed MIME types: image/jpeg, image/png, image/webp

**Files:**
- `supabase/migrations/025_storage_content_assets.sql`

---

### 1.6 Seed Data 🟡 P2

#### 1.6.1 Seed sample workouts
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create 4 sample workouts (1 per tier)
- [ ] Set scheduled_date to today
- [ ] Include realistic exercise data in sets_reps jsonb

**Files:**
- `supabase/seed.sql`

---

#### 1.6.2 Seed sample recipes
**Priority:** 🟢 P3

**Tasks:**
- [ ] Create 5-10 sample recipes
- [ ] Include realistic macros
- [ ] Add placeholder image URLs

**Files:**
- `supabase/seed.sql`

---

### 1.7 Type Generation & Testing 🔴 P0

#### 1.7.1 Generate TypeScript types
**Priority:** 🔴 P0

**Tasks:**
- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] Link project: `supabase link --project-ref YOUR_PROJECT_ID`
- [ ] Generate types: `supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types/database.types.ts`
- [ ] Verify types match manual definitions

**Files:**
- `lib/types/database.types.ts` (regenerated)

---

#### 1.7.2 Test database connections
**Priority:** 🔴 P0

**Tasks:**
- [ ] Create test script to verify:
  - Connection to Supabase
  - Can read from profiles table
  - Can read from workouts table
  - RLS policies working correctly
- [ ] Test with authenticated user
- [ ] Test with unauthenticated user (should fail)

**Files:**
- `scripts/test-db-connection.ts`

---

## 🔄 PHASE 2: DESIGN SYSTEM & CORE UI COMPONENTS

**Priority:** 🟠 P1 (Can work in parallel with Phase 1)

**Dependencies:** Phase 0 complete ✅

**Estimated Time:** 4-5 hours

### 2.1 Shadcn/UI Base Components 🟠 P1

#### 2.1.1 Install & customize Button component
**Priority:** 🟠 P1

**Tasks:**
- [ ] Install: `npx shadcn@latest add button`
- [ ] Customize variants:
  - `default`: Tactical Red background, white text
  - `secondary`: Steel background
  - `ghost`: Transparent with tactical red on hover
  - `destructive`: Same as default (red theme)
- [ ] Make all buttons uppercase with `tracking-wide`
- [ ] Remove rounded corners (use `rounded-sm`)

**Files:**
- `components/ui/button.tsx`

---

#### 2.1.2 Install & customize Card component
**Priority:** 🟠 P1

**Tasks:**
- [ ] Install: `npx shadcn@latest add card`
- [ ] Set default background to `bg-gunmetal`
- [ ] Add variant with tactical red border
- [ ] Use minimal border radius (`rounded-sm`)

**Files:**
- `components/ui/card.tsx`

---

#### 2.1.3 Install & customize Input/Textarea
**Priority:** 🟠 P1

**Tasks:**
- [ ] Install: `npx shadcn@latest add input`
- [ ] Set background to `bg-gunmetal`
- [ ] Set border to `border-steel`
- [ ] Set focus ring to `ring-tactical-red`
- [ ] Use minimal border radius

**Files:**
- `components/ui/input.tsx`
- `components/ui/textarea.tsx`

---

#### 2.1.4 Install Dialog/Modal
**Priority:** 🟠 P1

**Tasks:**
- [ ] Install: `npx shadcn@latest add dialog`
- [ ] Customize overlay to dark with tactical vibe
- [ ] Set content background to `bg-gunmetal`
- [ ] Add tactical red accent to close button

**Files:**
- `components/ui/dialog.tsx`

---

#### 2.1.5 Install Select/Dropdown
**Priority:** 🟠 P1

**Tasks:**
- [ ] Install: `npx shadcn@latest add select`
- [ ] Match input styling
- [ ] Dropdown menu dark themed

**Files:**
- `components/ui/select.tsx`

---

#### 2.1.6 Install Tabs
**Priority:** 🟡 P2

**Tasks:**
- [ ] Install: `npx shadcn@latest add tabs`
- [ ] Active tab: tactical red underline
- [ ] Inactive tabs: steel color

**Files:**
- `components/ui/tabs.tsx`

---

#### 2.1.7 Install Badge (UI, not achievement)
**Priority:** 🟡 P2

**Tasks:**
- [ ] Install: `npx shadcn@latest add badge`
- [ ] Variants: default (red), secondary (steel), success (green)

**Files:**
- `components/ui/badge.tsx`

---

#### 2.1.8 Install Toast/Alert
**Priority:** 🟠 P1

**Tasks:**
- [ ] Install: `npx shadcn@latest add toast`
- [ ] Customize for military theme
- [ ] Success: radar green
- [ ] Error: tactical red
- [ ] Info: steel

**Files:**
- `components/ui/toast.tsx`
- `components/ui/toaster.tsx`
- `components/ui/use-toast.ts`

---

### 2.2 Custom G4G Components 🔴 P0

#### 2.2.1 MissionCard component
**Priority:** 🔴 P0

**Tasks:**
- [ ] Create component with props:
  - `title: string`
  - `description: string`
  - `videoUrl: string`
  - `setsReps: Array<{exercise: string, reps: string}>`
  - `isLocked: boolean`
  - `onComplete: () => void`
- [ ] Layout:
  - Card with tactical red border (1px)
  - Optional diamond plate background texture
  - YouTube embed (responsive 16:9)
  - Sets/reps list with bullet points
  - "COMPLETE MISSION" button at bottom
- [ ] Locked state:
  - Show "CLASSIFIED" overlay
  - Blur content
  - Disable complete button

**Files:**
- `components/ui/mission-card.tsx`

---

#### 2.2.2 BadgeDisplay component
**Priority:** 🟠 P1

**Tasks:**
- [ ] Create component with props:
  - `badges: Array<{name: string, earned: boolean, earnedAt?: Date}>`
- [ ] Layout:
  - 2-column grid
  - Each badge: circle with star icon inside
  - Badge name below
- [ ] States:
  - Locked: 50% opacity, grayscale filter
  - Unlocked: Full color (tactical red/silver), glow effect
- [ ] Add diamond plate texture to background

**Files:**
- `components/ui/badge-display.tsx`

---

#### 2.2.3 ProgressBar component
**Priority:** 🔴 P0

**Tasks:**
- [ ] Create component with props:
  - `current: number`
  - `max: number`
  - `label?: string`
- [ ] Style:
  - Flat, sharp edges (no rounded)
  - Tactical red fill on dark gray track
  - Show percentage text inside bar
- [ ] Animation: smooth width transition

**Files:**
- `components/ui/progress-bar.tsx`

---

#### 2.2.4 RankBadge component
**Priority:** 🔴 P0

**Tasks:**
- [ ] Create component with props:
  - `xp: number`
- [ ] Logic:
  - Calculate rank from XP (Recruit 0-1000, Soldier 1000-5000, Commander 5000+)
  - Display rank name and icon
- [ ] Style:
  - Badge shape with tactical red border
  - Uppercase text
  - Icon based on rank (shield variants)

**Files:**
- `components/ui/rank-badge.tsx`
- `lib/utils/rank-system.ts` (helper functions)

---

#### 2.2.5 Navigation component
**Priority:** 🔴 P0

**Tasks:**
- [ ] Create bottom sticky navigation bar
- [ ] 4 nav items:
  - Home/Missions (Crosshair icon)
  - Nutrition (Utensils icon)
  - Stats (BarChart icon)
  - Profile (Shield icon)
- [ ] Active state: tactical red color
- [ ] Inactive state: steel color
- [ ] Responsive: sticky bottom on mobile, sidebar on desktop

**Files:**
- `components/ui/navigation.tsx`

---

#### 2.2.6 StatsChart wrapper components
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create `ConsistencyChart` wrapper
  - Props: `data: Array<{week: string, count: number}>`
  - Recharts BarChart with tactical red bars
  - Dark tooltip styling
  - Responsive container
- [ ] Create `WeightChart` wrapper
  - Props: `data: Array<{date: string, weight: number}>`
  - Recharts LineChart with radar green line
  - Dark tooltip styling
  - Responsive container

**Files:**
- `components/ui/stats-chart.tsx`

---

#### 2.2.7 TierLockOverlay component
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create component with props:
  - `requiredTier: string`
  - `userTier: string`
- [ ] Display:
  - Semi-transparent dark overlay
  - "CLASSIFIED" text in center
  - Lock icon
  - "UPGRADE TO [tier] TO UNLOCK" message
- [ ] Blur background content

**Files:**
- `components/ui/tier-lock-overlay.tsx`

---

### 2.3 Layout Components 🔴 P0

#### 2.3.1 AppLayout (main layout)
**Priority:** 🔴 P0

**Tasks:**
- [ ] Create layout component
- [ ] Include Navigation component
- [ ] Container with max-width
- [ ] Padding for mobile
- [ ] Props: `children`

**Files:**
- `components/layout/app-layout.tsx`

---

#### 2.3.2 CoachLayout
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create layout for coach dashboard
- [ ] Sidebar navigation for coach features
- [ ] Different color scheme (still dark, but distinct)

**Files:**
- `components/layout/coach-layout.tsx`

---

#### 2.3.3 AuthLayout
**Priority:** 🟠 P1

**Tasks:**
- [ ] Create centered layout for auth pages
- [ ] Logo at top
- [ ] Card in center
- [ ] No navigation

**Files:**
- `components/layout/auth-layout.tsx`

---

## 🔄 PHASE 3: AUTHENTICATION & ONBOARDING

**Priority:** 🔴 P0 (Blocks user features)

**Dependencies:** Phase 1.1-1.3.1 complete, Phase 2.1-2.3.3 complete

**Estimated Time:** 5-6 hours

### 3.1 Supabase Auth Integration 🔴 P0

#### 3.1.1 Auth helper functions
**Priority:** 🔴 P0

**Tasks:**
- [ ] Create `signUpWithEmail(email, password)`
- [ ] Create `signInWithEmail(email, password)`
- [ ] Create `signInWithGoogle()`
- [ ] Create `signOut()`
- [ ] Create `getSession()`
- [ ] Create `getUser()`
- [ ] Add error handling for all functions

**Files:**
- `lib/auth/auth-helpers.ts`

---

#### 3.1.2 Auth context provider
**Priority:** 🔴 P0

**Tasks:**
- [ ] Create React Context for auth state
- [ ] Listen to `onAuthStateChange` from Supabase
- [ ] Provide user object and loading state
- [ ] Wrap app in provider (in root layout)

**Files:**
- `lib/auth/auth-context.tsx`

---

#### 3.1.3 useUser hook
**Priority:** 🔴 P0

**Tasks:**
- [ ] Create hook to access auth context
- [ ] Return: `{ user, loading, profile }`
- [ ] Fetch profile data from profiles table
- [ ] Cache profile data

**Files:**
- `hooks/use-user.ts`

---

#### 3.1.4 Update proxy for auth protection
**Priority:** 🔴 P0

**Tasks:**
- [ ] Update `proxy.ts` to check for session
- [ ] If protected route and no session, redirect to `/login`
- [ ] If auth route and has session, redirect to `/`
- [ ] Add cookie handling for session

**Files:**
- `proxy.ts` (update existing)

---

### 3.2 Authentication UI Pages 🔴 P0

#### 3.2.1 Login page
**Priority:** 🔴 P0

**Tasks:**
- [ ] Create `/login` page
- [ ] Email/password form
- [ ] "Sign in with Google" button
- [ ] Link to signup page
- [ ] Link to password reset
- [ ] Form validation
- [ ] Error handling & display
- [ ] Loading states

**Files:**
- `app/(auth)/login/page.tsx`
- `components/auth/login-form.tsx`

---

#### 3.2.2 Signup page
**Priority:** 🔴 P0

**Tasks:**
- [ ] Create `/signup` page
- [ ] Email/password form with confirmation
- [ ] "Sign up with Google" button
- [ ] Link to login page
- [ ] Form validation (password strength, email format)
- [ ] Error handling & display
- [ ] Loading states
- [ ] Redirect to onboarding after signup

**Files:**
- `app/(auth)/signup/page.tsx`
- `components/auth/signup-form.tsx`

---

#### 3.2.3 Password reset flow
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create `/forgot-password` page
- [ ] Email input form
- [ ] Send reset link via Supabase
- [ ] Success message
- [ ] Create `/reset-password` page (for the link)
- [ ] New password form
- [ ] Update password via Supabase
- [ ] Redirect to login

**Files:**
- `app/(auth)/forgot-password/page.tsx`
- `app/(auth)/reset-password/page.tsx`

---

### 3.3 Day Zero Test (Onboarding) 🔴 P0

#### 3.3.1 Onboarding multi-step form
**Priority:** 🔴 P0

**Tasks:**
- [ ] Create `/onboarding` page (protected, only for new users)
- [ ] Step 1: Welcome screen
- [ ] Step 2: Pushup max reps input
- [ ] Step 3: Squats max reps input (optional)
- [ ] Step 4: Core max time input (optional)
- [ ] Step 5: Results screen with tier assignment
- [ ] Progress indicator (step 1 of 5)
- [ ] "Skip" button for optional steps

**Files:**
- `app/(auth)/onboarding/page.tsx`
- `components/auth/day-zero-test.tsx`

---

#### 3.3.2 Tier assignment logic
**Priority:** 🔴 P0

**Tasks:**
- [ ] Create function `assignTier(pushups: number): string`
- [ ] Logic:
  - `< 10`: return '.223'
  - `10-25`: return '.556'
  - `25-50`: return '.762'
  - `> 50`: return '.50 Cal'
- [ ] Update user profile with assigned tier
- [ ] Show celebration/results UI

**Files:**
- `lib/utils/tier-assignment.ts`

---

#### 3.3.3 Redirect logic after onboarding
**Priority:** 🔴 P0

**Tasks:**
- [ ] After tier assignment, redirect to home (`/`)
- [ ] Update profile to mark onboarding complete
- [ ] Show welcome toast on home page

**Files:**
- `app/(auth)/onboarding/page.tsx` (update)

---

### 3.4 Profile Setup 🟡 P2

#### 3.4.1 Avatar upload component
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create component for avatar upload
- [ ] File input with drag-and-drop
- [ ] Image preview
- [ ] Upload to Supabase Storage (`avatars` bucket)
- [ ] Update profile.avatar_url
- [ ] Image compression before upload
- [ ] Loading state during upload

**Files:**
- `components/auth/avatar-upload.tsx`
- `lib/utils/image-upload.ts`

---

#### 3.4.2 Profile settings page
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create `/profile/settings` page
- [ ] Form to update:
  - Name (if we add to schema)
  - Avatar
  - Notification preferences
- [ ] Save button
- [ ] Success/error messages

**Files:**
- `app/(app)/profile/settings/page.tsx`

---

## 🔄 PHASE 4: WORKOUT ENGINE (Core Feature)

**Priority:** 🔴 P0 (MVP Core)

**Dependencies:** Phase 1 complete, Phase 2 complete, Phase 3 complete

**Estimated Time:** 6-7 hours

### 4.1 Workout Data Layer 🔴 P0

#### 4.1.1 Workout query functions
**Priority:** 🔴 P0

**Tasks:**
- [ ] Create `getWorkoutForToday(userTier: string)`
  - Query workouts where scheduled_date = today AND tier = userTier
  - Return first match
- [ ] Create `getWorkoutsByTier(tier: string)`
- [ ] Create `getAllWorkouts()` (for coach)
- [ ] Add error handling

**Files:**
- `lib/queries/workouts.ts`

---

#### 4.1.2 User log query functions
**Priority:** 🔴 P0

**Tasks:**
- [ ] Create `getUserLogs(userId: string, limit?: number)`
- [ ] Create `hasLoggedToday(userId: string, workoutId: string)`
- [ ] Create `createUserLog(userId, workoutId, duration, notes)`
- [ ] Create `getUserLogStats(userId: string)`
  - Return: total logs, total XP, current streak

**Files:**
- `lib/queries/user-logs.ts`

---

#### 4.1.3 XP calculator utility
**Priority:** 🔴 P0

**Tasks:**
- [ ] Create `calculateXP(logCount: number): number`
  - Simple: 100 XP per log
- [ ] Create `calculateRank(xp: number): string`
  - 0-1000: "Recruit"
  - 1000-5000: "Soldier"
  - 5000+: "Commander"
- [ ] Create `getXPToNextRank(xp: number): number`

**Files:**
- `lib/utils/xp-calculator.ts`
- `lib/utils/rank-system.ts`

---

### 4.2 Mission Display (Home Page) 🔴 P0

#### 4.2.1 Home page layout
**Priority:** 🔴 P0

**Tasks:**
- [ ] Create `/` page (home, missions)
- [ ] Fetch today's workout for user's tier
- [ ] Display daily briefing text at top
- [ ] Show MissionCard with workout data
- [ ] If no workout for today, show "No mission today" message
- [ ] If workout tier > user tier, show locked overlay

**Files:**
- `app/(app)/page.tsx`

---

#### 4.2.2 Daily briefing component
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create component to display motivational text
- [ ] Fetch from config table or hardcode for MVP
- [ ] Hero section styling (large text, tactical red accent)

**Files:**
- `components/ui/daily-briefing.tsx`

---

### 4.3 Workout Logging 🔴 P0

#### 4.3.1 Complete Mission modal
**Priority:** 🔴 P0

**Tasks:**
- [ ] Create modal component
- [ ] Form fields:
  - Duration (number input, minutes)
  - Notes (textarea, optional)
- [ ] "COMPLETE" button
- [ ] On submit:
  - Call `createUserLog()`
  - Show success toast with XP earned
  - Close modal
  - Refresh page data
- [ ] Validation: duration must be > 0
- [ ] Loading state during submit

**Files:**
- `components/workouts/complete-mission-modal.tsx`

---

#### 4.3.2 Check if already logged
**Priority:** 🔴 P0

**Tasks:**
- [ ] On home page load, check `hasLoggedToday()`
- [ ] If true, disable "Complete Mission" button
- [ ] Show "MISSION COMPLETE" badge instead
- [ ] Display log details (duration, notes)

**Files:**
- `app/(app)/page.tsx` (update)

---

### 4.4 XP & Rank System UI 🔴 P0

#### 4.4.1 Rank badge in navigation
**Priority:** 🔴 P0

**Tasks:**
- [ ] Add RankBadge component to navigation/header
- [ ] Display current rank based on user XP
- [ ] Click to show rank details modal

**Files:**
- `components/ui/navigation.tsx` (update)

---

#### 4.4.2 XP progress bar
**Priority:** 🟠 P1

**Tasks:**
- [ ] Add ProgressBar to show XP progress to next rank
- [ ] Display on home page or in profile
- [ ] Show current XP / XP needed for next rank

**Files:**
- `app/(app)/page.tsx` (update)
- `components/ui/progress-bar.tsx` (use existing)

---

#### 4.4.3 Rank up celebration
**Priority:** 🟡 P2

**Tasks:**
- [ ] Detect when user ranks up
- [ ] Show modal with congratulations
- [ ] Animation/confetti effect
- [ ] Display new rank badge

**Files:**
- `components/workouts/rank-up-modal.tsx`

---

### 4.5 Workout History 🟠 P1

#### 4.5.1 Workout history page
**Priority:** 🟠 P1

**Tasks:**
- [ ] Create `/history` page
- [ ] List all user logs, most recent first
- [ ] Display:
  - Workout title
  - Date
  - Duration
  - Notes
  - XP earned
- [ ] Pagination or infinite scroll
- [ ] Filter by date range

**Files:**
- `app/(app)/history/page.tsx`
- `components/workouts/workout-history.tsx`

---

## 🔄 PHASE 5: ANALYTICS & DATA VISUALIZATION

**Priority:** 🟠 P1

**Dependencies:** Phase 4 complete

**Estimated Time:** 4-5 hours

### 5.1 Analytics Data Queries 🟠 P1

#### 5.1.1 Consistency data query
**Priority:** 🟠 P1

**Tasks:**
- [ ] Create `getConsistencyData(userId: string, weeks: number = 4)`
- [ ] Return: Array of `{week: string, count: number}`
- [ ] Aggregate user_logs by week for last N weeks

**Files:**
- `lib/queries/analytics.ts`

---

#### 5.1.2 Body metrics query
**Priority:** 🟠 P1

**Tasks:**
- [ ] Create `getBodyMetrics(userId: string, limit?: number)`
- [ ] Return: Array of `{date: string, weight: number}`
- [ ] Order by recorded_at DESC

**Files:**
- `lib/queries/body-metrics.ts`

---

### 5.2 Consistency Bar Chart 🟠 P1

#### 5.2.1 Consistency chart component
**Priority:** 🟠 P1

**Tasks:**
- [ ] Create component using Recharts BarChart
- [ ] Props: `data: Array<{week: string, count: number}>`
- [ ] X-axis: Week labels (Week 1, Week 2, etc.)
- [ ] Y-axis: Count of logs
- [ ] Bars: Tactical red color
- [ ] Dark themed tooltip
- [ ] Responsive container

**Files:**
- `components/charts/consistency-chart.tsx`

---

### 5.3 Weight Line Chart 🟠 P1

#### 5.3.1 Weight chart component
**Priority:** 🟠 P1

**Tasks:**
- [ ] Create component using Recharts LineChart
- [ ] Props: `data: Array<{date: string, weight: number}>`
- [ ] X-axis: Dates
- [ ] Y-axis: Weight values
- [ ] Line: Radar green color
- [ ] Data points with hover tooltips
- [ ] Dark themed tooltip
- [ ] Responsive container
- [ ] Empty state if no data

**Files:**
- `components/charts/weight-chart.tsx`

---

### 5.4 Weight Entry UI 🟠 P1

#### 5.4.1 Weight entry form
**Priority:** 🟠 P1

**Tasks:**
- [ ] Create form component
- [ ] Date picker (default: today)
- [ ] Number input for weight (with decimal)
- [ ] "LOG WEIGHT" button
- [ ] On submit:
  - Insert to body_metrics table
  - Show success toast
  - Refresh chart data
- [ ] Validation: weight > 0

**Files:**
- `components/stats/weight-entry-form.tsx`

---

#### 5.4.2 Weight history list
**Priority:** 🟡 P2

**Tasks:**
- [ ] List historical weight entries
- [ ] Show date and weight
- [ ] Edit button (opens pre-filled form)
- [ ] Delete button (with confirmation)

**Files:**
- `components/stats/weight-history.tsx`

---

### 5.5 Stats Dashboard Page 🟠 P1

#### 5.5.1 Stats page layout
**Priority:** 🟠 P1

**Tasks:**
- [ ] Create `/stats` page
- [ ] Display ConsistencyChart at top
- [ ] Display WeightChart below
- [ ] Weight entry form on side or below charts
- [ ] Summary metrics:
  - Total workouts
  - Current streak
  - Average workouts per week
- [ ] Time range filter (4 weeks, 12 weeks, all time)

**Files:**
- `app/(app)/stats/page.tsx`

---

## 🔄 PHASE 6: GAMIFICATION (Badges & Buddies)

**Priority:** 🟡 P2

**Dependencies:** Phase 4 complete

**Estimated Time:** 5-6 hours

### 6.1 Badge System 🟠 P1

#### 6.1.1 Badge constants & definitions
**Priority:** 🟠 P1

**Tasks:**
- [ ] Create badge definitions:
  ```typescript
  {
    name: "First Blood",
    description: "Complete your first workout",
    icon: "target"
  }
  ```
- [ ] Define all badges:
  - First Blood (1st workout)
  - Iron Week (7-day streak)
  - Century (100 workouts)
  - etc.

**Files:**
- `lib/constants/badges.ts`

---

#### 6.1.2 Badge query functions
**Priority:** 🟠 P1

**Tasks:**
- [ ] Create `getUserBadges(userId: string)`
- [ ] Return array of earned badges with earnedAt dates
- [ ] Combine with badge definitions to show locked/unlocked

**Files:**
- `lib/queries/badges.ts`

---

#### 6.1.3 Badge display on profile
**Priority:** 🟠 P1

**Tasks:**
- [ ] Add BadgeDisplay component to profile page
- [ ] Fetch user badges
- [ ] Show all badges (locked + unlocked)
- [ ] Locked state: grayscale, 50% opacity
- [ ] Unlocked state: full color, glow effect
- [ ] Click badge to show details modal

**Files:**
- `app/(app)/profile/page.tsx`
- `components/gamification/badge-grid.tsx` (use existing BadgeDisplay)

---

#### 6.1.4 Badge earned notification
**Priority:** 🟡 P2

**Tasks:**
- [ ] Listen for new badges after workout log
- [ ] Show toast notification when badge earned
- [ ] Optional: Show modal with badge animation

**Files:**
- `components/gamification/badge-earned-toast.tsx`

---

### 6.2 Streak Calculation UI 🟠 P1

#### 6.2.1 Streak display
**Priority:** 🟠 P1

**Tasks:**
- [ ] Display current streak on profile page
- [ ] Fire icon with streak number
- [ ] "X days in a row" text
- [ ] If streak > 24h inactive, show warning

**Files:**
- `components/gamification/streak-display.tsx`

---

#### 6.2.2 Streak broken warning
**Priority:** 🟡 P2

**Tasks:**
- [ ] Check last_active timestamp
- [ ] If > 24 hours since last log, show warning
- [ ] "Your streak is at risk!" message
- [ ] Call to action: "Complete a mission today"

**Files:**
- `components/gamification/streak-warning.tsx`

---

### 6.3 Buddy System 🟡 P2

#### 6.3.1 Buddy search component
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create search form (email input)
- [ ] Query profiles by email
- [ ] Show search results
- [ ] "Add Buddy" button
- [ ] On click:
  - Insert to buddies table with status='pending'
  - Show success message

**Files:**
- `components/gamification/buddy-search.tsx`

---

#### 6.3.2 Buddy request handling
**Priority:** 🟡 P2

**Tasks:**
- [ ] Query buddies where buddy_id = current user AND status='pending'
- [ ] Show list of pending requests
- [ ] "Accept" button:
  - Update status to 'accepted'
  - Show success toast
- [ ] "Reject" button:
  - Delete buddy record
  - Show confirmation

**Files:**
- `components/gamification/buddy-requests.tsx`

---

#### 6.3.3 Buddy list component
**Priority:** 🟡 P2

**Tasks:**
- [ ] Query buddies where status='accepted'
- [ ] Display list with:
  - Buddy name/email
  - Avatar
  - Last active timestamp
  - "Wake Up" button (if inactive > 24h)
- [ ] Click buddy to view their public profile

**Files:**
- `components/gamification/buddy-list.tsx`

---

### 6.4 Buddy Nudging 🟡 P2

#### 6.4.1 Wake Up button logic
**Priority:** 🟡 P2

**Tasks:**
- [ ] Enable button only if buddy last_active > 24h
- [ ] On click:
  - Call Supabase Edge Function to send notification
  - Show "Nudge sent!" toast
- [ ] Cooldown: Can only nudge once per 24h

**Files:**
- `components/gamification/buddy-list.tsx` (update)

---

#### 6.4.2 Supabase Edge Function for nudge
**Priority:** 🟢 P3

**Tasks:**
- [ ] Create Edge Function `send-buddy-nudge`
- [ ] Receive: sender_id, buddy_id
- [ ] Send email via Supabase Auth email templates
- [ ] Or: Insert notification to messages table
- [ ] Return success/error

**Files:**
- `supabase/functions/send-buddy-nudge/index.ts`

---

## 🔄 PHASE 7: MEAL PLANNER (Premium Feature)

**Priority:** 🟡 P2

**Dependencies:** Phase 3 complete, Phase 8.1-8.2 complete (premium check)

**Estimated Time:** 5-6 hours

### 7.1 Recipe Data Layer 🟡 P2

#### 7.1.1 Recipe query functions
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create `getAllRecipes()`
- [ ] Create `getRecipeById(id: string)`
- [ ] Create `getMealPlansForWeek(userId: string, startDate: string)`
- [ ] Create `assignMealToDay(userId, recipeId, date)`
- [ ] Create `removeMealFromDay(userId, date)`

**Files:**
- `lib/queries/recipes.ts`
- `lib/queries/meal-plans.ts`

---

### 7.2 Recipe Bank UI 🟡 P2

#### 7.2.1 Recipe card component
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create component
- [ ] Display:
  - Recipe image
  - Title
  - Macros (calories, protein, carbs, fat)
- [ ] Click to view full recipe

**Files:**
- `components/nutrition/recipe-card.tsx`

---

#### 7.2.2 Recipe bank grid
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create grid layout for all recipes
- [ ] Search/filter by name or macros
- [ ] Click recipe to open detail modal

**Files:**
- `components/nutrition/recipe-bank.tsx`

---

#### 7.2.3 Recipe detail modal
**Priority:** 🟡 P2

**Tasks:**
- [ ] Show full recipe:
  - Image (large)
  - Title
  - Macros
  - Instructions
- [ ] "ADD TO MEAL PLAN" button

**Files:**
- `components/nutrition/recipe-detail.tsx`

---

### 7.3 Weekly Meal Planner 🟡 P2

#### 7.3.1 Weekly calendar component
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create 7-day horizontal calendar (Mon-Sun)
- [ ] Each day shows:
  - Day name
  - Assigned meal (if any)
  - "Add Meal" button
- [ ] Click day:
  - Open recipe bank selector
  - Select recipe
  - Assign to that day

**Files:**
- `components/nutrition/weekly-planner.tsx`

---

#### 7.3.2 Meal assignment logic
**Priority:** 🟡 P2

**Tasks:**
- [ ] On day click, open recipe bank
- [ ] On recipe select:
  - Call `assignMealToDay(userId, recipeId, date)`
  - Close selector
  - Refresh calendar
- [ ] "Remove" button on assigned meals

**Files:**
- `components/nutrition/weekly-planner.tsx` (update)

---

### 7.4 Today's Ration Display 🟡 P2

#### 7.4.1 Today's ration widget
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create component for home page or nutrition page
- [ ] Fetch today's assigned meal
- [ ] Display:
  - "TODAY'S RATION" heading
  - Recipe image
  - Recipe name
  - Macros
- [ ] Click to view full recipe
- [ ] If no meal assigned, show "No ration assigned"

**Files:**
- `components/nutrition/todays-ration.tsx`

---

### 7.5 Premium Gating 🟡 P2

#### 7.5.1 Paywall overlay component
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create overlay component
- [ ] Display:
  - Lock icon
  - "UPGRADE TO SOLDIER" message
  - "Unlock meal planner and advanced features"
  - "UPGRADE NOW" button (links to pricing page)
- [ ] Semi-transparent dark background

**Files:**
- `components/premium/paywall-overlay.tsx`

---

#### 7.5.2 Premium check on nutrition page
**Priority:** 🟡 P2

**Tasks:**
- [ ] On `/nutrition` page load, check user role
- [ ] If role != 'soldier' and role != 'coach':
  - Show paywall overlay
  - Blur content behind
- [ ] If premium, show full meal planner

**Files:**
- `app/(app)/nutrition/page.tsx`

---

## 🔄 PHASE 8: MONETIZATION (Stripe)

**Priority:** 🟡 P2

**Dependencies:** Phase 3 complete

**Estimated Time:** 4-5 hours

### 8.1 Stripe Setup 🟡 P2

#### 8.1.1 Stripe configuration
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create Stripe account
- [ ] Get publishable key and secret key
- [ ] Add to `.env.local`
- [ ] Create product in Stripe Dashboard: "Soldier Tier"
- [ ] Create price: $9.99/month (or your pricing)
- [ ] Get price ID

**Files:**
- `.env.local` (update)

---

#### 8.1.2 Stripe client initialization
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create Stripe client wrapper
- [ ] Initialize with secret key (server-side only)

**Files:**
- `lib/stripe/stripe-client.ts`

---

### 8.2 Pricing Page 🟡 P2

#### 8.2.1 Pricing page layout
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create `/pricing` page
- [ ] Display two tiers:
  - **Recruit (Free)**:
    - Tier 1 workouts
    - Basic stats
    - XP & badges
  - **Soldier ($9.99/mo)**:
    - All tier workouts
    - Meal planner
    - Advanced charts
    - Priority support
- [ ] "UPGRADE NOW" button on Soldier tier

**Files:**
- `app/(app)/pricing/page.tsx`
- `components/pricing/pricing-card.tsx`

---

#### 8.2.2 Feature comparison table
**Priority:** 🟢 P3

**Tasks:**
- [ ] Create table comparing Recruit vs Soldier features
- [ ] Checkmarks and X marks for each feature
- [ ] Tactical styling

**Files:**
- `components/pricing/feature-comparison.tsx`

---

### 8.3 Stripe Checkout Flow 🟡 P2

#### 8.3.1 Create checkout session API route
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create `/api/create-checkout-session` POST route
- [ ] Receive: user_id (from session)
- [ ] Create Stripe Checkout session:
  - line_items: [{ price: PRICE_ID, quantity: 1 }]
  - metadata: { user_id }
  - success_url: `${APP_URL}/success`
  - cancel_url: `${APP_URL}/pricing`
- [ ] Return: { sessionId }

**Files:**
- `app/api/create-checkout-session/route.ts`

---

#### 8.3.2 Redirect to Stripe Checkout
**Priority:** 🟡 P2

**Tasks:**
- [ ] On "UPGRADE NOW" button click:
  - Call `/api/create-checkout-session`
  - Get sessionId
  - Redirect to Stripe Checkout using Stripe JS
- [ ] Handle loading state
- [ ] Handle errors

**Files:**
- `components/pricing/upgrade-button.tsx`

---

#### 8.3.3 Success page
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create `/success` page
- [ ] Show "Payment successful!" message
- [ ] "Your account will be upgraded shortly"
- [ ] Link to return home

**Files:**
- `app/(app)/success/page.tsx`

---

### 8.4 Stripe Webhook Handling 🟡 P2

#### 8.4.1 Webhook endpoint
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create `/api/webhooks/stripe` POST route
- [ ] Verify webhook signature using Stripe webhook secret
- [ ] Handle events:
  - `checkout.session.completed`:
    - Extract user_id from metadata
    - Update profiles.role to 'soldier'
  - `customer.subscription.deleted`:
    - Update profiles.role to 'user'
- [ ] Return 200 response

**Files:**
- `app/api/webhooks/stripe/route.ts`
- `lib/stripe/webhook-handlers.ts`

---

#### 8.4.2 Configure webhook in Stripe
**Priority:** 🟡 P2

**Tasks:**
- [ ] In Stripe Dashboard, add webhook endpoint
- [ ] URL: `YOUR_DOMAIN/api/webhooks/stripe`
- [ ] Events to listen:
  - `checkout.session.completed`
  - `customer.subscription.deleted`
  - `customer.subscription.updated`
- [ ] Get webhook signing secret
- [ ] Add to `.env.local`

**Files:**
- `.env.local` (update with STRIPE_WEBHOOK_SECRET)

---

### 8.5 Subscription Management UI 🟢 P3

#### 8.5.1 Display current tier on profile
**Priority:** 🟢 P3

**Tasks:**
- [ ] On profile page, show current tier badge
- [ ] "Recruit" or "Soldier"
- [ ] If Soldier, show "Manage Subscription" button

**Files:**
- `app/(app)/profile/page.tsx` (update)

---

#### 8.5.2 Manage subscription (Stripe portal)
**Priority:** 🟢 P3

**Tasks:**
- [ ] Create `/api/create-portal-session` POST route
- [ ] Create Stripe customer portal session
- [ ] Redirect user to Stripe portal
- [ ] User can cancel/update subscription there

**Files:**
- `app/api/create-portal-session/route.ts`

---

## 🔄 PHASE 9: COACH DASHBOARD

**Priority:** 🟡 P2

**Dependencies:** Phase 4 complete

**Estimated Time:** 6-7 hours

### 9.1 Role-Based Access Control 🟡 P2

#### 9.1.1 Update proxy for coach routes
**Priority:** 🟡 P2

**Tasks:**
- [ ] In `proxy.ts`, check `/coach/*` routes
- [ ] Fetch user profile
- [ ] If role != 'coach', redirect to `/`
- [ ] Allow access if role = 'coach'

**Files:**
- `proxy.ts` (update)

---

### 9.2 Roster View 🟡 P2

#### 9.2.1 Coach roster query
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create `getCoachRoster(coachId: string)`
- [ ] Query profiles where coach_id = coachId
- [ ] Return: user list with stats (last_active, xp, streak, tier)

**Files:**
- `lib/queries/coach-roster.ts`

---

#### 9.2.2 Roster page layout
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create `/coach/roster` page
- [ ] Fetch coach roster
- [ ] Display table/grid:
  - User name/email
  - Tier
  - XP
  - Current streak
  - Last active
- [ ] Click user to open spy view
- [ ] Sort and filter options (by tier, by last_active)

**Files:**
- `app/(coach)/coach/roster/page.tsx`
- `components/coach/roster-table.tsx`

---

### 9.3 Spy Mode 🟡 P2

#### 9.3.1 Spy mode page
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create `/coach/spy/[userId]` page
- [ ] Fetch user profile
- [ ] Display (read-only):
  - Profile info (name, email, tier, xp, streak)
  - Workout logs (history)
  - Analytics charts (consistency, weight)
  - Badges earned
- [ ] "Back to Roster" button

**Files:**
- `app/(coach)/coach/spy/[userId]/page.tsx`
- `components/coach/spy-view.tsx`

---

### 9.4 Messaging System 🟡 P2

#### 9.4.1 Message query functions
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create `getMessages(userId: string)`
  - Return messages where sender_id = userId OR receiver_id = userId
- [ ] Create `sendMessage(senderId, receiverId, content)`
- [ ] Create `markAsRead(messageId: string)`

**Files:**
- `lib/queries/messages.ts`

---

#### 9.4.2 Coach inbox page
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create `/coach/messages` page
- [ ] Fetch all messages for coach
- [ ] Display list:
  - Sender name
  - Message preview (first 50 chars)
  - Timestamp
  - Unread indicator
- [ ] Click message to open conversation

**Files:**
- `app/(coach)/coach/messages/page.tsx`
- `components/coach/message-inbox.tsx`

---

#### 9.4.3 Conversation view
**Priority:** 🟡 P2

**Tasks:**
- [ ] Display full conversation between coach and user
- [ ] Message bubbles (sender on right, receiver on left)
- [ ] Reply form at bottom
- [ ] On send:
  - Call `sendMessage()`
  - Add to conversation
  - Mark received messages as read

**Files:**
- `components/coach/conversation-view.tsx`

---

#### 9.4.4 Polling for new messages
**Priority:** 🟡 P2

**Tasks:**
- [ ] Use SWR or Tanstack Query
- [ ] Poll `/api/messages` every 30 seconds
- [ ] Update unread count badge
- [ ] Refresh conversation if open

**Files:**
- `hooks/use-messages-polling.ts`

---

### 9.5 User-Side Messaging 🟡 P2

#### 9.5.1 Message Coach button
**Priority:** 🟡 P2

**Tasks:**
- [ ] Add button to user profile page
- [ ] Opens message compose modal
- [ ] Send message to assigned coach (profiles.coach_id)

**Files:**
- `app/(app)/profile/page.tsx` (update)
- `components/coach/message-composer.tsx`

---

## 🔄 PHASE 10: CONTENT MANAGEMENT (Coach Admin)

**Priority:** 🟡 P2

**Dependencies:** Phase 9.1 complete

**Estimated Time:** 6-7 hours

### 10.1 Workout Manager 🟡 P2

#### 10.1.1 Workout list page
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create `/coach/content/workouts` page
- [ ] Fetch all workouts
- [ ] Display table:
  - Title
  - Tier
  - Scheduled date
  - Edit button
  - Delete button
- [ ] "CREATE WORKOUT" button at top

**Files:**
- `app/(coach)/coach/content/workouts/page.tsx`

---

#### 10.1.2 Create workout form
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create modal or separate page
- [ ] Form fields:
  - Title (text input)
  - Description (textarea)
  - Tier (select: .223, .556, .762, .50 Cal)
  - Video URL (text input, YouTube URL or video ID)
  - Scheduled date (date picker)
  - Sets/Reps (dynamic form fields):
    - Exercise name (text)
    - Reps (text, e.g., "20" or "3x10")
    - Add/remove exercise buttons
- [ ] On submit:
  - Validate fields
  - Insert to workouts table
  - Show success toast
  - Redirect to workout list

**Files:**
- `components/coach/workout-form.tsx`

---

#### 10.1.3 Edit workout form
**Priority:** 🟡 P2

**Tasks:**
- [ ] Reuse workout form component
- [ ] Pre-populate with existing workout data
- [ ] On submit:
  - Update workouts table
  - Show success toast

**Files:**
- `components/coach/workout-form.tsx` (update for edit mode)

---

#### 10.1.4 Delete workout
**Priority:** 🟡 P2

**Tasks:**
- [ ] Confirmation modal: "Are you sure?"
- [ ] On confirm:
  - Delete from workouts table
  - Show success toast
  - Refresh workout list
- [ ] Check if workout has user_logs (cascade delete or prevent?)

**Files:**
- `app/(coach)/coach/content/workouts/page.tsx` (update)

---

### 10.2 Recipe Manager 🟡 P2

#### 10.2.1 Recipe list page
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create `/coach/content/recipes` page
- [ ] Fetch all recipes
- [ ] Display grid of recipe cards
- [ ] Edit and delete buttons on each card
- [ ] "CREATE RECIPE" button at top

**Files:**
- `app/(coach)/coach/content/recipes/page.tsx`

---

#### 10.2.2 Create recipe form
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create modal or separate page
- [ ] Form fields:
  - Title (text input)
  - Instructions (textarea or rich text editor)
  - Image upload (to content_assets bucket)
  - Calories (number input)
  - Protein (number input)
  - Carbs (number input)
  - Fat (number input)
- [ ] On submit:
  - Upload image to Supabase Storage
  - Get image URL
  - Insert to recipes table with image_url
  - Show success toast
  - Redirect to recipe list

**Files:**
- `components/coach/recipe-form.tsx`
- `lib/utils/image-upload.ts` (reuse from avatar upload)

---

#### 10.2.3 Edit recipe form
**Priority:** 🟡 P2

**Tasks:**
- [ ] Reuse recipe form component
- [ ] Pre-populate with existing recipe data
- [ ] Allow replacing image
- [ ] On submit: Update recipes table

**Files:**
- `components/coach/recipe-form.tsx` (update for edit mode)

---

#### 10.2.4 Delete recipe
**Priority:** 🟡 P2

**Tasks:**
- [ ] Confirmation modal
- [ ] On confirm:
  - Delete from recipes table
  - Delete image from content_assets bucket
  - Show success toast

**Files:**
- `app/(coach)/coach/content/recipes/page.tsx` (update)

---

### 10.3 Daily Briefing Management 🟢 P3

#### 10.3.1 Briefing editor page
**Priority:** 🟢 P3

**Tasks:**
- [ ] Create `/coach/content/briefing` page
- [ ] Simple textarea for motivational text
- [ ] "SAVE" button
- [ ] Store in config table or profiles metadata (coach-specific)
- [ ] Display on home page for all users

**Files:**
- `app/(coach)/coach/content/briefing/page.tsx`

---

### 10.4 Asset Management 🟢 P3

#### 10.4.1 Asset uploader
**Priority:** 🟢 P3

**Tasks:**
- [ ] Create page to upload generic assets
- [ ] File input (multiple files)
- [ ] Upload to content_assets bucket
- [ ] Show list of uploaded assets
- [ ] Copy URL button
- [ ] Delete button

**Files:**
- `app/(coach)/coach/content/assets/page.tsx`
- `components/coach/asset-uploader.tsx`

---

## 🔄 PHASE 11: PWA FEATURES & OPTIMIZATION

**Priority:** 🟢 P3

**Dependencies:** Phase 4-10 complete

**Estimated Time:** 6-8 hours

### 11.1 PWA Manifest Enhancements 🟢 P3

#### 11.1.1 Create app icons
**Priority:** 🟢 P3

**Tasks:**
- [ ] Design military-themed app icon
- [ ] Generate all icon sizes (72x72 to 512x512)
- [ ] Save to `/public/icons/`
- [ ] Verify manifest.json references correct paths

**Files:**
- `public/icons/icon-*.png`
- `public/manifest.json` (verify)

---

### 11.2 Service Worker 🟢 P3

#### 11.2.1 Service worker setup
**Priority:** 🟢 P3

**Tasks:**
- [ ] Create service worker file
- [ ] Cache static assets (CSS, JS, images)
- [ ] Cache API responses with stale-while-revalidate strategy
- [ ] Offline fallback page
- [ ] Register service worker in app

**Files:**
- `public/sw.js`
- `app/layout.tsx` (register SW)

---

#### 11.2.2 Offline fallback page
**Priority:** 🟢 P3

**Tasks:**
- [ ] Create `/offline` page
- [ ] Show "You're offline" message
- [ ] Military-themed design
- [ ] "Retry" button

**Files:**
- `app/offline/page.tsx`

---

### 11.3 Install Prompt 🟢 P3

#### 11.3.1 Custom install prompt
**Priority:** 🟢 P3

**Tasks:**
- [ ] Detect if app is installable
- [ ] Show custom banner: "Install G4G for quick access"
- [ ] "INSTALL" button triggers native install prompt
- [ ] Don't show again if dismissed or installed
- [ ] Store preference in localStorage

**Files:**
- `components/pwa/install-prompt.tsx`
- `hooks/use-pwa-install.ts`

---

### 11.4 Push Notifications (Optional) 🟢 P3

#### 11.4.1 Request notification permission
**Priority:** 🟢 P3

**Tasks:**
- [ ] Show prompt to enable notifications
- [ ] Save permission status
- [ ] Register push subscription with Supabase

**Files:**
- `components/pwa/notification-prompt.tsx`

---

#### 11.4.2 Send push notifications
**Priority:** 🟢 P3

**Tasks:**
- [ ] Buddy nudge: Send push when Wake Up clicked
- [ ] Workout reminder: Daily at specific time
- [ ] Streak at risk: If > 20h since last log

**Files:**
- `supabase/functions/send-push-notification/index.ts`

---

### 11.5 Performance Optimization 🟢 P3

#### 11.5.1 Image optimization
**Priority:** 🟢 P3

**Tasks:**
- [ ] Ensure all images use next/image
- [ ] Add width/height to prevent CLS
- [ ] Use blur placeholders
- [ ] Lazy load images below fold

**Files:**
- All components with images

---

#### 11.5.2 Code splitting & lazy loading
**Priority:** 🟢 P3

**Tasks:**
- [ ] Dynamic import for heavy components (charts, coach dashboard)
- [ ] Lazy load routes
- [ ] Analyze bundle size: `npm run build`

**Files:**
- Various component imports

---

#### 11.5.3 Database query optimization
**Priority:** 🟢 P3

**Tasks:**
- [ ] Add indexes to frequently queried columns
- [ ] Review RLS policies for performance
- [ ] Use select() to limit returned fields
- [ ] Pagination for large lists

**Files:**
- Database migration (add indexes)
- Query functions

---

#### 11.5.4 Lighthouse audit
**Priority:** 🟢 P3

**Tasks:**
- [ ] Run Lighthouse on all major pages
- [ ] Target 90+ on mobile:
  - Performance
  - Accessibility
  - Best Practices
  - SEO
- [ ] Fix identified issues

**Tasks tracked in Lighthouse report**

---

### 11.6 Error Handling 🟢 P3

#### 11.6.1 Global error boundary
**Priority:** 🟢 P3

**Tasks:**
- [ ] Create error boundary component
- [ ] Wrap app in error boundary
- [ ] Show military-themed error page
- [ ] "REPORT ERROR" button (logs to monitoring service)

**Files:**
- `components/error/error-boundary.tsx`
- `app/error.tsx`

---

#### 11.6.2 API error handling
**Priority:** 🟢 P3

**Tasks:**
- [ ] Standardize error responses from API routes
- [ ] Display user-friendly error messages
- [ ] Log errors to monitoring service (Sentry)

**Files:**
- `lib/utils/error-handler.ts`
- All API routes

---

#### 11.6.3 Supabase connection error handling
**Priority:** 🟢 P3

**Tasks:**
- [ ] Wrap Supabase queries in try-catch
- [ ] Display toast on connection errors
- [ ] Retry logic for transient failures

**Files:**
- All query functions

---

## 🔄 PHASE 12: TESTING & DEPLOYMENT

**Priority:** 🟢 P3

**Dependencies:** All phases complete

**Estimated Time:** 8-10 hours

### 12.1 Testing 🟢 P3

#### 12.1.1 Unit tests for utilities
**Priority:** 🟢 P3

**Tasks:**
- [ ] Test `xp-calculator.ts`
  - calculateXP()
  - calculateRank()
  - getXPToNextRank()
- [ ] Test `tier-assignment.ts`
  - assignTier() with various pushup counts
- [ ] Test `streak-calculator.ts` (if created)

**Files:**
- `__tests__/utils/xp-calculator.test.ts`
- `__tests__/utils/tier-assignment.test.ts`

---

#### 12.1.2 Integration tests for API routes
**Priority:** 🟢 P3

**Tasks:**
- [ ] Test `/api/create-checkout-session`
- [ ] Test `/api/webhooks/stripe`
- [ ] Mock Supabase and Stripe clients

**Files:**
- `__tests__/api/checkout.test.ts`
- `__tests__/api/webhooks.test.ts`

---

#### 12.1.3 E2E tests for critical flows
**Priority:** 🟢 P3

**Tasks:**
- [ ] Test signup flow:
  - User signs up
  - Completes Day Zero Test
  - Redirects to home
- [ ] Test workout log flow:
  - User logs workout
  - Earns XP
  - Badge awarded
- [ ] Test meal plan flow:
  - User upgrades (mock Stripe)
  - Assigns meal to day
  - Views in calendar

**Files:**
- `e2e/signup-flow.spec.ts`
- `e2e/workout-log.spec.ts`
- `e2e/meal-plan.spec.ts`

---

#### 12.1.4 Manual QA testing
**Priority:** 🟢 P3

**Tasks:**
- [ ] Test on multiple devices:
  - iPhone Safari
  - Android Chrome
  - Desktop Chrome
  - Desktop Safari
- [ ] Test all user flows
- [ ] Test coach dashboard features
- [ ] Test premium features (Stripe test mode)

**Tracked in QA checklist**

---

### 12.2 Documentation 🟢 P3

#### 12.2.1 README enhancements
**Priority:** 🟢 P3

**Tasks:**
- [ ] Add deployment instructions
- [ ] Add environment variable descriptions
- [ ] Add screenshots
- [ ] Add troubleshooting section

**Files:**
- `README.md` (update)

---

#### 12.2.2 Database schema diagram
**Priority:** 🟢 P3

**Tasks:**
- [ ] Create visual diagram of all tables and relationships
- [ ] Export as image
- [ ] Add to docs/

**Files:**
- `docs/DATABASE_SCHEMA.md`
- `docs/schema-diagram.png`

---

#### 12.2.3 API endpoint documentation
**Priority:** 🟢 P3

**Tasks:**
- [ ] Document all API routes:
  - Endpoint
  - Method
  - Request body
  - Response format
  - Error codes

**Files:**
- `docs/API.md`

---

#### 12.2.4 Coach user guide
**Priority:** 🟢 P3

**Tasks:**
- [ ] Write guide for coach users:
  - How to create workouts
  - How to manage recipes
  - How to view roster
  - How to message users

**Files:**
- `docs/COACH_GUIDE.md`

---

### 12.3 Deployment Setup 🟠 P1

#### 12.3.1 Vercel project setup
**Priority:** 🟠 P1

**Tasks:**
- [ ] Create Vercel account (if needed)
- [ ] Connect GitHub repo
- [ ] Configure build settings:
  - Framework: Next.js
  - Build command: `npm run build`
  - Output directory: `.next`
- [ ] Add environment variables to Vercel

**Vercel Dashboard**

---

#### 12.3.2 Production Supabase project
**Priority:** 🟠 P1

**Tasks:**
- [ ] Create production Supabase project
- [ ] Run all migrations
- [ ] Set up storage buckets
- [ ] Seed initial data (sample workouts, recipes)
- [ ] Get production credentials
- [ ] Add to Vercel environment variables

**Supabase Dashboard**

---

#### 12.3.3 Stripe production setup
**Priority:** 🟡 P2

**Tasks:**
- [ ] Switch Stripe to live mode
- [ ] Create live product and price
- [ ] Update webhook endpoint to production URL
- [ ] Get live API keys
- [ ] Add to Vercel environment variables

**Stripe Dashboard**

---

#### 12.3.4 Custom domain & SSL
**Priority:** 🟡 P2

**Tasks:**
- [ ] Purchase domain (e.g., glutton4games.com)
- [ ] Configure DNS in Vercel
- [ ] SSL automatically handled by Vercel
- [ ] Update APP_URL in environment variables

**Vercel Dashboard + Domain registrar**

---

### 12.4 Production Deployment 🟠 P1

#### 12.4.1 Deploy to Vercel
**Priority:** 🟠 P1

**Tasks:**
- [ ] Push code to GitHub main branch
- [ ] Vercel auto-deploys
- [ ] Monitor build logs
- [ ] Fix any build errors

**Vercel Dashboard**

---

#### 12.4.2 Verify production deployment
**Priority:** 🟠 P1

**Tasks:**
- [ ] Test all critical flows in production:
  - Signup/login
  - Day Zero Test
  - Workout logging
  - XP & badges
  - Stripe checkout (small test payment)
  - Webhook (verify role update)
- [ ] Check database connections
- [ ] Check storage uploads
- [ ] Check Stripe webhook delivery

**Manual testing in production**

---

### 12.5 Monitoring & Analytics 🟡 P2

#### 12.5.1 Error tracking setup
**Priority:** 🟡 P2

**Tasks:**
- [ ] Create Sentry account
- [ ] Install Sentry SDK: `npm install @sentry/nextjs`
- [ ] Configure Sentry:
  - DSN in environment variables
  - Source maps upload
- [ ] Test error tracking

**Files:**
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `next.config.js` (update for Sentry)

---

#### 12.5.2 Analytics setup
**Priority:** 🟡 P2

**Tasks:**
- [ ] Enable Vercel Analytics (free)
- [ ] Or: Set up Google Analytics 4
- [ ] Track key events:
  - Signup
  - Workout log
  - Upgrade to Soldier
  - Badge earned

**Files:**
- `app/layout.tsx` (add analytics script)

---

#### 12.5.3 Uptime monitoring
**Priority:** 🟡 P2

**Tasks:**
- [ ] Set up uptime monitor (e.g., UptimeRobot, free)
- [ ] Monitor: `YOUR_DOMAIN/`
- [ ] Alert on downtime via email

**External service**

---

#### 12.5.4 Database performance monitoring
**Priority:** 🟢 P3

**Tasks:**
- [ ] Review Supabase Dashboard metrics
- [ ] Set up slow query alerts
- [ ] Monitor database size and scaling needs

**Supabase Dashboard**

---

## Summary: Task Priorities

### 🔴 P0 - Critical (Must have for MVP)
- Phase 0: ✅ Complete
- Phase 1.1-1.4: Database setup, RLS, functions
- Phase 2.1-2.3: Core UI components
- Phase 3.1-3.3: Authentication & onboarding
- Phase 4: Workout engine (core feature)

### 🟠 P1 - High (Essential for launch)
- Phase 1.5: Storage buckets
- Phase 5: Analytics & charts
- Phase 6.1-6.2: Badge system & streaks
- Phase 12.3-12.4: Deployment

### 🟡 P2 - Medium (Important but not blocking)
- Phase 6.3-6.4: Buddy system
- Phase 7: Meal planner (premium)
- Phase 8: Stripe monetization
- Phase 9: Coach dashboard
- Phase 10: Content management
- Phase 12.5: Monitoring

### 🟢 P3 - Low (Nice to have, polish)
- Phase 11: PWA features, optimization
- Phase 12.1-12.2: Testing & documentation

---

## Recommended Implementation Order

1. **Phase 1** (Database) - 3-4 hours
2. **Phase 2** (UI Components) - 4-5 hours (can overlap with Phase 1)
3. **Phase 3** (Auth) - 5-6 hours
4. **Phase 4** (Workout Engine) - 6-7 hours
5. **Phase 5** (Analytics) - 4-5 hours
6. **Phase 6.1-6.2** (Badges) - 3-4 hours
7. **Deploy MVP** (Phase 12.3-12.4) - 2-3 hours

**MVP Total: ~30-35 hours**

Then add premium features:
8. **Phase 7** (Meal Planner) - 5-6 hours
9. **Phase 8** (Stripe) - 4-5 hours
10. **Phase 9** (Coach Dashboard) - 6-7 hours
11. **Phase 10** (Content Management) - 6-7 hours
12. **Phase 6.3-6.4** (Buddy System) - 3-4 hours

**Full Feature Set Total: ~60-70 hours**

Polish and optimization:
13. **Phase 11** (PWA) - 6-8 hours
14. **Phase 12.1-12.2** (Testing) - 8-10 hours

**Production-Ready Total: ~75-90 hours**
