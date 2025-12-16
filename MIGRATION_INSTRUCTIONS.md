# 🚀 Migration Instructions - Production Ready Updates

This document contains instructions for applying all pending database migrations to make the application production-ready.

## 📋 Overview

We've created 4 new migrations to complete the following features:
1. **Admin briefing management** (fix RLS permissions)
2. **Freemium model for recipes** (add fields and RLS)
3. **Zero Day test history tracking** (new table)
4. **Real-time updates** (already in code, no migration needed)

---

## 🎯 Migrations to Apply

### Migration 043: Allow Admin Briefing Management ✅
**Status:** Already created (Dec 15, 2024)
**Purpose:** Allows admins to create/update/delete briefings (not just coaches)

### Migration 044: Add Recipe Freemium Fields 🆕
**Purpose:** Adds `is_standard_issue` and `min_tier` columns to recipes table

### Migration 045: Fix Recipes RLS Policy 🆕
**Purpose:** Enforces freemium access control at database level

### Migration 046: Seed Standard Issue Recipes 🆕
**Purpose:** Marks 5 basic recipes as available to free tier users

### Migration 047: Create Zero Day Tests Table 🆕
**Purpose:** Creates table to track historical Zero Day re-qualification attempts

---

## 🔧 How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
2. **Navigate to SQL Editor** (left sidebar)
3. **Run each migration in order:**

#### Step 1: Run Migration 043
```sql
-- Copy contents from: supabase/migrations/043_allow_admin_briefings.sql
-- Paste into SQL Editor and click "Run"
```

#### Step 2: Run Migration 044
```sql
-- Copy contents from: supabase/migrations/044_add_recipe_freemium_fields.sql
-- Paste into SQL Editor and click "Run"
```

#### Step 3: Run Migration 045
```sql
-- Copy contents from: supabase/migrations/045_fix_recipes_rls_freemium.sql
-- Paste into SQL Editor and click "Run"
```

#### Step 4: Run Migration 046
```sql
-- Copy contents from: supabase/migrations/046_seed_standard_issue_recipes.sql
-- Paste into SQL Editor and click "Run"
```

#### Step 5: Run Migration 047
```sql
-- Copy contents from: supabase/migrations/047_create_zero_day_tests.sql
-- Paste into SQL Editor and click "Run"
```

---

### Option 2: Supabase CLI (If Linked)

If you have the Supabase CLI installed and your project linked:

```bash
# Apply all pending migrations
npx supabase db push

# Or if you have Supabase CLI globally installed:
supabase db push
```

---

## ✅ Verification Steps

After applying all migrations, verify they worked:

### 1. Check Migration 043 (Admin Briefings)
```sql
SELECT * FROM pg_policies
WHERE tablename = 'daily_briefings';
```
**Expected:** You should see policies like "Coaches and admins can insert/update/delete"

### 2. Check Migration 044 (Recipe Fields)
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'recipes'
AND column_name IN ('is_standard_issue', 'min_tier');
```
**Expected:** Both columns should exist (boolean and text)

### 3. Check Migration 045 (Recipe RLS)
```sql
SELECT policyname FROM pg_policies
WHERE tablename = 'recipes'
AND policyname = 'Users can read available recipes';
```
**Expected:** Should return 1 row

### 4. Check Migration 046 (Standard Recipes)
```sql
SELECT title, is_standard_issue
FROM recipes
WHERE is_standard_issue = true;
```
**Expected:** Should return 5 recipes:
- COMBAT OATS
- INFANTRY EGGS
- TACTICAL PROTEIN BOWL
- RECON RECOVERY SHAKE
- WARRIOR WRAP

### 5. Check Migration 047 (Zero Day Tests Table)
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'zero_day_tests';
```
**Expected:** Should return 1 row

---

## 🧪 Testing After Migration

### Test 1: Admin Briefing Management
1. Log in as admin (rajeshsunny@gmail.com)
2. Navigate to `/command` (should auto-redirect after login)
3. Click "Manage Briefings" button
4. Create a new briefing
5. **Expected:** Briefing saves successfully without errors

