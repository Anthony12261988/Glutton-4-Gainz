-- Seed Script for Admin User and Test Data
-- Run this script to seed data for testing, especially for admin user: rajeshsunny@gmail.com
--
-- Usage:
--   1. Connect to your Supabase database
--   2. Run: psql -h <host> -U postgres -d postgres -f seed-admin-data.sql
--   3. Or run via Supabase Dashboard SQL Editor

-- ============================================================================
-- STEP 1: Ensure Admin User Exists and Has Admin Role
-- ============================================================================

-- First, we need to get the user ID from auth.users
-- Note: This assumes the user already exists in auth.users (created via signup/login)
-- If the user doesn't exist, they need to sign up first

DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Find the admin user by email
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'rajeshsunny@gmail.com';

  IF admin_user_id IS NULL THEN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'WARNING: User rajeshsunny@gmail.com not found in auth.users';
    RAISE NOTICE 'Please ensure the user has signed up first';
    RAISE NOTICE '========================================';
  ELSE
    -- Update or insert profile with admin role
    INSERT INTO profiles (id, email, role, tier, xp, current_streak, onboarding_completed)
    VALUES (
      admin_user_id,
      'rajeshsunny@gmail.com',
      'admin',
      '.50 Cal', -- Admin gets highest tier
      10000, -- High XP for admin
      100, -- Long streak
      true -- Onboarding completed
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      role = 'admin',
      tier = '.50 Cal',
      onboarding_completed = true,
      updated_at = NOW();

    RAISE NOTICE '========================================';
    RAISE NOTICE 'Admin user configured: rajeshsunny@gmail.com';
    RAISE NOTICE 'User ID: %', admin_user_id;
    RAISE NOTICE 'Role: admin';
    RAISE NOTICE '========================================';
  END IF;
END $$;

-- ============================================================================
-- STEP 2: Create Daily Briefings (for Motivational Corner)
-- ============================================================================

-- Deactivate all existing briefings first
UPDATE daily_briefings SET active = false WHERE active = true;

-- Create a new active briefing
INSERT INTO daily_briefings (content, active, created_by)
SELECT 
  'Soldiers, today is your day to dominate. Every rep counts, every set matters. Push beyond your limits and prove to yourself what you''re truly capable of. The mission starts now. Lock and load!',
  true,
  id
FROM auth.users
WHERE email = 'rajeshsunny@gmail.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- If admin user doesn't exist, create briefing without created_by
INSERT INTO daily_briefings (content, active)
SELECT 
  'Soldiers, today is your day to dominate. Every rep counts, every set matters. Push beyond your limits and prove to yourself what you''re truly capable of. The mission starts now. Lock and load!',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM daily_briefings WHERE active = true
);

-- Create a few more sample briefings (inactive, for testing)
INSERT INTO daily_briefings (content, active, created_by)
SELECT 
  'Discipline is choosing between what you want now and what you want most. Stay focused, stay strong.',
  false,
  id
FROM auth.users
WHERE email = 'rajeshsunny@gmail.com'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO daily_briefings (content, active, created_by)
SELECT 
  'Victory belongs to those who are willing to pay the price. Today, pay that price.',
  false,
  id
FROM auth.users
WHERE email = 'rajeshsunny@gmail.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 3: Ensure Workouts Exist for Today (if not already seeded)
-- ============================================================================

-- Workout for Tier .223 (Novice)
INSERT INTO workouts (tier, title, description, video_url, scheduled_date, sets_reps)
VALUES (
  '.223',
  'BASIC RECON',
  'Foundation workout focusing on bodyweight basics. Perfect for building base strength and form.',
  'dQw4w9WgXcQ',
  CURRENT_DATE,
  '[
    {"exercise": "Pushups", "reps": "3 sets x 8-10 reps"},
    {"exercise": "Bodyweight Squats", "reps": "3 sets x 15 reps"},
    {"exercise": "Plank Hold", "reps": "3 sets x 30 seconds"},
    {"exercise": "Jumping Jacks", "reps": "2 sets x 20 reps"}
  ]'::jsonb
)
ON CONFLICT (tier, scheduled_date) DO NOTHING;

-- Workout for Tier .556 (Intermediate)
INSERT INTO workouts (tier, title, description, video_url, scheduled_date, sets_reps)
VALUES (
  '.556',
  'STANDARD PATROL',
  'Intermediate intensity circuit. Focus on controlled movement and breathing.',
  'dQw4w9WgXcQ',
  CURRENT_DATE,
  '[
    {"exercise": "Pushups", "reps": "4 sets x 15-20 reps"},
    {"exercise": "Jump Squats", "reps": "4 sets x 12 reps"},
    {"exercise": "Mountain Climbers", "reps": "4 sets x 20 reps"},
    {"exercise": "Plank Hold", "reps": "3 sets x 45 seconds"},
    {"exercise": "Burpees", "reps": "3 sets x 10 reps"}
  ]'::jsonb
)
ON CONFLICT (tier, scheduled_date) DO NOTHING;

