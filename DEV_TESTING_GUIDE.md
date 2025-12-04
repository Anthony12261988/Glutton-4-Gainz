# Glutton4Games Development & Testing Playbook

Single source for local setup, database expectations, and validation of critical user journeys (including Command Center and coach invites).

## Setup & Environment
- Prereqs: Node 18+, npm, Supabase project, Stripe (if payments), Resend (coach invites), VAPID keys (push).
- Env (`.env.local`):
  - Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - App: `NEXT_PUBLIC_APP_URL`
  - Email: `RESEND_API_KEY`
  - Payments (opt): `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
  - Push (opt): `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`
- Install deps: `npm install`
- Run dev server: `npm run dev`
- Lint: `npm run lint`

## Database: Migrations, Seed, Types
- Run migrations in order (latest first for new features):
  1) `001_create_profiles.sql`
  2) `002_create_workouts.sql`
  3) `003_create_user_logs.sql`
  4) `004_create_user_badges.sql`
  5) `005_create_body_metrics.sql`
  6) `006_create_recipes.sql`
  7) `007_create_meal_plans.sql`
  8) `008_create_buddies.sql`
  9) `009_create_messages.sql`
  10) `010_rls_policies.sql`
  11) `011_functions_and_triggers.sql`
  12) `012_storage_buckets.sql`
  13) `026_create_daily_briefing.sql`
  14) `027_update_meal_plan_rls.sql`
  15) `028_add_stripe_customer_id.sql`
  16) `029_add_performance_indexes.sql`
  17) `030_add_push_subscriptions.sql`
  18) `031_add_coach_invites_and_admin_controls.sql`
- Seeds: run `supabase/seed.sql` (or insert workouts/recipes manually).
- Types: `npx supabase gen types typescript --project-id <PROJECT_ID> > lib/types/database.types.ts`
- 031 adds: `coach_invites` table + policies, `banned` boolean on profiles, expanded role enum (user/soldier/coach/admin), admin read/write policies on profiles.

## Roles & Access for Testing
- Admin: set `profiles.role = 'admin'` manually for at least one user to access `/command`.
- Coach: create via invite flow (preferred) or set `profiles.role = 'coach'`.
- Soldier: set by Stripe webhooks (role `soldier`) when subscription active.
- Banned: toggled in Command Center Troops tab; currently enforced via UI (add RLS if you need hard blocks).

## Critical Flows to Validate
Run these after changes to auth, onboarding, email, or admin UI. Use test emails you own.

1) **Recruit onboarding (Day Zero)**
   - Sign up → `/onboarding`
   - Complete pushups/squats/plank
   - Expect `profiles.tier` updated, toast, redirect `/dashboard`

2) **Coach invite interception**
   - Create invite (Command Center → Officers → Commission Officer) or insert `coach_invites` with `status=pending`
   - Log in as invite email, hit `/onboarding`
   - Expect “Checking Orders” loader → invite `status` becomes `accepted`, `profiles.role='coach'`, toast “Commission Accepted…”, redirect `/barracks` (skips tests)

3) **Command Center gate**
   - Admin user → `/command` loads
   - Non-admin → redirected to `/dashboard`

4) **Troops tab (admin)**
   - See email/tier/role/last active/status
   - Filter works
   - “Dishonorable Discharge” sets `banned=true`; “Reinstate” clears; cannot ban yourself or admins

5) **Officers tab (admin)**
   - Coaches table shows active coaches
   - Pending commissions list shows pending invites
   - Invite flow outcomes:
     - New email (not in profiles): invite created `pending`, Resend called, toast “Draft Notice Sent”
     - Email already in profiles: destructive toast “ALREADY ENLISTED”
     - Accepted invite re-submission: informational toast about already accepted

6) **/api/invite-coach**
   - With `RESEND_API_KEY`: POST `{ email, invite_token }` → 200, email sent
   - Missing key → 500
   - Missing params → 400

7) **Barracks access**
   - Coach → `/barracks` loads dashboard
   - Non-coach → restricted/redirect

8) **Payments (optional)**
   - `/pricing` upgrade triggers `/api/create-checkout-session`
   - Webhooks update `profiles.role` to `soldier` on active/trialing, downgrade on canceled/unpaid

9) **Push notifications (optional)**
   - VAPID keys present
   - Subscription and send routes (`/api/push/update-subscription`, `/api/push/send`) succeed with correct RLS/service role

## Regression Quick List
- `npm run lint`
- Smoke auth: login/signup/logout
- Onboarding: Day Zero path + invite bypass path
- Command Center: load, ban/unban, invite
- Barracks: coach-only access
- Payments (if enabled): checkout session creation succeeds

## Notes & Gotchas
- Resend: verify sender domain + `RESEND_API_KEY` or email sends will fail.
- Keep `NEXT_PUBLIC_APP_URL` accurate; invite links use it.
- If banning needs enforcement, add RLS/policy checks referencing `profiles.banned`.
