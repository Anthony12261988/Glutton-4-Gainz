# GLUTTON4GAMES – Remediation Task List

Actionable follow-ups based on the PRD vs code review. Priorities: 🔴 critical, 🟠 high, 🟡 medium, 🟢 low.

## Auth & Access Control
- [ ] 🔴 Implement auth context/helpers + `useUser` hook (session, profile fetch/cache) and wire pages that import it.
- [ ] 🔴 Add forgot/reset password pages and flows (`/forgot-password`, `/reset-password`) per PRD.
- [ ] 🔴 Enforce route protection in `proxy.ts` (session checks, redirect unauthenticated; block auth pages when already signed in).
- [ ] 🔴 Guard premium/role routes in server components (pricing redirect for premium features; coach-only guards for Barracks/content pages).
- [ ] 🟠 Refresh client profile/role after Stripe upgrade (listen for webhook result or refetch on success redirect).

## Mission Flow & XP/Streaks
- [ ] 🔴 Replace the demo home with the real daily mission experience (or redirect `/`→`/dashboard`), showing today’s workout by tier with locked state.
- [ ] 🔴 Add “Complete Mission” modal to capture duration/notes; on submit insert `user_logs` only (let DB trigger handle XP/streak/badges), then refresh UI.
- [ ] 🟠 Remove manual XP updates in `app/dashboard/dashboard-client.tsx` to avoid double-counting against trigger `handle_workout_log`.
- [ ] 🟠 Surface streak and XP/rank UI sourced from profile/trigger outputs (no manual math on client).

## Premium Gating & Monetization
- [ ] 🔴 Gate meal planner (rations) and other premium views for recruits: show lock/CTA → `/pricing`.
- [ ] 🔴 Update RLS/policies for `meal_plans` (and any premium tables) to include role/tier checks matching PRD.
- [ ] 🟠 Pricing page: fix load to not crash without `useUser`, handle loading/auth redirects gracefully.
- [ ] 🟢 Add access-denied → pricing flow for advanced charts/content.

## Coach/Admin Features
- [ ] 🔴 Add coach-role guards to Barracks content pages and Briefing/Assets routes (server-side).
- [ ] 🟠 Implement roster/spy mode pages per PRD (read-only profile, logs, charts, badges for a user).
- [ ] 🟠 Messaging polling interval to 30s and unread indicator; ensure RLS-safe queries.
- [ ] 🟠 Add delete confirmation for workouts/recipes if needed; respect RLS.

## Social & Gamification
- [ ] 🟠 Fetch and display user badges on profile (First Blood, Iron Week, Century) from `user_badges`.
- [ ] 🟠 Buddy system: handle incoming/accepted requests, display last_active, and add “Wake Up” nudge (toast/email placeholder).
- [ ] 🟡 Rank badge/XP chart tied to actual data (profile.xp or derived logs), not static samples.

## Analytics & Data Capture
- [ ] 🟠 Add UI to log body metrics (weight) and show weight chart from `body_metrics`.
- [ ] 🟠 Consistency chart: limit to last 4 weeks as in PRD and compute on server.
- [ ] 🟡 Add XP progression chart from real logs/profile XP.

## PWA / UX Polish
- [ ] 🟡 Ensure service worker/offline page registration works in Next app router (verify scope in production).
- [ ] 🟡 Add install prompt dismissal persistence (already partly done) and test across devices.

## Testing & Tooling
- [ ] 🟠 Add minimal tests or scripts for auth/session guard, mission completion flow, and Stripe webhook handler (mocked).
- [ ] 🟡 Recreate missing `scripts/test-db-connection.ts` or equivalent sanity check against Supabase.

