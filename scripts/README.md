# Seed Data Scripts

This directory contains scripts to seed test data into your Supabase database.

## Quick Start

### Option 1: Node.js Script (Recommended)

```bash
npm run seed
```

**Requirements:**
- Node.js installed
- `.env.local` file with:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Option 2: SQL Script (Direct Database)

```bash
# Using psql
psql -h <your-project>.supabase.co -U postgres -d postgres -f supabase/seed-admin-data.sql

# Or via Supabase Dashboard
# 1. Go to Supabase Dashboard > SQL Editor
# 2. Copy contents of supabase/seed-admin-data.sql
# 3. Run the script
```

### Option 3: Bash Script

```bash
./scripts/seed-data.sh
```

**Requirements:**
- PostgreSQL client (`psql`) installed
- `.env.local` file with:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_DB_PASSWORD`

## What Gets Seeded

1. **Admin User Setup**
   - Sets `rajeshsunny@gmail.com` as admin role
   - Assigns highest tier (.50 Cal)
   - Sets high XP and streak
   - **Note**: Admin users are redirected to `/command` page (not `/dashboard`)

2. **Daily Briefings**
   - Creates 1 active briefing (for Motivational Corner)
   - Creates 2 inactive briefings (for testing)
   - **Visible on**: `/dashboard` (for Recruits/Soldiers) and `/command` (for Admins)

3. **Workouts**
   - Creates workouts for all 4 tiers for today
   - One workout per tier (.223, .556, .762, .50 Cal)

4. **Recipes**
   - Creates 8 tactical meal recipes
   - Includes macros and instructions

## Important Notes

- **User Must Exist First**: The admin user (`rajeshsunny@gmail.com`) must have signed up via the app first. The script will update their profile but won't create the auth user.
- **Idempotent**: Scripts use `ON CONFLICT` clauses, so they're safe to run multiple times.
- **Service Role Key**: The Node.js script requires `SUPABASE_SERVICE_ROLE_KEY` (not the anon key) to access admin functions.

## Troubleshooting

### "User not found"
- Make sure `rajeshsunny@gmail.com` has signed up via the app first
- Check Supabase Auth dashboard to verify user exists

### "Permission denied"
- Ensure you're using the Service Role Key (not anon key)
- Check RLS policies allow the operation

### "Connection refused"
- Verify your Supabase URL is correct
- Check network connectivity
- Ensure database is accessible