-- Workout for Tier .762 (Advanced)
INSERT INTO workouts (tier, title, description, video_url, scheduled_date, sets_reps)
VALUES (
  '.762',
  'ASSAULT PROTOCOL',
  'High-intensity advanced workout. Push beyond your limits with explosive movements.',
  'dQw4w9WgXcQ',
  CURRENT_DATE,
  '[
    {"exercise": "Explosive Pushups", "reps": "5 sets x 15 reps"},
    {"exercise": "Pistol Squats (each leg)", "reps": "4 sets x 8 reps"},
    {"exercise": "Burpee Box Jumps", "reps": "4 sets x 12 reps"},
    {"exercise": "Plank to Pike", "reps": "4 sets x 15 reps"},
    {"exercise": "Mountain Climbers", "reps": "4 sets x 30 reps"},
    {"exercise": "Diamond Pushups", "reps": "3 sets x 12 reps"}
  ]'::jsonb
)
ON CONFLICT (tier, scheduled_date) DO NOTHING;

-- Workout for Tier .50 Cal (Elite)
INSERT INTO workouts (tier, title, description, video_url, scheduled_date, sets_reps)
VALUES (
  '.50 Cal',
  'SPECIAL OPS MISSION',
  'Elite-level workout. Maximum intensity, precision execution. This is where warriors are forged.',
  'dQw4w9WgXcQ',
  CURRENT_DATE,
  '[
    {"exercise": "One-Arm Pushups (each arm)", "reps": "5 sets x 10 reps"},
    {"exercise": "Pistol Squats (each leg)", "reps": "5 sets x 12 reps"},
    {"exercise": "Burpee Muscle-Ups", "reps": "5 sets x 8 reps"},
    {"exercise": "L-Sit Hold", "reps": "4 sets x 30 seconds"},
    {"exercise": "Planche Pushups", "reps": "4 sets x 8 reps"},
    {"exercise": "Sprint Intervals", "reps": "10 rounds x 30 seconds sprint, 30 seconds rest"}
  ]'::jsonb
)
ON CONFLICT (tier, scheduled_date) DO NOTHING;

-- ============================================================================
-- STEP 4: Ensure Recipes Exist (if not already seeded)
-- ============================================================================

-- Recipe 1: Tactical Protein Bowl
INSERT INTO recipes (title, image_url, calories, protein, carbs, fat, instructions)
VALUES (
  'TACTICAL PROTEIN BOWL',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
  520,
  45,
  55,
  12,
  '1. Grill 6oz chicken breast with military precision
2. Cook 1 cup brown rice
3. Steam broccoli and carrots
4. Assemble: rice base, chicken on top, vegetables on the flank
5. Drizzle with low-sodium soy sauce
6. Deploy hot sauce for tactical advantage (optional)

MACROS PER SERVING:
Calories: 520 | Protein: 45g | Carbs: 55g | Fat: 12g'
)
ON CONFLICT DO NOTHING;

-- Recipe 2: Combat Oats
INSERT INTO recipes (title, image_url, calories, protein, carbs, fat, instructions)
VALUES (
  'COMBAT OATS',
  'https://images.unsplash.com/photo-1517673400267-0251440f9a88',
  380,
  18,
  62,
  8,
  '1. Mix 1 cup oats with 1.5 cups water or almond milk
2. Microwave 2-3 minutes or cook on stove
3. Stir in 1 scoop protein powder (vanilla recommended)
4. Top with 1 banana (sliced), berries, and 1 tbsp almond butter
5. Optional: cinnamon, honey

MACROS PER SERVING:
Calories: 380 | Protein: 18g | Carbs: 62g | Fat: 8g'
)
ON CONFLICT DO NOTHING;

-- Recipe 3: Ranger Beef Stir-Fry
INSERT INTO recipes (title, image_url, calories, protein, carbs, fat, instructions)
VALUES (
  'RANGER BEEF STIR-FRY',
  'https://images.unsplash.com/photo-1603133872878-684f208fb84b',
  445,
  38,
  42,
  15,
  '1. Slice 6oz lean beef into strips
2. Heat wok with 1 tbsp olive oil
3. Stir-fry beef on high heat (2-3 minutes)
4. Add bell peppers, snap peas, onions
5. Season with ginger, garlic, low-sodium soy sauce
6. Serve over 1 cup quinoa or rice noodles

MACROS PER SERVING:
Calories: 445 | Protein: 38g | Carbs: 42g | Fat: 15g'
)
ON CONFLICT DO NOTHING;

