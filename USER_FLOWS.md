# Glutton4Games – User Scenarios & Access Map

This document describes what each user type should see, how they authenticate, and the core flows they can perform in the app.

## User Types & Access

- **Guest (not signed in)**  
  - Can: View landing page (`/`), marketing content, pricing.  
  - Cannot: Access protected routes (`/dashboard`, `/rations`, `/profile`, `/stats`, `/barracks`). Middleware redirects to `/login`.

- **Recruit (free)** — `profiles.role = 'user'`  
  - Can: Access tier `.223` missions, basic stats, daily rations view, onboarding, enable push notifications.  
  - Cannot: Higher tiers, advanced analytics, meal planner, leaderboards.

- **Soldier (premium)** — `profiles.role = 'soldier'` (set via Stripe webhook)  
  - Can: All Recruit access **plus** unlock all tiers (.223 → .50 Cal), advanced analytics, 7-day meal planner, squad leaderboards.  
  - Billing handled via Stripe; webhook updates role on subscription status changes.

- **Coach** — `profiles.role = 'coach'`  
  - Can: All Soldier access **plus** `/barracks` (roster/spy mode/coaching tools).  
  - Middleware checks role and redirects non-coaches away from `/barracks`.

## Authentication Flows

- **Sign Up** (`/signup`)  
  - Inputs: Email, password (min 8 chars, upper/lower/number enforced), confirm password.  
  - On success: Redirect to `/onboarding` (Day Zero test) then to `/dashboard`.

- **Login** (`/login`)  
  - Inputs: Email, password.  
  - On success: Redirect to `/dashboard`.  
  - If already authenticated, middleware redirects to `/dashboard`.

- **Forgot Password** (`/forgot-password`)  
  - Input: Email. Sends reset link via Supabase. Redirect target: `/reset-password`.

- **Reset Password** (`/reset-password`)  
  - Inputs: New password + confirm. Validates same strength rules. On success, user can log back in.

- **Session Guarding (middleware)**  
  - Protected routes require session; unauthenticated users are redirected to `/login`.  
  - Auth routes (`/login`, `/signup`, `/forgot-password`, `/reset-password`, `/onboarding`) redirect to `/dashboard` if already signed in.

## Onboarding (Day Zero)

- Route: `/onboarding` (after signup).  
- Flow: User completes Day Zero pushup test → tier assigned (`assignTier`) → redirected to `/dashboard`.  
- Gatekeeping: Requires authenticated session (middleware).

## Core Feature Flows (by route)

- **Dashboard (`/dashboard`)**  
  - Shows daily mission (workout), badge prompts, wake-up/squad items, and general mission status.  
  - CTA examples: Complete mission, view badges, nudge buddies (if enabled).  
  - Available to all signed-in users; content scoped by tier/role (premium unlocks higher-tier missions).

- **Rations (`/rations`)**  
  - Recruit: Standard daily meal view.  
  - Soldier/Coach: Meal planner for 7-day calendar (if implemented), higher-protein directives.  
  - Access: Authenticated only.

- **Stats (`/stats`)**  
  - Recruit: Basic service record (weight, streaks, consistency).  
  - Soldier/Coach: Advanced analytics (charts for weight, consistency).  
  - Access: Authenticated only.

- **Profile (`/profile`)**  
  - Manage avatar, email display, potentially push notification toggle (if surfaced).  
  - Access: Authenticated only.

- **Barracks (`/barracks`)**  
  - Coach-only roster, spy mode profiles, messaging.  
  - Middleware fetches profile role; non-coaches are redirected to `/dashboard`.

## Push Notifications (opt-in)

- **Client opt-in**: Prompt/toggle uses `usePushNotifications` to subscribe; requires `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.  
- **Server send**: `/api/push/send` sends to the signed-in user only (RLS + session); subscription is stored in `push_subscriptions`.  
- **Subscription refresh**: Service worker posts to `/api/push/update-subscription` on `pushsubscriptionchange`.  
- **What users see**: Permission prompt → success toast; notifications include title/body/icon and open the app on click.

## Billing & Upgrades

- **Upgrade to Soldier**: Pricing CTA (landing or in-app) → Stripe Checkout → webhook sets `profiles.role = 'soldier'` and stores `stripe_customer_id`.  
- **Downgrade/Cancellation**: Stripe webhook reverts role to `user` when subscription status requires it.

## Error Handling Expectations

- Auth pages should show validation errors inline (password strength, mismatches).  
- Protected-route access without session redirects to `/login`.  
- `/barracks` access without coach role redirects to `/dashboard`.  
.- Push send without subscription returns 404/410; expired subs are cleaned up on send.

## Quick “Can I do X?” Matrix

| Capability                         | Guest | Recruit (user) | Soldier (premium) | Coach |
|------------------------------------|:-----:|:--------------:|:-----------------:|:-----:|
| View landing/pricing               |   ✅   |       ✅        |         ✅         |  ✅   |
| Sign up / log in                   |   ✅   |       ✅        |         ✅         |  ✅   |
| Access dashboard/rations/stats     |   ❌   |       ✅        |         ✅         |  ✅   |
| Day Zero onboarding                |   ❌   |       ✅        |         ✅         |  ✅   |
| Higher-tier missions (.556+/.50)   |   ❌   |       ❌        |         ✅         |  ✅   |
| Advanced analytics/meal planner    |   ❌   |       ❌        |         ✅         |  ✅   |
| Squad leaderboards                 |   ❌   |       ❌        |         ✅         |  ✅   |
| Coach tools (`/barracks`)          |   ❌   |       ❌        |         ❌         |  ✅   |
| Push notifications (self)          |   ❌   |       ✅        |         ✅         |  ✅   |
| Upgrade via Stripe                 |   ❌   |       ✅        |         ✅         |  ✅   |
