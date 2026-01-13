# New Database Setup Guide - Glutton4Gainz

## Quick Summary

✅ **Consolidated migration file created**: `supabase/consolidated_migration.sql`
- **Size**: 104KB (2,991 lines)
- **Total Migrations**: 34 migrations (includes migration 058 - notifications table)
- **All features**: Zero-Day Assessment, Formation Feed, Challenges, Meal Planner, Notifications, etc.

---

## Step-by-Step Setup Process

### Step 1: Create New Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - **Project Name**: glutton4gainz (or your preferred name)
   - **Database Password**: (Save this securely!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait 2-3 minutes for project to be ready

### Step 2: Apply Database Migrations

**Option A: Via Supabase Dashboard (Easiest)**

1. In your new project, go to **SQL Editor** (left sidebar)
2. Click "New query"
3. Open the file: `supabase/consolidated_migration.sql`
4. Copy ALL contents (Cmd+A, Cmd+C)
5. Paste into SQL Editor (Cmd+V)
6. Click **"Run"** button (or press Cmd+Enter)
7. Wait for execution (should take 10-30 seconds)
8. You should see: "Success. No rows returned"

**Option B: Via Supabase CLI (Advanced)**

```bash
# Link to your new project
supabase link --project-ref YOUR_NEW_PROJECT_REF

# Push the consolidated migration
supabase db push
```

### Step 3: Update Environment Variables

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy your new credentials
3. Update your `.env.local` file:

```bash
# Old credentials (backup first!)
# cp .env.local .env.local.backup

# Update with new values:
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_NEW_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key_here

# Keep other vars the same:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_SECRET_KEY=...
# etc.
```

### Step 4: Create Storage Buckets

The migrations create the bucket configurations, but you need to verify/create them in the dashboard:

1. Go to **Storage** in Supabase Dashboard
2. Create these buckets if they don't exist:
   - `avatars` (public)
   - `content_assets` (public)
   - `videos` (public)
   - `post-images` (public)

**Storage Policies**: Already applied via migrations ✅

### Step 5: Generate TypeScript Types

```bash
# Get your project ID from Supabase Dashboard (Settings → General)
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types/database.types.ts
```

This will regenerate types including the `notifications` table!

### Step 6: Verify Build

```bash
npm run build
```

✅ Build should succeed with no TypeScript errors!

### Step 7: Run Seed Data (Optional)

```bash
# Seed sample workouts, recipes, and badges
npm run seed
```

This will:
- Create sample workouts for each tier
- Add sample recipes
- Set up badge definitions
- Create a daily briefing

### Step 8: Test the Application

```bash
npm run dev
```

Visit `http://localhost:3000` and test:
- ✅ Sign up / Login
- ✅ Zero-Day Assessment
- ✅ Formation Feed
- ✅ Challenges
- ✅ Dashboard with mini charts
- ✅ Stripe webhooks (notifications should work!)

---

## What's Included in the Migration

### Core Tables
- ✅ `profiles` - User profiles with tier system
- ✅ `workouts` - Training programs by tier
- ✅ `user_logs` - Workout completion tracking
- ✅ `recipes` - Meal database with macros
- ✅ `meal_plans` - User meal assignments

### Recent Features (All Included!)
- ✅ `zero_day_tests` - Fitness assessment (migration 047)
- ✅ `posts`, `post_likes`, `post_comments` - Formation feed (migrations 052-053)
- ✅ `challenges`, `challenge_participants`, `badge_definitions` - Gamification (migrations 055-057)
- ✅ `daily_macros`, `meal_templates`, `shopping_lists` - Enhanced meal planner (migration 054)
- ✅ `notifications` - In-app notifications (migration 058) **NEW!**

### Additional Features
- ✅ `daily_briefings` - Daily motivational messages
- ✅ `push_subscriptions` - Web push notifications
- ✅ `coach_invites` - Coach invitation system
- ✅ `personal_records` - PR tracking
- ✅ `body_metrics` - Weight tracking
- ✅ All RLS policies, triggers, functions, and indexes

### Migration Tracking
- ✅ `schema_migrations` table automatically populated
- All 34 migrations marked as executed
- Ready for future incremental migrations

---

## Troubleshooting

### Error: "relation already exists"
**Solution**: You're running on a database that already has some tables. Use a fresh database or drop existing tables first.

### Error: "permission denied"
**Solution**: Make sure you're using the SQL Editor in Supabase Dashboard, which runs with admin privileges.

### Build still fails with TypeScript errors
**Solution**:
1. Verify migration completed successfully
2. Re-run type generation:
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types/database.types.ts
   ```
3. Restart your dev server

### Missing storage buckets
**Solution**: Create them manually in Storage section of Supabase Dashboard (see Step 4 above)

---

## Files Reference

- **Consolidated Migration**: `supabase/consolidated_migration.sql` (104KB)
- **Setup Script**: `scripts/setup-new-database.sh`
- **Individual Migrations**: `supabase/migrations/` (for reference)
- **Seed Data**: `supabase/seed.sql` and `scripts/seed-data.js`

---

## Next Steps After Setup

Once your database is set up and build passes:

1. ✅ **Phase 2**: Create automated migration runner (in progress)
2. ✅ **Phase 3**: Build Enhanced Meal Planner UI components
3. ✅ **Phase 4**: Complete PWA configuration
4. ✅ **Phase 5**: Security hardening and sample data

See the full plan at: `.claude/plans/luminous-squishing-quilt.md`

---

## Benefits of This Approach

✅ **Single Transaction**: All-or-nothing execution - if any migration fails, everything rolls back
✅ **Complete Schema**: All 34 migrations in one file
✅ **Notifications Included**: Migration 058 is included - build will pass!
✅ **Migration Tracking**: schema_migrations table auto-populated
✅ **Idempotent**: Uses `IF NOT EXISTS` - safe to re-run on errors
✅ **Fresh Start**: Clean database with all latest features

---

## Quick Commands Reference

```bash
# 1. Generate consolidated migration (already done!)
./scripts/setup-new-database.sh

# 2. After applying to Supabase Dashboard, generate types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types/database.types.ts

# 3. Test build
npm run build

# 4. Seed data (optional)
npm run seed

# 5. Start development
npm run dev
```

---

**Need Help?** Check the troubleshooting section above or refer to:
- `supabase/MIGRATIONS.md` - Detailed migration guide
- `docs/INTEGRATIONS_SETUP.md` - Integration setup
- `IMPLEMENTATION_CHECKLIST.md` - Feature status

---

*Generated: January 13, 2026*
