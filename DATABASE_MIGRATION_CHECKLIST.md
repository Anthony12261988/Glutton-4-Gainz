# Database Migration Checklist

Use this checklist when migrating to your new database.

## Pre-Migration

- [ ] Backup current `.env.local` file
  ```bash
  cp .env.local .env.local.backup
  ```

- [ ] Verify consolidated migration exists
  ```bash
  ls -lh supabase/consolidated_migration.sql
  # Should show: 104KB, 2,991 lines
  ```

## Supabase Setup

- [ ] Go to [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] Click "New Project"
- [ ] Fill in project details:
  - [ ] Project name: `glutton4gainz`
  - [ ] Database password: _________________ (save this!)
  - [ ] Region: _________________
- [ ] Wait for project creation (2-3 minutes)

## Apply Migration

- [ ] Open SQL Editor in Supabase Dashboard
- [ ] Open `supabase/consolidated_migration.sql` in your code editor
- [ ] Copy ALL contents (Cmd+A, Cmd+C)
- [ ] Paste into Supabase SQL Editor (Cmd+V)
- [ ] Click "Run" button
- [ ] Wait for completion (10-30 seconds)
- [ ] Verify success message: "Success. No rows returned"

## Update Configuration

- [ ] Go to Supabase: Settings → API
- [ ] Copy new credentials
- [ ] Update `.env.local`:
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=https://__________.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh__________
  SUPABASE_SERVICE_ROLE_KEY=eyJh__________
  ```
- [ ] Keep other variables unchanged (Stripe, Resend, etc.)

## Storage Buckets

- [ ] Go to Supabase: Storage
- [ ] Verify/create buckets:
  - [ ] `avatars` (public)
  - [ ] `content_assets` (public)
  - [ ] `videos` (public)
  - [ ] `post-images` (public)

## Post-Migration Setup

- [ ] Run post-migration script:
  ```bash
  ./scripts/post-migration-setup.sh
  ```

  This will:
  - [ ] Generate TypeScript types
  - [ ] Test production build
  - [ ] Optionally seed sample data

## Verification

- [ ] Check TypeScript types generated:
  ```bash
  ls -lh lib/types/database.types.ts
  # Should be updated with current timestamp
  ```

- [ ] Verify build passes:
  ```bash
  npm run build
  # Should complete with no TypeScript errors
  ```

- [ ] Check for notifications table type:
  ```bash
  grep -A 5 "notifications:" lib/types/database.types.ts
  # Should show notifications table definition
  ```

## Test Application

- [ ] Start development server:
  ```bash
  npm run dev
  ```

- [ ] Test authentication:
  - [ ] Sign up new account
  - [ ] Verify email confirmation (if enabled)
  - [ ] Log in successfully

- [ ] Test key features:
  - [ ] Zero-Day Assessment (complete fitness test)
  - [ ] Dashboard displays correctly
  - [ ] Formation feed (create post, like, comment)
  - [ ] Challenges (view and join a challenge)
  - [ ] Library (view workouts by tier)
  - [ ] Rations (view recipes)

- [ ] Test premium features (if applicable):
  - [ ] Upgrade to premium
  - [ ] Access premium workouts
  - [ ] Verify Stripe webhook works

## Optional: Seed Data

- [ ] Run seed script:
  ```bash
  npm run seed
  ```

- [ ] Verify seeded data:
  - [ ] Check workouts in Library
  - [ ] Check recipes in Rations
  - [ ] Check daily briefing appears
  - [ ] Check badge definitions exist

## Database Verification (via Supabase Dashboard)

- [ ] Go to: Table Editor
- [ ] Verify key tables exist:
  - [ ] `profiles`
  - [ ] `workouts`
  - [ ] `recipes`
  - [ ] `posts` (Formation)
  - [ ] `challenges` (Gamification)
  - [ ] `notifications` ← **Critical for build!**
  - [ ] `schema_migrations` (should have 34 entries)

## Integration Testing

- [ ] Stripe webhook:
  - [ ] Test payment webhook
  - [ ] Verify notification created in database

- [ ] Email integration:
  - [ ] Test welcome email sends
  - [ ] Verify Resend API works

- [ ] Push notifications (if enabled):
  - [ ] Test web push subscription
  - [ ] Verify VAPID keys configured

## Clean Up

- [ ] Remove backup if migration successful:
  ```bash
  # Only after everything works!
  rm .env.local.backup
  ```

- [ ] Document new project details:
  - Project URL: _________________________
  - Project ID: _________________________
  - Created: _________________________

## Troubleshooting

If build fails:

- [ ] Re-run type generation:
  ```bash
  npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types/database.types.ts
  ```

- [ ] Check migration applied completely:
  ```bash
  # In Supabase SQL Editor:
  SELECT * FROM schema_migrations ORDER BY version;
  # Should return 34 rows
  ```

- [ ] Verify notifications table exists:
  ```bash
  # In Supabase SQL Editor:
  SELECT * FROM notifications LIMIT 1;
  # Should work (even if empty)
  ```

If issues persist:
- [ ] Check `NEW_DATABASE_SETUP.md` troubleshooting section
- [ ] Review Supabase logs in Dashboard
- [ ] Verify `.env.local` credentials are correct

## Next Steps

Once migration is complete and verified:

- [ ] Continue to Phase 2: Automated migration runner
- [ ] Continue to Phase 3: Enhanced Meal Planner UI
- [ ] Continue to Phase 4: PWA configuration
- [ ] Continue to Phase 5: Security hardening

See full plan: `.claude/plans/luminous-squishing-quilt.md`

---

## Quick Reference Commands

```bash
# Generate consolidated migration (already done)
./scripts/setup-new-database.sh

# After applying migration to Supabase
./scripts/post-migration-setup.sh

# Manual type generation (if needed)
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types/database.types.ts

# Test build
npm run build

# Seed sample data
npm run seed

# Start development
npm run dev

# Check migration status (if CLI linked)
npx supabase migration list
```

---

**Migration Date**: _______________

**Migrated By**: _______________

**Notes**:
_________________________________________________
_________________________________________________
_________________________________________________