### Test 2: Free Tier Recipe Access
1. Create a test user and keep them at `.223` tier (Recruit)
2. Log in as that user
3. Navigate to `/rations`
4. **Expected:** Should see only 5 standard issue recipes

### Test 3: Premium Recipe Access
1. Upgrade a user to Soldier role OR give them `.556` tier via Zero Day
2. Navigate to `/rations`
3. **Expected:** Should see all 8 recipes

### Test 4: Zero Day Data Persistence
1. Navigate to `/zero-day` as a Recruit
2. Complete the fitness test
3. In database, run:
```sql
SELECT * FROM zero_day_tests
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 1;
```
4. **Expected:** Should see your test results (pushups, squats, plank_seconds)

### Test 5: Real-Time Briefing Updates
1. Open dashboard in two browser tabs
2. In one tab, navigate to `/barracks/content/briefing` (as admin/coach)
3. Publish a new briefing
4. **Expected:** The other tab should automatically update without refresh

---

## 🚨 Troubleshooting

### Issue: "Permission denied for table recipes"
**Solution:** Make sure Migration 045 ran successfully. Check RLS policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'recipes';
```

### Issue: "Column is_standard_issue does not exist"
**Solution:** Run Migration 044 again. Verify with:
```sql
\d recipes
```

### Issue: "No standard issue recipes found"
**Solution:** Run Migration 046. Manually update if needed:
```sql
UPDATE recipes SET is_standard_issue = true
WHERE title IN (
  'COMBAT OATS',
  'INFANTRY EGGS',
  'TACTICAL PROTEIN BOWL',
  'RECON RECOVERY SHAKE',
  'WARRIOR WRAP'
);
```

### Issue: "Briefing doesn't update in real-time"
**Solution:** Check browser console for WebSocket errors. Ensure Supabase Realtime is enabled:
1. Go to Supabase Dashboard
2. Database → Replication
3. Enable replication for `daily_briefings` table

---

## 📦 What Was Changed in Code

### Frontend Changes:
1. ✅ [zero-day-client.tsx](app/(dashboard)/zero-day/zero-day-client.tsx) - Now saves test data to `zero_day_tests` table
2. ✅ [rations/page.tsx](app/(dashboard)/rations/page.tsx) - Removed arbitrary `.limit(10)`, now relies on RLS
3. ✅ [motivational-corner.tsx](components/gamification/motivational-corner.tsx) - Added real-time subscriptions
4. ✅ [briefing-manager-client.tsx](app/(dashboard)/barracks/content/briefing/briefing-manager-client.tsx) - Removed `window.location.reload()`
5. ✅ [webhook-handlers.ts](lib/stripe/webhook-handlers.ts) - Added payment failure notifications

### Database Changes:
1. ✅ `recipes` table: Added `is_standard_issue` and `min_tier` columns
2. ✅ `recipes` RLS: Enforces freemium model at database level
3. ✅ `daily_briefings` RLS: Allows admins to manage briefings
4. ✅ `zero_day_tests` table: New table for tracking test history
5. ✅ `notifications` table: Will be used for payment failure alerts (needs migration if doesn't exist)

---

## 🎉 Success Criteria

After applying all migrations and testing, you should have:

- ✅ Admins can publish briefings without errors
- ✅ Free tier users see only 5 standard recipes
- ✅ Premium users see all recipes
- ✅ Zero Day tests are saved to database
- ✅ Briefings update in real-time without page refresh
- ✅ No more `window.location.reload()` disruptions
- ✅ Payment failures create in-app notifications

---

## 📝 Notes

- **Order matters:** Apply migrations in sequence (043 → 044 → 045 → 046 → 047)
- **Backup first:** Consider taking a database snapshot before applying
- **Test thoroughly:** Test each feature after migration in development first
- **RLS is powerful:** The freemium model is now enforced at the database level, not just UI

---

## 🆘 Need Help?

If you encounter issues:
1. Check the browser console (F12) for errors
2. Check Supabase logs (Dashboard → Logs)
3. Verify RLS policies: `SELECT * FROM pg_policies;`
4. Check table structure: `\d table_name`

---

**Ready to deploy! 🚀**
