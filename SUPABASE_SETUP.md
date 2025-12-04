# Supabase Setup Guide for Glutton4Games

This guide will walk you through setting up Supabase for the Glutton4Games PWA. Follow these steps carefully to configure your database, authentication, and storage.

---

## 📋 Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Supabase CLI installed (optional but recommended)
- Node.js and npm already installed

---

## 🚀 Step 1: Create a New Supabase Project

1. Go to https://app.supabase.com
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: `glutton4games` (or your preferred name)
   - **Database Password**: Create a strong password and **save it securely**
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Free tier is fine for development
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to initialize

---

## 🔑 Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll need these values:
   - **Project URL** (looks like `https://xxxxxxxxxxxxx.supabase.co`)
   - **`anon` `public`** key (safe to use in client-side code)
   - **`service_role` `secret`** key (NEVER expose publicly, server-side only)

3. Create a `.env.local` file in your project root:

```bash
# Copy .env.local.example to .env.local
cp .env.local.example .env.local
```

4. Add your credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

⚠️ **Security Note**: Never commit `.env.local` to version control. It's already in `.gitignore`.

---

## 🗄️ Step 3: Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended for Beginners)

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Run the migrations in order (copy/paste each file's contents):

   **Order matters! Run these sequentially:**

   1. `supabase/migrations/001_create_profiles.sql`
   2. `supabase/migrations/002_create_workouts.sql`
   3. `supabase/migrations/003_create_user_logs.sql`
   4. `supabase/migrations/004_create_user_badges.sql`
   5. `supabase/migrations/005_create_body_metrics.sql`
   6. `supabase/migrations/006_create_recipes.sql`
   7. `supabase/migrations/007_create_meal_plans.sql`
   8. `supabase/migrations/008_create_buddies.sql`
   9. `supabase/migrations/009_create_messages.sql`
   10. `supabase/migrations/010_rls_policies.sql`
   11. `supabase/migrations/011_functions_and_triggers.sql`
   12. `supabase/migrations/012_storage_buckets.sql`

4. After each migration, click **"Run"** and verify no errors appear
5. Check the **"Results"** panel for success messages

### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push
```

---

## 🌱 Step 4: Seed Sample Data

1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy the contents of `supabase/seed.sql`
4. Click **"Run"**

This will populate:
- 4 sample workouts (one for each tier, scheduled for today)
- 8 sample recipes with macros

---

## 🔐 Step 5: Configure Authentication

### Enable Email/Password Authentication

1. Go to **Authentication** → **Providers**
2. **Email** should already be enabled by default
3. Verify these settings:
   - ✅ Enable Email provider
   - ✅ Confirm email (recommended)
   - ✅ Secure email change (recommended)

### Enable Google OAuth (Optional but Recommended)

1. Go to **Authentication** → **Providers**
2. Find **Google** and click **Enable**
3. You'll need to create a Google OAuth app:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one
   - Enable **Google+ API**
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - **Application type**: Web application
   - **Authorized redirect URIs**: Add `https://your-project.supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret**
4. Back in Supabase, paste the Client ID and Client Secret
5. Click **Save**

### Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation and reset password emails with military-themed copy if desired

---

## 📦 Step 6: Configure Storage Buckets

Storage buckets are created via the migration in Step 3, but you can verify:

1. Go to **Storage** in your Supabase dashboard
2. You should see two buckets:
   - **avatars** (public, 5MB limit, images only)
   - **content_assets** (public, 10MB limit, coaches only)

3. Verify bucket policies:
   - Click on each bucket → **Policies**
   - Ensure policies match the migration file

---

## 🔧 Step 7: Generate TypeScript Types

Generate TypeScript types from your Supabase schema for type-safe queries:

### Option A: Using Supabase CLI

```bash
# Make sure you're logged in and linked
supabase gen types typescript --project-id your-project-id > lib/types/database.types.ts
```

### Option B: Using npx (no global install needed)

```bash
npx supabase gen types typescript --project-id your-project-id > lib/types/database.types.ts
```

**Find your project ID**: In Supabase dashboard → Settings → General → Reference ID

---

## ✅ Step 8: Verify Setup

### Test Database Connection

Create a test file to verify your setup:

```typescript
// test-db.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  const { data, error } = await supabase.from('workouts').select('*').limit(1)

  if (error) {
    console.error('❌ Database connection failed:', error)
  } else {
    console.log('✅ Database connection successful!')
    console.log('Sample workout:', data)
  }
}

testConnection()
```

Run it:
```bash
npx tsx test-db.ts
```

### Verify in Supabase Dashboard

1. Go to **Table Editor**
2. You should see all 9 tables:
   - profiles
   - workouts
   - user_logs
   - user_badges
   - body_metrics
   - recipes
   - meal_plans
   - buddies
   - messages

3. Click on **workouts** table
4. You should see 4 sample workouts from the seed data

---

## 🎨 Step 9: Update Environment Variables

Make sure your `.env.local` file has all required variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (for Phase 8 - Monetization)
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🐛 Troubleshooting

### Migration Errors

**Error: "relation already exists"**
- Solution: You've already run this migration. Skip it or drop the table first.

**Error: "permission denied"**
- Solution: Make sure you're running migrations as the Postgres user. Use the SQL Editor in Supabase dashboard.

**Error: "function already exists"**
- Solution: Use `CREATE OR REPLACE FUNCTION` (already in our migrations)

### RLS Policy Errors

**Error: "new row violates row-level security policy"**
- Solution:
  1. Check if RLS is enabled on the table
  2. Verify the policy matches your auth.uid()
  3. For testing, temporarily disable RLS (NOT for production):
     ```sql
     ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
     ```

### Authentication Errors

**Error: "Invalid API key"**
- Solution: Double-check your `.env.local` file has the correct `anon` key

**Error: "Email not confirmed"**
- Solution:
  1. Go to Authentication → Users
  2. Find the user and click the menu → "Confirm email"
  3. Or disable email confirmation in Auth settings (dev only)

### Storage Errors

**Error: "must be owner of relation objects"** (Migration 012)
- **This is a known issue** with storage policy creation via SQL
- **Solution 1** (Recommended): Use the fixed migration file with `IF NOT EXISTS` clauses
- **Solution 2**: Create buckets only via SQL, then add policies through Supabase Dashboard UI:
  1. Run `012_storage_buckets_ALTERNATIVE.sql` instead (only creates buckets)
  2. Go to **Storage** → Select bucket → **Policies** tab
  3. Click **"New Policy"** and add each policy manually using the templates in the ALTERNATIVE file
- **Solution 3**: Skip migration 012 entirely and set up storage through the Supabase Dashboard:
  1. Go to **Storage** → **New bucket**
  2. Create "avatars" and "content_assets" buckets manually
  3. Configure policies through the UI

**Error: "The resource already exists"**
- Solution: Buckets already created. Verify in Storage dashboard.

**Error: "Bucket not found"**
- Solution: Run migration `012_storage_buckets.sql` again

---

## 📚 Next Steps

Once Supabase is set up:

1. ✅ **Test the app**: Run `npm run dev` and test auth pages
2. ✅ **Implement Phase 3**: Auth helpers and hooks
3. ✅ **Implement Phase 4**: Workout engine with XP system
4. ✅ **Implement Phase 5**: Analytics and charts

---

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [CLI Reference](https://supabase.com/docs/reference/cli)

---

## 🆘 Getting Help

If you run into issues:

1. Check the Supabase Dashboard **Logs** (Database → Logs)
2. Review the **API Logs** (Settings → API → Logs)
3. Join the [Supabase Discord](https://discord.supabase.com)
4. Check the [Supabase GitHub Discussions](https://github.com/supabase/supabase/discussions)

---

**IMPORTANT SECURITY REMINDERS**:

- ❌ **NEVER** commit `.env.local` to Git
- ❌ **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- ✅ **ALWAYS** use Row Level Security (RLS) policies
- ✅ **ALWAYS** validate user input before database operations
- ✅ **ALWAYS** test auth flows in incognito mode

---

Happy building! 🎖️💪
