# Supabase Setup Guide for G4G

This directory contains all SQL migrations and seed data for the Glutton4Gainz database.

## Files Overview

### Migration Files

**For New Databases:**
- **000_initial_schema.sql** - Consolidated initial schema (combines 001-012)
  - Use this for brand new database setups
  - Includes all core tables, functions, triggers, and RLS policies

**Individual Migrations (Reference):**
- **001_create_profiles.sql** through **012_storage_buckets.sql**
  - Keep for reference and historical tracking
  - Use `000_initial_schema.sql` instead for new setups

**Incremental Migrations:**
- **026_create_daily_briefing.sql** through **058_create_notifications.sql**
  - Run these in order after initial schema
  - Each adds new features or modifies existing schema

**Migration Tracking:**
- **schema_migrations.sql** - Table to track executed migrations

### Seed Data
- **seed.sql** - Sample workouts (4 tiers) and recipes (8 meals)

---

## Setup Instructions

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: glutton4gainz (or your choice)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
4. Wait for project to finish provisioning (~2 minutes)

### Step 2: Get Your Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - Keep this secret!

3. Update your local `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### Step 3: Run Migrations

**For detailed migration instructions, see [MIGRATIONS.md](./MIGRATIONS.md)**

You have three options:

#### Option A: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-id
   ```
   (Find project-ref in your project URL: https://[project-ref].supabase.co)

4. Run migrations:
   ```bash
   # Development
   npm run migrate:dev
   
   # Or manually
   supabase db push
   ```

#### Option B: Using Migration Scripts

```bash
# Check migration status
npm run migrate:status

# Run on development
npm run migrate:dev

# Run on staging  
npm run migrate:staging

# Run on production (with safety checks)
npm run migrate:prod
```

#### Option C: Using Supabase Dashboard (Manual)

1. In your Supabase project, go to **SQL Editor**
2. For new databases: Run `000_initial_schema.sql` (consolidated initial schema)
3. Then run migrations 026-058 in order
4. Each migration should be run in a separate query

**Note**: Manual execution doesn't track migration status automatically.

### Step 4: Run Seed Data

1. In Supabase Dashboard → **SQL Editor**
2. Open `seed.sql`
3. Copy and paste entire file
4. Click **"Run"**
5. You should see success message with count of inserted workouts and recipes

### Step 5: Verify Setup

1. Go to **Table Editor** in Supabase Dashboard
2. Verify you see all tables:
   - profiles
   - workouts (should have 4 rows)
   - user_logs
   - user_badges
   - body_metrics
   - recipes (should have 8 rows)
   - meal_plans
   - buddies
   - messages

3. Go to **Storage** → verify buckets exist:
   - avatars
   - content_assets

4. Go to **Database** → **Functions** → verify functions exist:
   - handle_new_user
   - calculate_streak
   - award_first_blood_badge
   - award_iron_week_badge
   - award_century_badge
   - handle_workout_log
   - update_last_active
   - update_updated_at_column

### Step 6: Generate TypeScript Types

1. Install Supabase CLI (if not already):
   ```bash
   npm install -g supabase
   ```

2. Generate types:
   ```bash
   supabase gen types typescript --project-id your-project-ref > lib/types/database.types.ts
   ```

3. Or manually via API:
   - Go to Settings → API → API Docs → TypeScript
   - Copy generated types
   - Replace content of `lib/types/database.types.ts`

---

## Database Schema Overview

### Core Tables

**profiles** - User accounts
- Extends auth.users with fitness data
- Columns: id, email, role (user/coach), tier (.223-.50 Cal), xp, current_streak, coach_id, last_active, avatar_url

**workouts** - Daily missions
- One workout per tier per day
- Columns: id, tier, title, description, video_url, scheduled_date, sets_reps (jsonb)

**user_logs** - Completed workouts
- Tracks duration and notes
- Triggers XP gain and badge checks
- Columns: id, user_id, workout_id, date, duration, notes

**user_badges** - Achievements
- Automatically awarded via database functions
- Columns: id, user_id, badge_name, earned_at

**body_metrics** - Weight tracking
- For analytics charts
- Columns: id, user_id, weight, recorded_at

### Premium Features

**recipes** - Meal database
- Nutritional information
- Columns: id, title, image_url, calories, protein, carbs, fat, instructions

**meal_plans** - User meal assignments
- One meal per day per user
- Columns: id, user_id, recipe_id, assigned_date

### Social Features

**buddies** - Friend system
- Pending/accepted status
- Columns: id, user_id, buddy_id, status

**messages** - Coach communication
- Simple messaging between users and coaches
- Columns: id, sender_id, receiver_id, content, is_read, created_at

---

## Security (RLS)

All tables have Row Level Security (RLS) enabled with policies:

- **Users** can read/write their own data
- **Coaches** can read data of assigned users
- **Badges** are only writable by database functions (security definer)
- **Storage** - Users can upload to their own avatar folder, coaches can upload content

---

## Automated Functions

### On User Signup
- `handle_new_user()` - Automatically creates profile row

### On Workout Log
- `handle_workout_log()` - Awards 100 XP
- Calculates and updates streak
- Checks and awards badges:
  - **First Blood** - 1st workout
  - **Iron Week** - 7-day streak
  - **Century** - 100 workouts

### On Any User Action
- `update_last_active()` - Updates last_active timestamp

---

## Testing the Setup

### Test 1: Create a User
1. In Next.js app, sign up with email/password
2. Check Supabase → Table Editor → profiles
3. Verify profile row was auto-created with default values

### Test 2: Complete a Workout
1. Log a workout in the app
2. Check user_logs → verify new row
3. Check profiles → verify xp increased by 100
4. Check user_badges → verify "First Blood" badge awarded

### Test 3: Storage Upload
1. Upload an avatar in the app
2. Check Supabase → Storage → avatars
3. Verify file exists in your user folder

---

## Troubleshooting

### Migration Errors

**Error: "relation already exists"**
- This means you've already run the migration
- It's safe to ignore or skip

**Error: "function does not exist"**
- Make sure you ran migrations in order
- The `update_updated_at_column()` function is created in migration 001

**Error: RLS policy already exists**
- You may have run migration 010 twice
- Safe to ignore

### Connection Issues

**Error: "Invalid API key"**
- Double-check your SUPABASE_ANON_KEY in .env.local
- Make sure there are no extra spaces
- Restart your Next.js dev server

**Error: "Failed to fetch"**
- Check your SUPABASE_URL is correct
- Verify your project is active in Supabase dashboard

### Badge Not Awarded

- Check Database → Functions → Make sure `handle_workout_log()` exists
- Check Database → Triggers → Verify `on_workout_log_created` exists
- Try manually running: `SELECT handle_workout_log();` in SQL Editor

---

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- Check your migration SQL files for comments and documentation

---

## Next Steps After Setup

1. ✅ Verify all migrations ran successfully
2. ✅ Seed data loaded (4 workouts, 8 recipes)
3. ✅ Generate TypeScript types
4. ✅ Update .env.local with credentials
5. ✅ Test auth signup (creates profile automatically)
6. 🚀 Start building Phase 3: Authentication UI!