-- Recipe 4: Special Forces Salmon
INSERT INTO recipes (title, image_url, calories, protein, carbs, fat, instructions)
VALUES (
  'SPECIAL FORCES SALMON',
  'https://images.unsplash.com/photo-1467003909585-2f8a72700288',
  485,
  42,
  35,
  20,
  '1. Season 6oz salmon fillet with lemon, dill, salt, pepper
2. Bake at 400°F for 12-15 minutes
3. Roast sweet potato (1 medium) until tender
4. Steam asparagus with garlic
5. Plate with precision: salmon center, sweet potato and asparagus flanking

MACROS PER SERVING:
Calories: 485 | Protein: 42g | Carbs: 35g | Fat: 20g'
)
ON CONFLICT DO NOTHING;

-- Recipe 5: Recon Recovery Shake
INSERT INTO recipes (title, image_url, calories, protein, carbs, fat, instructions)
VALUES (
  'RECON RECOVERY SHAKE',
  'https://images.unsplash.com/photo-1622597467836-f3285f2131b8',
  340,
  30,
  45,
  5,
  '1. Blend 1 scoop protein powder (chocolate)
2. Add 1 frozen banana
3. Add 1 cup almond milk
4. Add handful of spinach (trust the process)
5. Add 1 tbsp peanut butter
6. Blend until smooth
7. Consume within 30 minutes post-mission

MACROS PER SERVING:
Calories: 340 | Protein: 30g | Carbs: 45g | Fat: 5g'
)
ON CONFLICT DO NOTHING;

-- Recipe 6: Infantry Eggs
INSERT INTO recipes (title, image_url, calories, protein, carbs, fat, instructions)
VALUES (
  'INFANTRY EGGS',
  'https://images.unsplash.com/photo-1525351484163-7529414344d8',
  295,
  24,
  18,
  15,
  '1. Scramble 3 whole eggs + 2 egg whites
2. Add diced tomatoes, spinach, onions to pan
3. Cook until eggs are just set
4. Serve with 1 slice whole wheat toast
5. Optional: hot sauce for combat readiness

MACROS PER SERVING:
Calories: 295 | Protein: 24g | Carbs: 18g | Fat: 15g'
)
ON CONFLICT DO NOTHING;

-- Recipe 7: Warrior Wrap
INSERT INTO recipes (title, image_url, calories, protein, carbs, fat, instructions)
VALUES (
  'WARRIOR WRAP',
  'https://images.unsplash.com/photo-1626700051175-6818013e1d4f',
  420,
  35,
  48,
  10,
  '1. Grill 5oz chicken breast
2. Slice into strips
3. Load whole wheat tortilla with:
   - Grilled chicken
   - Lettuce, tomatoes
   - Light Greek yogurt (instead of mayo)
   - Shredded cheese (1oz)
   - Hot sauce
4. Wrap tight and deploy

MACROS PER SERVING:
Calories: 420 | Protein: 35g | Carbs: 48g | Fat: 10g'
)
ON CONFLICT DO NOTHING;

-- Recipe 8: Commando Chili
INSERT INTO recipes (title, image_url, calories, protein, carbs, fat, instructions)
VALUES (
  'COMMANDO CHILI',
  'https://images.unsplash.com/photo-1583114867730-8cd69dfc8d7e',
  390,
  32,
  42,
  10,
  '1. Brown 6oz lean ground turkey
2. Add canned black beans, kidney beans (1 cup total)
3. Add diced tomatoes, tomato paste
4. Season with chili powder, cumin, garlic
5. Simmer 20-30 minutes
6. Serve hot, optionally with a side of tactical rice

MACROS PER SERVING:
Calories: 390 | Protein: 32g | Carbs: 42g | Fat: 10g'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
DECLARE
  admin_user_id UUID;
  briefing_count INTEGER;
BEGIN
  -- Check admin user
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'rajeshsunny@gmail.com';

  -- Count active briefings
  SELECT COUNT(*) INTO briefing_count
  FROM daily_briefings
  WHERE active = true;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'SEED DATA DEPLOYED SUCCESSFULLY';
  RAISE NOTICE '========================================';
  
  IF admin_user_id IS NOT NULL THEN
    RAISE NOTICE 'Admin User: rajeshsunny@gmail.com ✓';
    RAISE NOTICE 'User ID: %', admin_user_id;
  ELSE
    RAISE NOTICE 'Admin User: NOT FOUND (user must sign up first)';
  END IF;
  
  RAISE NOTICE 'Active Briefings: %', briefing_count;
  RAISE NOTICE 'Workouts: 4 missions (1 per tier for today)';
  RAISE NOTICE 'Recipes: 8 tactical meals';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Log in as rajeshsunny@gmail.com';
  RAISE NOTICE '2. Admin will be redirected to /command (not /dashboard)';
  RAISE NOTICE '3. Motivational Corner visible on /command page';
  RAISE NOTICE '4. Visit /barracks/content/briefing to manage briefings';
  RAISE NOTICE '';
  RAISE NOTICE 'Note:';
  RAISE NOTICE '- Admins → /command page';
  RAISE NOTICE '- Coaches → /barracks page';
  RAISE NOTICE '- Recruits/Soldiers → /dashboard page';
  RAISE NOTICE '========================================';
END $$;

