GLUTTON4GAMES (G4G) – MVP Product Requirements Document

1. Project Overview

Product Name: Glutton4Games (G4G)
Platform: Progressive Web App (PWA)
Core Concept: A military-themed fitness application focusing on discipline, tier-based progression, and coach accountability.
Target Audience: Individuals seeking rigorous structure, not just a generic workout app.

2. Technical Stack (Non-Negotiable)

Framework: Next.js 14+ (App Router)

Language: TypeScript

Styling: Tailwind CSS + Shadcn/UI (Customized for Military Theme)

Backend/Auth: Supabase (PostgreSQL, Auth, Storage)

Charts: Recharts

Icons: Lucide React

3. User Roles

Recruit (Free User): Access to Tier 1 workouts, basic stats.

Soldier (Paid User): Access to All Tiers, Meal Planner, Advanced Charts.

Coach (Admin/Trainer): Access to Coach Dashboard, User Spy Mode, Messaging, Content Management.

4. Functional Requirements

4.1. Authentication & Onboarding

Auth Methods: Google OAuth & Email/Password (via Supabase).

Day Zero Test (Logic):

User inputs max reps for: Pushups, Squats, Core.

Logic:

If Pushups < 10: Assign Tier .223 (Novice)

If Pushups 10-25: Assign Tier .556 (Intermediate)

If Pushups 25-50: Assign Tier .762 (Advanced)

If Pushups > 50: Assign Tier .50 Cal (Elite)

Output: User profile table is updated with tier.

4.2. The Workout Engine (Daily Mission)

Display: Home screen shows ONE workout card for the current date matching the user's tier.

Content: Title, Description, YouTube Embed ID, Sets/Reps list.

Action: "Complete Mission" button.

Log: Opens a modal to input "Duration (mins)" and "Notes". Saves to user_logs table.

Logic: If user_tier is lower than workout tier, show "Classified / Locked".

4.3. Nutrition & Meal Planner (Premium)

Recipe Bank: A list of recipes (Title, Image, Macros, Instructions).

Weekly View: A 7-day horizontal calendar (Mon-Sun).

Action: User clicks a day -> Selects a Meal from Bank -> Adds to meal_plans table.

Display: "Today's Ration" shows the meal assigned to the current day.

4.4. Analytics (Interactive Charts)

Library: Recharts.

Chart 1 (Consistency): Bar Chart. X-Axis = Last 4 Weeks. Y-Axis = Count of user_logs.

Chart 2 (Weight): Line Chart. X-Axis = Date. Y-Axis = Weight (fetched from body_metrics table).

4.5. Gamification & Social (Lite)

XP Logic: 1 Workout Log = 100 XP.

Rank System:

0-1000 XP: Recruit

1000-5000 XP: Soldier

5000+ XP: Commander

Badges:

"First Blood": Awarded on 1st log.

"Iron Week": Awarded on 7-day streak.

UI: Badges displayed in a grid.

Buddy System (Nudges):

User can add a buddy via email.

User can see buddy's "Last Active" timestamp.

Action: "Wake Up" button (sends a toast/notification/email to the buddy if inactive > 24h).

4.6. Coach Tier (The Dashboard)

Access: Only users with role = 'coach'.

Roster View: List of all users assigned to this coach.

Spy Mode: Clicking a user opens their profile read-only view (Workouts, Charts, Logs).

Messaging:

Simple inbox UI.

Internal DB table messages (sender_id, receiver_id, content, created_at).

NOT real-time sockets. Use polling (SWR/Tanstack Query) to fetch new messages every 30s.

4.7. Content Management (Admin Features)

Access: role = 'coach' implies Admin privileges for MVP.

Workout Manager: Form to Create/Edit workouts (Title, Tier, Video URL, Date).

Recipe Manager: Form to Upload Recipes (Image, Macros, Instructions).

Motivation: Form to set the "Daily Briefing" text.

4.8. Monetization (Stripe)

Provider: Stripe Checkout.

Logic:

Free User attempts to access "Meal Planner" or "Advanced Tier" -> Redirect to Pricing Page.

Payment Success -> Webhook updates user role from 'recruit' to 'soldier'.

5. Database Schema (Supabase)

profiles: id (uuid), email, role (text), tier (text), xp (int), current_streak (int), coach_id (uuid), last_active (timestamp), avatar_url (text).

body_metrics: id, user_id (FK), weight (float), recorded_at (date) -- Required for Chart 2.

workouts: id, tier (text), title, description, video_url, scheduled_date (date), sets_reps (jsonb) -- JSON allows structured lists like

$${"exercise": "Burpees", "reps": "20"}$$

.

user_logs: id, user_id, workout_id, date, duration, notes.

user_badges: id, user_id (FK), badge_name (text), earned_at (timestamp) -- Required to persist badges.

recipes: id, title, image_url (text), calories, protein, carbs, fat, instructions.

meal_plans: id, user_id, recipe_id, assigned_date (date).

buddies: id, user_id (FK), buddy_id (FK), status (text: 'pending'|'accepted') -- Required for Social Nudges.

messages: id, sender_id, receiver_id, content, is_read, created_at.

6. Storage (Supabase Buckets)

6.1. Bucket: avatars

Purpose: Stores user profile pictures.

Access Policy:

Select (Read): Public.

Insert/Update: Authenticated users (can only upload to their own folder uid/\*).

6.2. Bucket: content_assets

Purpose: Stores recipe images and generic app assets (badges, thumbnails).

Access Policy:

Select (Read): Public.

Insert/Update: Restricted to users with role = 'coach'.
