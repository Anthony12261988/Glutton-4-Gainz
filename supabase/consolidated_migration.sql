-- =========================================================================
-- GLUTTON4GAINZ - CONSOLIDATED DATABASE MIGRATION
-- =========================================================================
-- This file contains ALL database migrations consolidated into one script
-- Run this on a fresh Supabase database to set up the complete schema
--
-- Generated: $(date)
-- Total Migrations: 34 files (000 + 026-058)
-- =========================================================================

-- Start transaction
BEGIN;


-- =========================================================================
-- MIGRATION: 000_initial_schema.sql
-- =========================================================================

-- ============================================================================
-- INITIAL SCHEMA - Consolidated Migration
-- ============================================================================
-- This file consolidates migrations 001-012 into a single initial schema
-- Use this for new database setups. For existing databases, run individual
-- migrations 001-012 in order.
-- 
-- Contents:
--   001: Profiles table
--   002: Workouts table
--   003: User logs table
--   004: User badges table
--   005: Body metrics table
--   006: Recipes table
--   007: Meal plans table
--   008: Buddies table
--   009: Messages table
--   010: RLS policies
--   011: Functions and triggers
--   012: Storage buckets
-- ============================================================================

-- ============================================================================
-- MIGRATION 001: PROFILES TABLE
-- ============================================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'coach')),
  tier TEXT NOT NULL DEFAULT '.223' CHECK (tier IN ('.223', '.556', '.762', '.50 Cal')),
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  coach_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_coach_id ON profiles(coach_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active);
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles(tier);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE profiles IS 'User profiles extending auth.users with fitness app data';
COMMENT ON COLUMN profiles.tier IS 'Fitness tier: .223 (Novice), .556 (Intermediate), .762 (Advanced), .50 Cal (Elite)';
COMMENT ON COLUMN profiles.role IS 'User role: user (default) or coach (admin/trainer)';
COMMENT ON COLUMN profiles.xp IS 'Experience points earned from completing workouts (100 XP per workout)';
COMMENT ON COLUMN profiles.current_streak IS 'Current consecutive days with logged workouts';

-- ============================================================================
-- MIGRATION 002: WORKOUTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL CHECK (tier IN ('.223', '.556', '.762', '.50 Cal')),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT, -- YouTube video ID or full URL
  scheduled_date DATE NOT NULL,
  sets_reps JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique workout per tier per day
  CONSTRAINT unique_workout_tier_date UNIQUE (tier, scheduled_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workouts_tier ON workouts(tier);
CREATE INDEX IF NOT EXISTS idx_workouts_scheduled_date ON workouts(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_workouts_tier_date ON workouts(tier, scheduled_date);

-- Create trigger to auto-update updated_at timestamp
CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE workouts IS 'Daily workout missions assigned by tier';
COMMENT ON COLUMN workouts.sets_reps IS 'Array of exercise objects: [{"exercise": "Pushups", "reps": "20"}, ...]';
COMMENT ON COLUMN workouts.video_url IS 'YouTube video ID (e.g., "dQw4w9WgXcQ") or full URL';

-- ============================================================================
-- MIGRATION 003: USER_LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration INTEGER NOT NULL CHECK (duration > 0), -- Duration in minutes
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate logs: one workout per user per day
  CONSTRAINT unique_user_workout_date UNIQUE (user_id, workout_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_logs_user_id ON user_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_logs_workout_id ON user_logs(workout_id);
CREATE INDEX IF NOT EXISTS idx_user_logs_date ON user_logs(date);
CREATE INDEX IF NOT EXISTS idx_user_logs_user_date ON user_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_logs_created_at ON user_logs(created_at);

-- Add comments for documentation
COMMENT ON TABLE user_logs IS 'Completed workout logs with duration and optional notes';
COMMENT ON COLUMN user_logs.duration IS 'Workout duration in minutes';
COMMENT ON COLUMN user_logs.date IS 'Date the workout was completed (defaults to today)';

-- ============================================================================
-- MIGRATION 004: USER_BADGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate badges
  CONSTRAINT unique_user_badge UNIQUE (user_id, badge_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_name ON user_badges(badge_name);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at);

-- Add comments for documentation
COMMENT ON TABLE user_badges IS 'User achievements/badges for gamification';
COMMENT ON COLUMN user_badges.badge_name IS 'Badge identifier (e.g., "First Blood", "Iron Week", "Century")';

-- ============================================================================
-- MIGRATION 005: BODY_METRICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS body_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  weight NUMERIC(5,2) NOT NULL CHECK (weight > 0), -- Weight in kg or lbs (2 decimal places)
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One weight entry per user per day
  CONSTRAINT unique_user_weight_date UNIQUE (user_id, recorded_at)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_body_metrics_user_id ON body_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_body_metrics_recorded_at ON body_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_body_metrics_user_date ON body_metrics(user_id, recorded_at);

-- Add comments for documentation
COMMENT ON TABLE body_metrics IS 'Weight tracking for analytics charts';
COMMENT ON COLUMN body_metrics.weight IS 'Body weight with 2 decimal precision (kg or lbs)';
COMMENT ON COLUMN body_metrics.recorded_at IS 'Date the weight was recorded';

-- ============================================================================
-- MIGRATION 006: RECIPES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT,
  calories INTEGER NOT NULL CHECK (calories >= 0),
  protein INTEGER NOT NULL CHECK (protein >= 0),
  carbs INTEGER NOT NULL CHECK (carbs >= 0),
  fat INTEGER NOT NULL CHECK (fat >= 0),
  instructions TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_recipes_title ON recipes(title);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at);

-- Create trigger to auto-update updated_at timestamp
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE recipes IS 'Meal recipes for nutrition planner (premium feature)';
COMMENT ON COLUMN recipes.calories IS 'Total calories per serving';
COMMENT ON COLUMN recipes.protein IS 'Protein in grams per serving';
COMMENT ON COLUMN recipes.carbs IS 'Carbohydrates in grams per serving';
COMMENT ON COLUMN recipes.fat IS 'Fat in grams per serving';

-- ============================================================================
-- MIGRATION 007: MEAL_PLANS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  assigned_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One meal per user per day
  CONSTRAINT unique_user_meal_date UNIQUE (user_id, assigned_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_recipe_id ON meal_plans(recipe_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_assigned_date ON meal_plans(assigned_date);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON meal_plans(user_id, assigned_date);

-- Add comments for documentation
COMMENT ON TABLE meal_plans IS 'User meal assignments for weekly planning (premium feature)';
COMMENT ON COLUMN meal_plans.assigned_date IS 'Date this meal is assigned to';

-- ============================================================================
-- MIGRATION 008: BUDDIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS buddies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  buddy_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent self-buddy relationships
  CONSTRAINT no_self_buddy CHECK (user_id != buddy_id),

  -- Prevent duplicate buddy relationships
  CONSTRAINT unique_buddy_pair UNIQUE (user_id, buddy_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_buddies_user_id ON buddies(user_id);
CREATE INDEX IF NOT EXISTS idx_buddies_buddy_id ON buddies(buddy_id);
CREATE INDEX IF NOT EXISTS idx_buddies_status ON buddies(status);
CREATE INDEX IF NOT EXISTS idx_buddies_user_status ON buddies(user_id, status);

-- Add comments for documentation
COMMENT ON TABLE buddies IS 'Buddy relationships for social features and nudges';
COMMENT ON COLUMN buddies.status IS 'Relationship status: pending (awaiting acceptance) or accepted';
COMMENT ON CONSTRAINT no_self_buddy ON buddies IS 'Users cannot add themselves as buddies';

-- ============================================================================
-- MIGRATION 009: MESSAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_unread ON messages(receiver_id, is_read) WHERE is_read = FALSE;

-- Add comments for documentation
COMMENT ON TABLE messages IS 'Messaging system for coach-user communication';
COMMENT ON COLUMN messages.is_read IS 'Whether the message has been read by the receiver';

-- ============================================================================
-- MIGRATION 010: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- PROFILES TABLE RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Coaches can read assigned users" ON profiles;
CREATE POLICY "Coaches can read assigned users"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'coach'
      AND auth.uid() IN (
        SELECT coach_id FROM profiles WHERE coach_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- WORKOUTS TABLE RLS
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read workouts" ON workouts;
CREATE POLICY "Authenticated users can read workouts"
  ON workouts FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Coaches can create workouts" ON workouts;
CREATE POLICY "Coaches can create workouts"
  ON workouts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'coach'
    )
  );

DROP POLICY IF EXISTS "Coaches can update workouts" ON workouts;
CREATE POLICY "Coaches can update workouts"
  ON workouts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'coach'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'coach'
    )
  );

DROP POLICY IF EXISTS "Coaches can delete workouts" ON workouts;
CREATE POLICY "Coaches can delete workouts"
  ON workouts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'coach'
    )
  );

-- USER_LOGS TABLE RLS
ALTER TABLE user_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own logs" ON user_logs;
CREATE POLICY "Users can read own logs"
  ON user_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Coaches can read assigned users logs" ON user_logs;
CREATE POLICY "Coaches can read assigned users logs"
  ON user_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = user_logs.user_id
      AND profiles.coach_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own logs" ON user_logs;
CREATE POLICY "Users can insert own logs"
  ON user_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own logs" ON user_logs;
CREATE POLICY "Users can update own logs"
  ON user_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own logs" ON user_logs;
CREATE POLICY "Users can delete own logs"
  ON user_logs FOR DELETE
  USING (auth.uid() = user_id);

-- USER_BADGES TABLE RLS
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own badges" ON user_badges;
CREATE POLICY "Users can read own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Coaches can read assigned users badges" ON user_badges;
CREATE POLICY "Coaches can read assigned users badges"
  ON user_badges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = user_badges.user_id
      AND profiles.coach_id = auth.uid()
    )
  );

-- BODY_METRICS TABLE RLS
ALTER TABLE body_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own body metrics" ON body_metrics;
CREATE POLICY "Users can read own body metrics"
  ON body_metrics FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own body metrics" ON body_metrics;
CREATE POLICY "Users can insert own body metrics"
  ON body_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own body metrics" ON body_metrics;
CREATE POLICY "Users can update own body metrics"
  ON body_metrics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own body metrics" ON body_metrics;
CREATE POLICY "Users can delete own body metrics"
  ON body_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- RECIPES TABLE RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read recipes" ON recipes;
CREATE POLICY "Authenticated users can read recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Coaches can create recipes" ON recipes;
CREATE POLICY "Coaches can create recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'coach'
    )
  );

DROP POLICY IF EXISTS "Coaches can update recipes" ON recipes;
CREATE POLICY "Coaches can update recipes"
  ON recipes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'coach'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'coach'
    )
  );

DROP POLICY IF EXISTS "Coaches can delete recipes" ON recipes;
CREATE POLICY "Coaches can delete recipes"
  ON recipes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'coach'
    )
  );

-- MEAL_PLANS TABLE RLS
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own meal plans" ON meal_plans;
CREATE POLICY "Users can read own meal plans"
  ON meal_plans FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own meal plans" ON meal_plans;
CREATE POLICY "Users can insert own meal plans"
  ON meal_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own meal plans" ON meal_plans;
CREATE POLICY "Users can update own meal plans"
  ON meal_plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own meal plans" ON meal_plans;
CREATE POLICY "Users can delete own meal plans"
  ON meal_plans FOR DELETE
  USING (auth.uid() = user_id);

-- BUDDIES TABLE RLS
ALTER TABLE buddies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own buddy relationships" ON buddies;
CREATE POLICY "Users can read own buddy relationships"
  ON buddies FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = buddy_id);

DROP POLICY IF EXISTS "Users can create buddy relationships" ON buddies;
CREATE POLICY "Users can create buddy relationships"
  ON buddies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update buddy relationships" ON buddies;
CREATE POLICY "Users can update buddy relationships"
  ON buddies FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = buddy_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = buddy_id);

DROP POLICY IF EXISTS "Users can delete buddy relationships" ON buddies;
CREATE POLICY "Users can delete buddy relationships"
  ON buddies FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = buddy_id);

-- MESSAGES TABLE RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own messages" ON messages;
CREATE POLICY "Users can read own messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update received messages" ON messages;
CREATE POLICY "Users can update received messages"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can delete sent messages" ON messages;
CREATE POLICY "Users can delete sent messages"
  ON messages FOR DELETE
  USING (auth.uid() = sender_id);

-- GRANT PERMISSIONS
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- MIGRATION 011: DATABASE FUNCTIONS AND TRIGGERS
-- ============================================================================

-- FUNCTION: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, tier, xp, current_streak, last_active)
  VALUES (
    NEW.id,
    NEW.email,
    'user', -- Default role
    '.223', -- Default tier (Novice)
    0,      -- Starting XP
    0,      -- Starting streak
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

COMMENT ON FUNCTION handle_new_user() IS 'Automatically creates a profile when a new user signs up';

-- FUNCTION: Calculate current streak
CREATE OR REPLACE FUNCTION calculate_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_current_date DATE := CURRENT_DATE;
  v_check_date DATE;
BEGIN
  -- Start from today and count backwards
  v_check_date := v_current_date;

  LOOP
    -- Check if there's a log for this date
    IF EXISTS (
      SELECT 1 FROM user_logs
      WHERE user_id = p_user_id
      AND date = v_check_date
    ) THEN
      v_streak := v_streak + 1;
      v_check_date := v_check_date - INTERVAL '1 day';
    ELSE
      -- Streak broken
      EXIT;
    END IF;

    -- Safety: don't loop more than 365 days
    IF v_streak >= 365 THEN
      EXIT;
    END IF;
  END LOOP;

  RETURN v_streak;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_streak(UUID) IS 'Calculates consecutive days of workout logs for a user';

-- FUNCTION: Award "First Blood" badge
CREATE OR REPLACE FUNCTION award_first_blood_badge(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_log_count INTEGER;
BEGIN
  -- Count user's workout logs
  SELECT COUNT(*) INTO v_log_count
  FROM user_logs
  WHERE user_id = p_user_id;

  -- Award badge if this is their first workout
  IF v_log_count = 1 THEN
    INSERT INTO user_badges (user_id, badge_name, earned_at)
    VALUES (p_user_id, 'First Blood', NOW())
    ON CONFLICT (user_id, badge_name) DO NOTHING; -- Prevent duplicates
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION award_first_blood_badge(UUID) IS 'Awards "First Blood" badge on first workout completion';

-- FUNCTION: Award "Iron Week" badge
CREATE OR REPLACE FUNCTION award_iron_week_badge(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_streak INTEGER;
BEGIN
  -- Get current streak
  v_streak := calculate_streak(p_user_id);

  -- Award badge if streak >= 7 days
  IF v_streak >= 7 THEN
    INSERT INTO user_badges (user_id, badge_name, earned_at)
    VALUES (p_user_id, 'Iron Week', NOW())
    ON CONFLICT (user_id, badge_name) DO NOTHING; -- Prevent duplicates
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION award_iron_week_badge(UUID) IS 'Awards "Iron Week" badge on 7-day streak achievement';

-- FUNCTION: Award "Century" badge
CREATE OR REPLACE FUNCTION award_century_badge(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_log_count INTEGER;
BEGIN
  -- Count user's workout logs
  SELECT COUNT(*) INTO v_log_count
  FROM user_logs
  WHERE user_id = p_user_id;

  -- Award badge if 100+ workouts
  IF v_log_count >= 100 THEN
    INSERT INTO user_badges (user_id, badge_name, earned_at)
    VALUES (p_user_id, 'Century', NOW())
    ON CONFLICT (user_id, badge_name) DO NOTHING; -- Prevent duplicates
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION award_century_badge(UUID) IS 'Awards "Century" badge on 100th workout completion';

-- FUNCTION: Handle workout log completion (main trigger function)
CREATE OR REPLACE FUNCTION handle_workout_log()
RETURNS TRIGGER AS $$
DECLARE
  v_new_streak INTEGER;
BEGIN
  -- 1. Add 100 XP to user profile
  UPDATE profiles
  SET
    xp = xp + 100,
    last_active = NOW()
  WHERE id = NEW.user_id;

  -- 2. Calculate and update streak
  v_new_streak := calculate_streak(NEW.user_id);

  UPDATE profiles
  SET current_streak = v_new_streak
  WHERE id = NEW.user_id;

  -- 3. Award badges
  PERFORM award_first_blood_badge(NEW.user_id);
  PERFORM award_iron_week_badge(NEW.user_id);
  PERFORM award_century_badge(NEW.user_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION handle_workout_log() IS 'Main trigger function: awards XP, updates streak, and checks for badge eligibility';

-- Trigger: Handle workout completion
DROP TRIGGER IF EXISTS on_workout_log_created ON user_logs;
CREATE TRIGGER on_workout_log_created
  AFTER INSERT ON user_logs
  FOR EACH ROW
  EXECUTE FUNCTION handle_workout_log();

-- FUNCTION: Update last_active timestamp
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET last_active = NOW()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers: Update last_active on various user actions
DROP TRIGGER IF EXISTS update_last_active_on_log ON user_logs;
CREATE TRIGGER update_last_active_on_log
  AFTER INSERT ON user_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_last_active();

DROP TRIGGER IF EXISTS update_last_active_on_metric ON body_metrics;
CREATE TRIGGER update_last_active_on_metric
  AFTER INSERT ON body_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_last_active();

DROP TRIGGER IF EXISTS update_last_active_on_message ON messages;
CREATE TRIGGER update_last_active_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_last_active();

COMMENT ON FUNCTION update_last_active() IS 'Updates user last_active timestamp on various actions';

-- GRANT EXECUTE PERMISSIONS
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_streak(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION handle_workout_log() TO authenticated;
GRANT EXECUTE ON FUNCTION update_last_active() TO authenticated;

-- ============================================================================
-- MIGRATION 012: STORAGE BUCKETS CONFIGURATION
-- ============================================================================

-- BUCKET: avatars (User profile pictures)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  TRUE, -- Public read access
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects (should already be enabled, but ensure it)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can upload to their own folder
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Authenticated users can update their own files
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Authenticated users can delete their own files
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Anyone can view avatars (public read)
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- BUCKET: content_assets (Recipe images, badges, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content_assets',
  'content_assets',
  TRUE, -- Public read access
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Only coaches can upload content assets
DROP POLICY IF EXISTS "Coaches can upload content assets" ON storage.objects;
CREATE POLICY "Coaches can upload content assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'content_assets'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'coach'
    )
  );

-- Policy: Only coaches can update content assets
DROP POLICY IF EXISTS "Coaches can update content assets" ON storage.objects;
CREATE POLICY "Coaches can update content assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'content_assets'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'coach'
    )
  )
  WITH CHECK (
    bucket_id = 'content_assets'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'coach'
    )
  );

-- Policy: Only coaches can delete content assets
DROP POLICY IF EXISTS "Coaches can delete content assets" ON storage.objects;
CREATE POLICY "Coaches can delete content assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'content_assets'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'coach'
    )
  );

-- Policy: Anyone can view content assets (public read)
DROP POLICY IF EXISTS "Anyone can view content assets" ON storage.objects;
CREATE POLICY "Anyone can view content assets"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'content_assets');

-- ============================================================================
-- END OF INITIAL SCHEMA
-- ============================================================================
-- After running this migration, continue with migrations 026-058 in order
-- ============================================================================


-- =========================================================================
-- MIGRATION: 026_create_daily_briefing.sql
-- =========================================================================

create table if not exists daily_briefings (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  active boolean default true,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

alter table daily_briefings enable row level security;

create policy "Public read access"
  on daily_briefings for select
  using (true);

create policy "Coaches can insert"
  on daily_briefings for insert
  with check (auth.uid() in (select id from profiles where role = 'coach'));

create policy "Coaches can update"
  on daily_briefings for update
  using (auth.uid() in (select id from profiles where role = 'coach'));


-- =========================================================================
-- MIGRATION: 027_update_meal_plan_rls.sql
-- =========================================================================

-- Tighten meal_plans RLS to align with premium access (Soldier/Coach only)
-- Adds role check to existing CRUD policies so recruits cannot access meal plans

-- SELECT: only soldier/coach can read their own plans
DROP POLICY IF EXISTS "Users can read own meal plans" ON meal_plans;
CREATE POLICY "Users (soldier/coach) can read own meal plans"
  ON meal_plans FOR SELECT
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('soldier', 'coach')
    )
  );

-- INSERT
DROP POLICY IF EXISTS "Users can insert own meal plans" ON meal_plans;
CREATE POLICY "Users (soldier/coach) can insert own meal plans"
  ON meal_plans FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('soldier', 'coach')
    )
  );

-- UPDATE
DROP POLICY IF EXISTS "Users can update own meal plans" ON meal_plans;
CREATE POLICY "Users (soldier/coach) can update own meal plans"
  ON meal_plans FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('soldier', 'coach')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('soldier', 'coach')
    )
  );

-- DELETE
DROP POLICY IF EXISTS "Users can delete own meal plans" ON meal_plans;
CREATE POLICY "Users (soldier/coach) can delete own meal plans"
  ON meal_plans FOR DELETE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('soldier', 'coach')
    )
  );


-- =========================================================================
-- MIGRATION: 028_add_stripe_customer_id.sql
-- =========================================================================

-- Add Stripe customer ID to profiles for subscription management
-- Migration: 028_add_stripe_customer_id
-- Created: 2025-12-04

-- Add stripe_customer_id column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Create index for faster lookups by Stripe customer ID
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
ON profiles(stripe_customer_id);

-- Add comment for documentation
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for subscription management';


-- =========================================================================
-- MIGRATION: 029_add_performance_indexes.sql
-- =========================================================================

-- =====================================================
-- GLUTTON4GAINZ DATABASE INDEX OPTIMIZATION
-- Migration: 029_add_performance_indexes
-- Purpose: Add indexes for query optimization
-- Date: December 4, 2025
-- =====================================================

-- ===================================
-- USER LOGS INDEXES
-- ===================================

-- Index for user's workout history queries (most common query)
CREATE INDEX IF NOT EXISTS idx_user_logs_user_date
ON user_logs(user_id, date DESC);

-- Index for checking if user logged today
CREATE INDEX IF NOT EXISTS idx_user_logs_user_workout_date
ON user_logs(user_id, workout_id, date);

-- Index for date range queries (analytics)
CREATE INDEX IF NOT EXISTS idx_user_logs_date_range
ON user_logs(date DESC);

-- ===================================
-- WORKOUTS INDEXES
-- ===================================

-- Index for getting workouts by tier and date
CREATE INDEX IF NOT EXISTS idx_workouts_tier_date
ON workouts(tier, scheduled_date DESC);

-- Index for getting today's workout (most common)
CREATE INDEX IF NOT EXISTS idx_workouts_date
ON workouts(scheduled_date DESC);

-- ===================================
-- MESSAGES INDEXES
-- ===================================

-- Index for getting user's received messages
CREATE INDEX IF NOT EXISTS idx_messages_receiver_created_at
ON messages(receiver_id, created_at DESC);

-- Index for getting user's sent messages
CREATE INDEX IF NOT EXISTS idx_messages_sender_created_at
ON messages(sender_id, created_at DESC);

-- Composite index for conversation queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation
ON messages(sender_id, receiver_id, created_at DESC);

-- ===================================
-- BADGES INDEXES
-- ===================================

-- Index for getting user's badges
CREATE INDEX IF NOT EXISTS idx_user_badges_user_earned_at
ON user_badges(user_id, earned_at DESC);

-- Index for checking if badge exists
CREATE INDEX IF NOT EXISTS idx_user_badges_user_badge_name
ON user_badges(user_id, badge_name);

-- ===================================
-- BUDDIES INDEXES
-- ===================================

-- Index for getting user's buddy requests
CREATE INDEX IF NOT EXISTS idx_buddies_user_status_created
ON buddies(user_id, status, created_at DESC);

-- Index for getting pending requests
CREATE INDEX IF NOT EXISTS idx_buddies_buddy_status_created
ON buddies(buddy_id, status, created_at DESC);

-- Composite index for buddy relationship lookups
CREATE INDEX IF NOT EXISTS idx_buddies_both_users
ON buddies(user_id, buddy_id, status);

-- ===================================
-- MEAL PLANS INDEXES
-- ===================================

-- Index for getting user's meal plans by date
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date
ON meal_plans(user_id, assigned_date DESC);

-- Index for getting meals in a date range
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date_range
ON meal_plans(user_id, assigned_date);

-- ===================================
-- BODY METRICS INDEXES
-- ===================================

-- Index for getting user's body metrics history
CREATE INDEX IF NOT EXISTS idx_body_metrics_user_date
ON body_metrics(user_id, recorded_at DESC);

-- ===================================
-- PROFILES INDEXES (Additional)
-- ===================================

-- Index for coach roster queries
CREATE INDEX IF NOT EXISTS idx_profiles_role
ON profiles(role);

-- Index for searching users by email
-- (Note: email is unique, but index helps with lookups)
CREATE INDEX IF NOT EXISTS idx_profiles_email
ON profiles(email);

-- Index for tier-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_tier
ON profiles(tier);

-- ===================================
-- COMMENTS AND METADATA
-- ===================================

COMMENT ON INDEX idx_user_logs_user_date IS
'Optimizes user workout history queries';

COMMENT ON INDEX idx_messages_receiver_created_at IS
'Optimizes inbox message retrieval by newest first';

COMMENT ON INDEX idx_workouts_tier_date IS
'Optimizes workout assignment queries';

COMMENT ON INDEX idx_buddies_both_users IS
'Optimizes buddy relationship lookups';

COMMENT ON INDEX idx_meal_plans_user_date IS
'Optimizes meal planner date queries';

-- ===================================
-- ANALYZE TABLES FOR QUERY PLANNING
-- ===================================

ANALYZE user_logs;
ANALYZE workouts;
ANALYZE messages;
ANALYZE user_badges;
ANALYZE buddies;
ANALYZE meal_plans;
ANALYZE body_metrics;
ANALYZE profiles;

-- ===================================
-- VERIFICATION QUERY
-- ===================================

-- Run this to verify indexes were created:
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
-- ORDER BY tablename, indexname;


-- =========================================================================
-- MIGRATION: 030_add_push_subscriptions.sql
-- =========================================================================

-- =====================================================
-- PUSH SUBSCRIPTIONS TABLE
-- Migration: 030_add_push_subscriptions
-- Purpose: Store web push notification subscriptions
-- Date: December 4, 2025
-- =====================================================

-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one subscription per user
  UNIQUE(user_id)
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user
ON push_subscriptions(user_id);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only manage their own subscriptions
CREATE POLICY "Users can view their own push subscriptions"
ON push_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push subscriptions"
ON push_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push subscriptions"
ON push_subscriptions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push subscriptions"
ON push_subscriptions
FOR DELETE
USING (auth.uid() = user_id);

-- Grant access
GRANT ALL ON push_subscriptions TO authenticated;

-- Comments
COMMENT ON TABLE push_subscriptions IS 'Stores web push notification subscriptions for users';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'Push service endpoint URL';
COMMENT ON COLUMN push_subscriptions.p256dh_key IS 'Public key for message encryption';
COMMENT ON COLUMN push_subscriptions.auth_key IS 'Authentication secret for push service';


-- =========================================================================
-- MIGRATION: 031_add_coach_invites_and_admin_controls.sql
-- =========================================================================

-- Migration 031: Coach invites + admin controls

-- Create the table for coach invitations
create table if not exists public.coach_invites (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  token uuid default gen_random_uuid(),
  status text check (status in ('pending', 'accepted')) default 'pending',
  invited_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure helpful index for lookups by email and status
create index if not exists idx_coach_invites_email_status on public.coach_invites (email, status);

-- Enable RLS
alter table public.coach_invites enable row level security;

-- Policies
-- Admins can read/insert/update invites
create policy "Admins can view all invites" on public.coach_invites
  for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can insert invites" on public.coach_invites
  for insert with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can update invites" on public.coach_invites
  for update using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Public/Anon needs to read invites during onboarding check (restricted by email match)
create policy "Public can check their own invite" on public.coach_invites
  for select using (email = coalesce(auth.jwt() ->> 'email', ''));

-- Invited user can accept their own invite
create policy "Invited coach can accept invite" on public.coach_invites
  for update using (email = coalesce(auth.jwt() ->> 'email', ''))
  with check (email = coalesce(auth.jwt() ->> 'email', ''));

-- Add banned flag and expand role constraint to support admin/soldier
alter table public.profiles
  add column if not exists banned boolean default false;

update public.profiles set banned = false where banned is null;

alter table public.profiles
  alter column banned set not null,
  alter column banned set default false;

-- Expand allowed roles to include soldier/admin
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'soldier', 'coach', 'admin'));

-- Admin level access to profiles for command center controls
create policy "Admins can read all profiles" on public.profiles
  for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can update all profiles" on public.profiles
  for update using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));


-- =========================================================================
-- MIGRATION: 032_create_personal_records.sql
-- =========================================================================

-- Personal Records (PRs) Table for tracking personal bests
-- Supports various exercise types: weight-based, reps-based, time-based

create table if not exists personal_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  exercise_name text not null,
  record_type text not null check (record_type in ('weight', 'reps', 'time')),
  value numeric not null,
  unit text not null, -- 'lbs', 'kg', 'reps', 'seconds', 'minutes'
  notes text,
  achieved_at date default current_date not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for faster lookups
create index idx_personal_records_user_id on personal_records(user_id);
create index idx_personal_records_exercise on personal_records(exercise_name);

-- Enable RLS
alter table personal_records enable row level security;

-- Users can only see their own records
create policy "Users can view own PRs"
  on personal_records for select
  using (auth.uid() = user_id);

-- Users can insert their own records
create policy "Users can insert own PRs"
  on personal_records for insert
  with check (auth.uid() = user_id);

-- Users can update their own records
create policy "Users can update own PRs"
  on personal_records for update
  using (auth.uid() = user_id);

-- Users can delete their own records
create policy "Users can delete own PRs"
  on personal_records for delete
  using (auth.uid() = user_id);

-- Coaches can view all PRs
create policy "Coaches can view all PRs"
  on personal_records for select
  using (auth.uid() in (select id from profiles where role in ('coach', 'admin')));


-- =========================================================================
-- MIGRATION: 033_add_fitness_dossier_fields.sql
-- =========================================================================

-- Add Fitness Dossier fields to profiles table
-- These fields capture detailed health and fitness information during onboarding

-- Fitness experience level
alter table profiles add column if not exists fitness_experience text 
  check (fitness_experience in ('beginner', 'intermediate', 'advanced', 'athlete'));

-- Primary fitness goal
alter table profiles add column if not exists fitness_goal text
  check (fitness_goal in ('lose_fat', 'build_muscle', 'get_stronger', 'improve_endurance', 'general_fitness'));

-- Available equipment
alter table profiles add column if not exists available_equipment text[]
  default '{}';

-- Injuries or limitations (free text for flexibility)
alter table profiles add column if not exists injuries_limitations text;

-- Preferred workout duration (in minutes)
alter table profiles add column if not exists preferred_duration integer
  check (preferred_duration >= 15 and preferred_duration <= 120);

-- Workout days per week
alter table profiles add column if not exists workout_days_per_week integer
  check (workout_days_per_week >= 1 and workout_days_per_week <= 7);

-- Height (in inches for US, can convert from cm)
alter table profiles add column if not exists height_inches numeric;

-- Target weight (optional goal weight)
alter table profiles add column if not exists target_weight numeric;

-- Date of birth (for age-appropriate programming)
alter table profiles add column if not exists date_of_birth date;

-- Gender (for physiology-based recommendations)
alter table profiles add column if not exists gender text
  check (gender in ('male', 'female', 'other', 'prefer_not_to_say'));

-- Has completed full dossier
alter table profiles add column if not exists dossier_complete boolean default false;


-- =========================================================================
-- MIGRATION: 034_add_intro_video_watched.sql
-- =========================================================================

-- Add intro_video_watched field to profiles
-- This tracks whether the user has watched the welcome video

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS intro_video_watched BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN public.profiles.intro_video_watched IS 'Tracks if user has watched the trainer welcome video';


-- =========================================================================
-- MIGRATION: 035_videos_storage_bucket.sql
-- =========================================================================

-- Migration 035: Videos Storage Bucket
-- Sets up storage for intro video and future video content
-- NOTE: Run this migration via the Supabase Dashboard SQL Editor

-- ============================================================================
-- BUCKET: videos (Intro video, workout demos, etc.)
-- ============================================================================

-- Create videos bucket (public bucket for video content)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  TRUE, -- Public read access
  104857600, -- 100MB limit for videos
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (for idempotent migrations)
DROP POLICY IF EXISTS "Admins and coaches can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins and coaches can update videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins and coaches can delete videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view videos" ON storage.objects;

-- Policy: Only admins/coaches can upload videos
CREATE POLICY "Admins and coaches can upload videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'videos'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach')
    )
  );

-- Policy: Only admins/coaches can update videos
CREATE POLICY "Admins and coaches can update videos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'videos'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach')
    )
  )
  WITH CHECK (
    bucket_id = 'videos'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach')
    )
  );

-- Policy: Only admins/coaches can delete videos
CREATE POLICY "Admins and coaches can delete videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'videos'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach')
    )
  );

-- Policy: Anyone can view videos (public read)
CREATE POLICY "Anyone can view videos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'videos');


-- =========================================================================
-- MIGRATION: 036_fix_profiles_rls_recursion.sql
-- =========================================================================

-- Migration 036: Fix profiles RLS infinite recursion
-- The "Coaches can read assigned users" policy caused infinite recursion
-- by querying profiles table within a profiles policy

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Coaches can read assigned users" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Create a single, non-recursive SELECT policy
-- This combines all read access rules without querying profiles table
CREATE POLICY "Users can read profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id  -- Users can always read their own profile
    OR coach_id = auth.uid()  -- Coaches can read profiles of users they coach
  );


-- =========================================================================
-- MIGRATION: 037_fix_profiles_admin_access.sql
-- =========================================================================

-- Migration 037: Fix profiles RLS to include admin access
-- Previous migration (036) fixed recursion but removed admin access
-- This migration adds admin access back using a non-recursive approach

-- Drop existing policy
DROP POLICY IF EXISTS "Users can read profiles" ON profiles;

-- Create comprehensive SELECT policy that:
-- 1. Users can read their own profile (auth.uid() = id)
-- 2. Coaches can read profiles of users they coach (coach_id = auth.uid())
-- 3. Admins can read all profiles (using security definer function)

-- First, create a security definer function to check admin status
-- This avoids recursion by using a function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Now create the policy using the function
CREATE POLICY "Users can read profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id  -- Users can always read their own profile
    OR coach_id = auth.uid()  -- Coaches can read profiles of users they coach
    OR is_admin()  -- Admins can read all profiles
  );

-- Also fix coach_invites policies that might have similar issues
DROP POLICY IF EXISTS "Admins can view all invites" ON coach_invites;
DROP POLICY IF EXISTS "Admins can insert invites" ON coach_invites;
DROP POLICY IF EXISTS "Admins can update invites" ON coach_invites;

CREATE POLICY "Admins can view all invites" ON coach_invites
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can insert invites" ON coach_invites
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update invites" ON coach_invites
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());


-- =========================================================================
-- MIGRATION: 038_add_coach_profile_fields.sql
-- =========================================================================

-- Add coach-specific profile fields to profiles table
-- Migration: 038_add_coach_profile_fields.sql

-- Add coach profile fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS specialties TEXT,
ADD COLUMN IF NOT EXISTS certifications TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN profiles.bio IS 'Coach bio/about section describing their background and philosophy';
COMMENT ON COLUMN profiles.specialties IS 'Comma-separated list of training specialties (e.g., Strength Training, HIIT, Calisthenics)';
COMMENT ON COLUMN profiles.certifications IS 'Comma-separated list of certifications (e.g., NASM-CPT, CSCS)';
COMMENT ON COLUMN profiles.years_experience IS 'Number of years of coaching experience';


-- =========================================================================
-- MIGRATION: 040_allow_admin_content_management.sql
-- =========================================================================

-- Migration 040: Allow admins to manage content (workouts, recipes)
-- This updates the RLS policies to allow both coach AND admin roles
-- Coaches can only delete content they created, admins can delete anything

-- ============================================================================
-- ADD created_by COLUMNS
-- ============================================================================

-- Add created_by to workouts table
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add created_by to recipes table  
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_workouts_created_by ON workouts(created_by);
CREATE INDEX IF NOT EXISTS idx_recipes_created_by ON recipes(created_by);

-- ============================================================================
-- WORKOUTS TABLE RLS - Add admin access
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Coaches can insert workouts" ON workouts;
DROP POLICY IF EXISTS "Coaches can update workouts" ON workouts;
DROP POLICY IF EXISTS "Coaches can delete workouts" ON workouts;

-- Recreate with admin access
-- Insert: coaches and admins can insert, and we set created_by to their user id
CREATE POLICY "Coaches and admins can insert workouts"
  ON workouts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('coach', 'admin')
    )
  );

-- Update: coaches can update their own, admins can update any
CREATE POLICY "Coaches and admins can update workouts"
  ON workouts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (
        role = 'admin'
        OR (role = 'coach' AND workouts.created_by = auth.uid())
        OR (role = 'coach' AND workouts.created_by IS NULL) -- Allow updating legacy content
      )
    )
  );

-- Delete: coaches can delete their own, admins can delete any
CREATE POLICY "Coaches and admins can delete workouts"
  ON workouts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (
        role = 'admin'
        OR (role = 'coach' AND workouts.created_by = auth.uid())
        OR (role = 'coach' AND workouts.created_by IS NULL) -- Allow deleting legacy content
      )
    )
  );

-- ============================================================================
-- RECIPES TABLE RLS - Add admin access
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Coaches can insert recipes" ON recipes;
DROP POLICY IF EXISTS "Coaches can update recipes" ON recipes;
DROP POLICY IF EXISTS "Coaches can delete recipes" ON recipes;

-- Recreate with admin access
-- Insert: coaches and admins can insert
CREATE POLICY "Coaches and admins can insert recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('coach', 'admin')
    )
  );

-- Update: coaches can update their own, admins can update any
CREATE POLICY "Coaches and admins can update recipes"
  ON recipes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (
        role = 'admin'
        OR (role = 'coach' AND recipes.created_by = auth.uid())
        OR (role = 'coach' AND recipes.created_by IS NULL) -- Allow updating legacy content
      )
    )
  );

-- Delete: coaches can delete their own, admins can delete any
CREATE POLICY "Coaches and admins can delete recipes"
  ON recipes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (
        role = 'admin'
        OR (role = 'coach' AND recipes.created_by = auth.uid())
        OR (role = 'coach' AND recipes.created_by IS NULL) -- Allow deleting legacy content
      )
    )
  );


-- =========================================================================
-- MIGRATION: 041_allow_admin_meal_plans.sql
-- =========================================================================

-- Migration 041: Allow admins to manage meal plans
-- Adds admin role to meal_plans RLS policies

-- SELECT: soldier/coach/admin can read their own plans
DROP POLICY IF EXISTS "Users (soldier/coach) can read own meal plans" ON meal_plans;
CREATE POLICY "Users can read own meal plans"
  ON meal_plans FOR SELECT
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('soldier', 'coach', 'admin')
    )
  );

-- INSERT: soldier/coach/admin can insert own plans
DROP POLICY IF EXISTS "Users (soldier/coach) can insert own meal plans" ON meal_plans;
CREATE POLICY "Users can insert own meal plans"
  ON meal_plans FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('soldier', 'coach', 'admin')
    )
  );

-- UPDATE: soldier/coach/admin can update own plans
DROP POLICY IF EXISTS "Users (soldier/coach) can update own meal plans" ON meal_plans;
CREATE POLICY "Users can update own meal plans"
  ON meal_plans FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('soldier', 'coach', 'admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('soldier', 'coach', 'admin')
    )
  );

-- DELETE: soldier/coach/admin can delete own plans
DROP POLICY IF EXISTS "Users (soldier/coach) can delete own meal plans" ON meal_plans;
CREATE POLICY "Users can delete own meal plans"
  ON meal_plans FOR DELETE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('soldier', 'coach', 'admin')
    )
  );


-- =========================================================================
-- MIGRATION: 042_add_onboarding_completed.sql
-- =========================================================================

-- Migration 042: Add onboarding_completed field to profiles
-- Tracks whether a user has completed the Day Zero onboarding process

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Tracks if user has completed Day Zero onboarding (fitness test)';

-- Update existing users who have completed onboarding
-- (Users with XP > 0 or user_logs have clearly completed onboarding)
-- Also mark admins and coaches as completed (they don't need onboarding)
UPDATE profiles
SET onboarding_completed = TRUE
WHERE id IN (
  SELECT DISTINCT user_id FROM user_logs
)
OR xp > 0
OR role IN ('admin', 'coach');


-- =========================================================================
-- MIGRATION: 043_allow_admin_briefings.sql
-- =========================================================================

-- Migration 043: Allow admins to manage daily briefings
-- Admins should be able to create and update briefings, not just coaches

-- Drop existing policies
DROP POLICY IF EXISTS "Coaches can insert" ON daily_briefings;
DROP POLICY IF EXISTS "Coaches can update" ON daily_briefings;

-- Create new policies that allow both coaches and admins
CREATE POLICY "Coaches and admins can insert"
  ON daily_briefings FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('coach', 'admin')
    )
  );

CREATE POLICY "Coaches and admins can update"
  ON daily_briefings FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('coach', 'admin')
    )
  );

-- Also allow coaches and admins to delete briefings
CREATE POLICY "Coaches and admins can delete"
  ON daily_briefings FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('coach', 'admin')
    )
  );





-- =========================================================================
-- MIGRATION: 044_add_recipe_freemium_fields.sql
-- =========================================================================

-- Migration 044: Add freemium fields to recipes
-- This enables proper free vs premium recipe access control

-- Add is_standard_issue flag to mark recipes available to free tier users
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS is_standard_issue BOOLEAN DEFAULT false;

-- Add min_tier to specify minimum tier required to access a recipe
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS min_tier TEXT DEFAULT '.223';

-- Add constraint to ensure min_tier is valid
ALTER TABLE recipes
ADD CONSTRAINT check_min_tier
CHECK (min_tier IN ('.223', '.556', '.762', '.50 Cal'));

-- Create index for better query performance on freemium filtering
CREATE INDEX IF NOT EXISTS idx_recipes_standard_issue ON recipes(is_standard_issue);
CREATE INDEX IF NOT EXISTS idx_recipes_min_tier ON recipes(min_tier);

-- Add comments for documentation
COMMENT ON COLUMN recipes.is_standard_issue IS 'TRUE if recipe is available to free tier users (Recruits with .223 tier)';
COMMENT ON COLUMN recipes.min_tier IS 'Minimum tier required to access this recipe';


-- =========================================================================
-- MIGRATION: 046_add_is_standard_issue_to_recipes.sql
-- =========================================================================

-- Migration 046: Add is_standard_issue column to recipes table
-- This column is used to distinguish standard issue recipes for freemium access control

ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS is_standard_issue boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN recipes.is_standard_issue IS 'Indicates if the recipe is standard issue (visible to free .223 tier users)';


-- =========================================================================
-- MIGRATION: 046_fix_recipes_rls_freemium.sql
-- =========================================================================

-- Migration 045: Fix recipes RLS policy for freemium model
-- Enforces proper access control: free users see only standard issue recipes

-- Drop the overly permissive policy that allows all authenticated users to see all recipes
DROP POLICY IF EXISTS "Authenticated users can read recipes" ON recipes;

-- Create new policy that enforces freemium access control
CREATE POLICY "Users can read available recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (
    -- Coaches and admins can see all recipes
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('coach', 'admin')
    )
    OR
    -- Soldiers (paid users) can see all recipes
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'soldier'
    )
    OR
    -- Free users (role: 'user') with .223 tier can only see standard issue recipes
    (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'user'
        AND tier = '.223'
      )
      AND is_standard_issue = true
    )
    OR
    -- Free users with higher tiers (.556, .762, .50 Cal) earned via Zero Day can see all recipes
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'user'
      AND tier IN ('.556', '.762', '.50 Cal')
    )
  );

COMMENT ON POLICY "Users can read available recipes" ON recipes IS 'Enforces freemium model: free .223 users see standard issue only, premium users see all';


-- =========================================================================
-- MIGRATION: 046_seed_standard_issue_recipes.sql
-- =========================================================================

-- Migration 046: Mark standard issue recipes for free tier
-- These recipes are available to all users, including free tier (.223 Recruits)

-- Mark 5 basic, accessible recipes as standard issue
-- These are nutritious, simple meals suitable for beginners
UPDATE recipes
SET is_standard_issue = true
WHERE title IN (
  'COMBAT OATS',           -- Simple breakfast, easy to make
  'INFANTRY EGGS',         -- Basic protein breakfast
  'TACTICAL PROTEIN BOWL', -- Simple lunch/dinner
  'RECON RECOVERY SHAKE',  -- Post-workout recovery
  'WARRIOR WRAP'           -- Easy portable meal
);

-- All other recipes remain premium (is_standard_issue = false by default)
-- Premium recipes: RANGER BEEF STIR-FRY, SPECIAL FORCES SALMON, COMMANDO CHILI

-- Verify the update
DO $$
DECLARE
  standard_count INTEGER;
  premium_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO standard_count FROM recipes WHERE is_standard_issue = true;
  SELECT COUNT(*) INTO premium_count FROM recipes WHERE is_standard_issue = false;

  RAISE NOTICE 'Standard Issue Recipes: %', standard_count;
  RAISE NOTICE 'Premium Recipes: %', premium_count;

  IF standard_count < 5 THEN
    RAISE WARNING 'Expected at least 5 standard issue recipes, found %', standard_count;
  END IF;
END $$;


-- =========================================================================
-- MIGRATION: 047_create_zero_day_tests.sql
-- =========================================================================

-- Migration 047: Create zero_day_tests table
-- Stores historical data for Zero Day re-qualification attempts
-- Enables progress tracking and analytics

CREATE TABLE IF NOT EXISTS zero_day_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Test results
  pushups INTEGER NOT NULL CHECK (pushups >= 0),
  squats INTEGER NOT NULL CHECK (squats >= 0),
  plank_seconds INTEGER NOT NULL CHECK (plank_seconds >= 0),

  -- Tier assigned based on performance
  assigned_tier TEXT NOT NULL,
  previous_tier TEXT,

  -- Timestamps
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add constraint to ensure assigned_tier is valid
ALTER TABLE zero_day_tests
ADD CONSTRAINT check_assigned_tier
CHECK (assigned_tier IN ('.223', '.556', '.762', '.50 Cal'));

-- Add constraint for previous_tier (can be null for first test)
ALTER TABLE zero_day_tests
ADD CONSTRAINT check_previous_tier
CHECK (previous_tier IS NULL OR previous_tier IN ('.223', '.556', '.762', '.50 Cal'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_zero_day_tests_user_id ON zero_day_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_zero_day_tests_completed_at ON zero_day_tests(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_zero_day_tests_assigned_tier ON zero_day_tests(assigned_tier);

-- Enable RLS
ALTER TABLE zero_day_tests ENABLE ROW LEVEL SECURITY;

-- Users can read their own test history
CREATE POLICY "Users can read own zero day tests"
  ON zero_day_tests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own test results
CREATE POLICY "Users can insert own zero day tests"
  ON zero_day_tests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Coaches and admins can view all test results (for analytics)
CREATE POLICY "Coaches and admins can view all zero day tests"
  ON zero_day_tests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('coach', 'admin')
    )
  );

-- Add helpful comments
COMMENT ON TABLE zero_day_tests IS 'Historical log of Zero Day re-qualification test attempts';
COMMENT ON COLUMN zero_day_tests.pushups IS 'Maximum pushups completed in one set';
COMMENT ON COLUMN zero_day_tests.squats IS 'Maximum jump squats completed in one set';
COMMENT ON COLUMN zero_day_tests.plank_seconds IS 'Maximum plank hold time in seconds';
COMMENT ON COLUMN zero_day_tests.assigned_tier IS 'Tier assigned based on test performance';
COMMENT ON COLUMN zero_day_tests.previous_tier IS 'User tier before this test (null for first test)';


-- =========================================================================
-- MIGRATION: 048_fix_briefings_read_policy.sql
-- =========================================================================

-- Migration 048: Fix daily briefings read access
-- Ensure all authenticated users can read briefings

-- Drop and recreate the public read policy to ensure it's active
DROP POLICY IF EXISTS "Public read access" ON daily_briefings;
DROP POLICY IF EXISTS "Authenticated users can read" ON daily_briefings;

-- Create policy allowing all authenticated users to read briefings
CREATE POLICY "Authenticated users can read briefings"
  ON daily_briefings FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON POLICY "Authenticated users can read briefings" ON daily_briefings IS 'All authenticated users can view active briefings';


-- =========================================================================
-- MIGRATION: 049_add_meal_of_the_day.sql
-- =========================================================================

-- Migration 049: Add Meal of the Day feature
-- Creates featured_meals table to store daily featured recipes visible to all users

CREATE TABLE IF NOT EXISTS featured_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  featured_date DATE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Index for fast daily lookup
CREATE INDEX IF NOT EXISTS idx_featured_meals_date ON featured_meals(featured_date);
CREATE INDEX IF NOT EXISTS idx_featured_meals_recipe ON featured_meals(recipe_id);

-- Enable RLS
ALTER TABLE featured_meals ENABLE ROW LEVEL SECURITY;

-- Everyone can read featured meals (including free users)
CREATE POLICY "Anyone can view featured meals"
  ON featured_meals FOR SELECT
  TO authenticated
  USING (true);

-- Only admins and coaches can manage featured meals
CREATE POLICY "Admins and coaches can insert featured meals"
  ON featured_meals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach')
    )
  );

CREATE POLICY "Admins and coaches can update featured meals"
  ON featured_meals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach')
    )
  );

CREATE POLICY "Admins and coaches can delete featured meals"
  ON featured_meals FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach')
    )
  );

-- Add helpful comments
COMMENT ON TABLE featured_meals IS 'Daily featured recipe visible to all users including free recruits';
COMMENT ON COLUMN featured_meals.recipe_id IS 'Recipe to feature for this date';
COMMENT ON COLUMN featured_meals.featured_date IS 'Date this recipe is featured (one per day)';
COMMENT ON COLUMN featured_meals.created_by IS 'Admin/coach who set this featured meal';


-- =========================================================================
-- MIGRATION: 050_remove_tier_based_recipe_access.sql
-- =========================================================================

-- Migration 050: Remove tier-based recipe access
-- Updates RLS policy to enforce strict role-based access
-- Premium features now require Soldier role (payment only), NOT tier

-- Drop old policy that allows tier-based access
DROP POLICY IF EXISTS "Users can read available recipes" ON recipes;

-- Create new policy: ONLY role-based access
CREATE POLICY "Role-based recipe access"
  ON recipes FOR SELECT
  TO authenticated
  USING (
    -- Admins and coaches see all recipes
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('coach', 'admin')
    )
    OR
    -- Soldiers (paid users) see all recipes
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'soldier'
    )
    OR
    -- Free users (role: 'user') ONLY see standard issue recipes
    -- Regardless of their tier (.223, .556, .762, .50 Cal)
    (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'user'
      )
      AND is_standard_issue = true
    )
  );

COMMENT ON POLICY "Role-based recipe access" ON recipes IS
  'Free recruits (role: user) see only standard_issue recipes. Premium access requires Soldier role (payment), NOT tier.';


-- =========================================================================
-- MIGRATION: 051_fix_message_trigger.sql
-- =========================================================================

-- Migration 051: Fix message trigger to use correct column names
-- The messages table uses sender_id/receiver_id, not user_id

-- Drop the old trigger and function
DROP TRIGGER IF EXISTS update_last_active_on_message ON messages;

-- Create new function that updates both sender and receiver last_active
CREATE OR REPLACE FUNCTION update_last_active_on_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update sender's last_active
  UPDATE profiles
  SET last_active = NOW()
  WHERE id = NEW.sender_id;

  -- Optionally update receiver's last_active when they receive a message
  -- (This shows they have activity even if they haven't sent messages)
  UPDATE profiles
  SET last_active = NOW()
  WHERE id = NEW.receiver_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger using the fixed function
CREATE TRIGGER update_last_active_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_last_active_on_message();

COMMENT ON FUNCTION update_last_active_on_message() IS 'Updates last_active timestamp for both sender and receiver when a message is sent';


-- =========================================================================
-- MIGRATION: 052_create_formation_posts.sql
-- =========================================================================

-- Migration 052: Create Formation Posts Tables
-- Community feed with posts, likes, and comments

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  image_url TEXT,
  workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
  user_log_id UUID REFERENCES user_logs(id) ON DELETE SET NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Post likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Post comments table
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at DESC);

-- Trigger function to update likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for likes count
DROP TRIGGER IF EXISTS post_likes_count_trigger ON post_likes;
CREATE TRIGGER post_likes_count_trigger
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

-- Trigger function to update comments count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comments count
DROP TRIGGER IF EXISTS post_comments_count_trigger ON post_comments;
CREATE TRIGGER post_comments_count_trigger
  AFTER INSERT OR DELETE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

-- Comments
COMMENT ON TABLE posts IS 'Community posts with images and workout sharing';
COMMENT ON TABLE post_likes IS 'User likes on posts';
COMMENT ON TABLE post_comments IS 'Comments on community posts';
COMMENT ON FUNCTION update_post_likes_count() IS 'Automatically updates likes_count when likes are added/removed';
COMMENT ON FUNCTION update_post_comments_count() IS 'Automatically updates comments_count when comments are added/removed';


-- =========================================================================
-- MIGRATION: 053_formation_rls_policies.sql
-- =========================================================================

-- Migration 053: Formation RLS Policies
-- Row Level Security for posts, likes, and comments

-- Enable RLS for posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view posts
DROP POLICY IF EXISTS "Anyone can view posts" ON posts;
CREATE POLICY "Anyone can view posts"
  ON posts FOR SELECT TO authenticated USING (true);

-- Users can create own posts
DROP POLICY IF EXISTS "Users can create own posts" ON posts;
CREATE POLICY "Users can create own posts"
  ON posts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update own posts
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete own posts
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Enable RLS for post_likes
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes
DROP POLICY IF EXISTS "Anyone can view likes" ON post_likes;
CREATE POLICY "Anyone can view likes"
  ON post_likes FOR SELECT TO authenticated USING (true);

-- Users can like posts
DROP POLICY IF EXISTS "Users can like posts" ON post_likes;
CREATE POLICY "Users can like posts"
  ON post_likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can unlike posts
DROP POLICY IF EXISTS "Users can unlike posts" ON post_likes;
CREATE POLICY "Users can unlike posts"
  ON post_likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Enable RLS for post_comments
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments
DROP POLICY IF EXISTS "Anyone can view comments" ON post_comments;
CREATE POLICY "Anyone can view comments"
  ON post_comments FOR SELECT TO authenticated USING (true);

-- Users can comment
DROP POLICY IF EXISTS "Users can comment" ON post_comments;
CREATE POLICY "Users can comment"
  ON post_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update own comments
DROP POLICY IF EXISTS "Users can update own comments" ON post_comments;
CREATE POLICY "Users can update own comments"
  ON post_comments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete own comments
DROP POLICY IF EXISTS "Users can delete own comments" ON post_comments;
CREATE POLICY "Users can delete own comments"
  ON post_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- =========================================================================
-- MIGRATION: 054_meal_planner_enhancements.sql
-- =========================================================================

-- Migration 054: Enhanced Meal Planner Tables
-- Macro tracking, templates, shopping lists, and multi-meal support

-- Daily macros tracking
CREATE TABLE IF NOT EXISTS daily_macros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  target_calories INTEGER,
  target_protein INTEGER,
  target_carbs INTEGER,
  target_fat INTEGER,
  actual_calories INTEGER DEFAULT 0,
  actual_protein INTEGER DEFAULT 0,
  actual_carbs INTEGER DEFAULT 0,
  actual_fat INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Meal templates
CREATE TABLE IF NOT EXISTS meal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Template meals (junction table)
CREATE TABLE IF NOT EXISTS template_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES meal_templates(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  day_offset INTEGER NOT NULL DEFAULT 0,
  meal_number INTEGER NOT NULL DEFAULT 1 CHECK (meal_number >= 1 AND meal_number <= 6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(template_id, day_offset, meal_number)
);

-- Shopping lists
CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  ingredients JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Extend meal_plans table for multi-meal support
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS meal_number INTEGER DEFAULT 1 CHECK (meal_number >= 1 AND meal_number <= 6);
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS notes TEXT;

-- Drop old unique constraint if exists
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_user_id_assigned_date_key;

-- Add new unique constraint for user + date + meal number
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'meal_plans_unique_meal'
  ) THEN
    ALTER TABLE meal_plans
    ADD CONSTRAINT meal_plans_unique_meal
    UNIQUE (user_id, assigned_date, meal_number);
  END IF;
END $$;

-- Extend recipes table for ingredients and timing
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS ingredients JSONB DEFAULT '[]';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS prep_time_minutes INTEGER;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cook_time_minutes INTEGER;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_macros_user_date ON daily_macros(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_meal_templates_user ON meal_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_templates_public ON meal_templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user ON shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_meal_number ON meal_plans(meal_number);

-- RLS policies for daily_macros
ALTER TABLE daily_macros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own macros" ON daily_macros;
CREATE POLICY "Users can manage own macros" ON daily_macros
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- RLS policies for meal_templates
ALTER TABLE meal_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view public templates" ON meal_templates;
CREATE POLICY "Users can view public templates" ON meal_templates
  FOR SELECT TO authenticated USING (is_public = true OR auth.uid() = user_id OR auth.uid() = coach_id);

DROP POLICY IF EXISTS "Users can manage own templates" ON meal_templates;
CREATE POLICY "Users can manage own templates" ON meal_templates
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- RLS policies for template_meals
ALTER TABLE template_meals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view template meals" ON template_meals;
CREATE POLICY "Users can view template meals" ON template_meals
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM meal_templates WHERE id = template_id AND (is_public = true OR user_id = auth.uid() OR coach_id = auth.uid()))
  );

-- RLS policies for shopping_lists
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own shopping lists" ON shopping_lists;
CREATE POLICY "Users can manage own shopping lists" ON shopping_lists
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE daily_macros IS 'Daily macro targets and actuals for users';
COMMENT ON TABLE meal_templates IS 'Reusable meal plan templates';
COMMENT ON TABLE template_meals IS 'Meals within templates';
COMMENT ON TABLE shopping_lists IS 'Auto-generated shopping lists from meal plans';


-- =========================================================================
-- MIGRATION: 055_gamification_challenges.sql
-- =========================================================================

-- Migration 055: Gamification Challenges System
-- Challenge-based badges and community challenges

-- Challenge types enum
DO $$ BEGIN
  CREATE TYPE challenge_type AS ENUM ('workout_count', 'streak_days', 'xp_total', 'community_posts', 'personal_record');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Challenge status enum
DO $$ BEGIN
  CREATE TYPE challenge_status AS ENUM ('upcoming', 'active', 'completed', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Badge category enum
DO $$ BEGIN
  CREATE TYPE badge_category AS ENUM ('workout', 'streak', 'community', 'challenge', 'milestone');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Badge rarity enum
DO $$ BEGIN
  CREATE TYPE badge_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type challenge_type NOT NULL,
  target_value INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status challenge_status NOT NULL DEFAULT 'upcoming',
  badge_reward TEXT,
  xp_reward INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Challenge participants
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(challenge_id, user_id)
);

-- Badge definitions (for structured badge management)
CREATE TABLE IF NOT EXISTS badge_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  category badge_category NOT NULL,
  rarity badge_rarity NOT NULL DEFAULT 'common',
  icon_name TEXT,
  requirement_type TEXT,
  requirement_value INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_dates ON challenges(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_completed ON challenge_participants(completed);

-- RLS for challenges
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active challenges" ON challenges;
CREATE POLICY "Anyone can view active challenges" ON challenges
  FOR SELECT TO authenticated USING (status IN ('active', 'upcoming'));

DROP POLICY IF EXISTS "Coaches/admins can manage challenges" ON challenges;
CREATE POLICY "Coaches/admins can manage challenges" ON challenges
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

-- RLS for challenge_participants
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view participants" ON challenge_participants;
CREATE POLICY "Anyone can view participants" ON challenge_participants
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can join challenges" ON challenge_participants;
CREATE POLICY "Users can join challenges" ON challenge_participants
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can track own progress" ON challenge_participants;
CREATE POLICY "Users can track own progress" ON challenge_participants
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- RLS for badge_definitions
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view badge definitions" ON badge_definitions;
CREATE POLICY "Anyone can view badge definitions" ON badge_definitions
  FOR SELECT TO authenticated USING (true);

-- Comments
COMMENT ON TABLE challenges IS 'Community challenges with rewards';
COMMENT ON TABLE challenge_participants IS 'User participation in challenges';
COMMENT ON TABLE badge_definitions IS 'Structured badge definitions with metadata';


-- =========================================================================
-- MIGRATION: 056_seed_badge_definitions.sql
-- =========================================================================

-- Migration 056: Seed Badge Definitions
-- Initial badge definitions for existing and new challenge badges

-- Insert existing workout badges
INSERT INTO badge_definitions (badge_name, display_name, description, category, rarity, requirement_type, requirement_value)
VALUES
  ('First Blood', 'First Blood', 'Complete your first workout', 'workout', 'common', 'workout_count', 1),
  ('Double Digits', 'Double Digits', 'Complete 10 workouts', 'workout', 'common', 'workout_count', 10),
  ('Quarter Century', 'Quarter Century', 'Complete 25 workouts', 'workout', 'rare', 'workout_count', 25),
  ('Half Century', 'Half Century', 'Complete 50 workouts', 'workout', 'rare', 'workout_count', 50),
  ('Century', 'Century', 'Complete 100 workouts', 'workout', 'epic', 'workout_count', 100),
  ('Iron Week', 'Iron Week', 'Maintain a 7-day workout streak', 'streak', 'common', 'streak_days', 7),
  ('Streak Master', 'Streak Master', 'Maintain a 30-day workout streak', 'streak', 'epic', 'streak_days', 30)
ON CONFLICT (badge_name) DO NOTHING;

-- Insert new challenge badges
INSERT INTO badge_definitions (badge_name, display_name, description, category, rarity, requirement_type, requirement_value)
VALUES
  ('Challenge Accepted', 'Challenge Accepted', 'Complete your first challenge', 'challenge', 'common', 'challenges_completed', 1),
  ('Challenge Champion', 'Challenge Champion', 'Complete 5 challenges', 'challenge', 'rare', 'challenges_completed', 5),
  ('Challenge Legend', 'Challenge Legend', 'Complete 10 challenges', 'challenge', 'epic', 'challenges_completed', 10)
ON CONFLICT (badge_name) DO NOTHING;


-- =========================================================================
-- MIGRATION: 057_challenge_triggers.sql
-- =========================================================================

-- Migration 057: Challenge Progress Triggers
-- Automatic challenge progress tracking and badge awarding

-- Function to update challenge progress
CREATE OR REPLACE FUNCTION update_challenge_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_challenge RECORD;
  v_progress INTEGER;
BEGIN
  -- Find active challenges user is participating in
  FOR v_challenge IN
    SELECT cp.id as participant_id, c.id as challenge_id, c.challenge_type, c.target_value
    FROM challenge_participants cp
    JOIN challenges c ON c.id = cp.challenge_id
    WHERE cp.user_id = NEW.user_id
      AND cp.completed = false
      AND c.status = 'active'
  LOOP
    -- Calculate progress based on challenge type
    CASE v_challenge.challenge_type
      WHEN 'workout_count' THEN
        SELECT COUNT(*) INTO v_progress FROM user_logs WHERE user_id = NEW.user_id;
      WHEN 'streak_days' THEN
        SELECT current_streak INTO v_progress FROM profiles WHERE id = NEW.user_id;
      WHEN 'xp_total' THEN
        SELECT xp INTO v_progress FROM profiles WHERE id = NEW.user_id;
      ELSE
        v_progress := 0;
    END CASE;

    -- Update participant progress
    UPDATE challenge_participants
    SET progress = v_progress,
        completed = (v_progress >= v_challenge.target_value),
        completed_at = CASE WHEN v_progress >= v_challenge.target_value THEN NOW() ELSE completed_at END
    WHERE id = v_challenge.participant_id;

    -- Award badge if challenge completed
    IF v_progress >= v_challenge.target_value THEN
      PERFORM award_challenge_badge(NEW.user_id, v_challenge.participant_id);
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to award challenge badges
CREATE OR REPLACE FUNCTION award_challenge_badge(p_user_id UUID, p_participant_id UUID)
RETURNS VOID AS $$
DECLARE
  v_badge_name TEXT;
  v_completed_count INTEGER;
BEGIN
  -- Get badge reward from challenge
  SELECT c.badge_reward INTO v_badge_name
  FROM challenge_participants cp
  JOIN challenges c ON c.id = cp.challenge_id
  WHERE cp.id = p_participant_id;

  -- Award specific challenge badge if defined
  IF v_badge_name IS NOT NULL THEN
    INSERT INTO user_badges (user_id, badge_name, earned_at)
    VALUES (p_user_id, v_badge_name, NOW())
    ON CONFLICT (user_id, badge_name) DO NOTHING;
  END IF;

  -- Check for challenge completion milestone badges
  SELECT COUNT(*) INTO v_completed_count
  FROM challenge_participants
  WHERE user_id = p_user_id AND completed = true;

  IF v_completed_count = 1 THEN
    INSERT INTO user_badges (user_id, badge_name) VALUES (p_user_id, 'Challenge Accepted') ON CONFLICT DO NOTHING;
  ELSIF v_completed_count = 5 THEN
    INSERT INTO user_badges (user_id, badge_name) VALUES (p_user_id, 'Challenge Champion') ON CONFLICT DO NOTHING;
  ELSIF v_completed_count = 10 THEN
    INSERT INTO user_badges (user_id, badge_name) VALUES (p_user_id, 'Challenge Legend') ON CONFLICT DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on workout completion to update challenge progress
DROP TRIGGER IF EXISTS update_challenges_on_workout ON user_logs;
CREATE TRIGGER update_challenges_on_workout
  AFTER INSERT ON user_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_progress();

-- Trigger on profile XP/streak update
DROP TRIGGER IF EXISTS update_challenges_on_profile_update ON profiles;
CREATE TRIGGER update_challenges_on_profile_update
  AFTER UPDATE OF xp, current_streak ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_progress();

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_challenge_progress() TO authenticated;
GRANT EXECUTE ON FUNCTION award_challenge_badge(UUID, UUID) TO authenticated;

-- Comments
COMMENT ON FUNCTION update_challenge_progress() IS 'Automatically updates challenge progress when users complete workouts or gain XP';
COMMENT ON FUNCTION award_challenge_badge(UUID, UUID) IS 'Awards badges when challenges are completed';


-- =========================================================================
-- MIGRATION: 058_create_notifications.sql
-- =========================================================================

-- =====================================================
-- NOTIFICATIONS TABLE
-- Migration: 058_create_notifications
-- Purpose: Store in-app notifications for users
-- Date: January 2025
-- =====================================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('payment_failed', 'payment_success', 'subscription_canceled', 'workout_reminder', 'badge_earned', 'message_received', 'system', 'info', 'warning', 'error')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
ON notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Service role can insert notifications (for system notifications)
-- This allows webhook handlers and server-side code to create notifications
CREATE POLICY "Service role can insert notifications"
ON notifications
FOR INSERT
WITH CHECK (true);

-- Grant access
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON notifications TO service_role;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET is_read = TRUE,
      read_at = NOW()
  WHERE id = notification_id
    AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET is_read = TRUE,
      read_at = NOW()
  WHERE user_id = auth.uid()
    AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON COLUMN notifications.type IS 'Type of notification: payment_failed, payment_success, subscription_canceled, workout_reminder, badge_earned, message_received, system, info, warning, error';
COMMENT ON COLUMN notifications.priority IS 'Notification priority: low, normal, high, urgent';
COMMENT ON COLUMN notifications.action_url IS 'Optional URL to navigate to when notification is clicked';
COMMENT ON COLUMN notifications.is_read IS 'Whether the notification has been read by the user';


-- =========================================================================
-- MIGRATION TRACKING TABLE
-- =========================================================================

-- Create schema_migrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  execution_time_ms INTEGER,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'pending')),
  executed_by TEXT,
  notes TEXT
);

-- Record all migrations as executed
INSERT INTO schema_migrations (version, name, status, executed_at)
VALUES
  ('000', 'initial_schema', 'success', NOW()),
  ('026', 'create_daily_briefing', 'success', NOW()),
  ('027', 'update_meal_plan_rls', 'success', NOW()),
  ('028', 'add_stripe_customer_id', 'success', NOW()),
  ('029', 'add_performance_indexes', 'success', NOW()),
  ('030', 'add_push_subscriptions', 'success', NOW()),
  ('031', 'add_coach_invites_and_admin_controls', 'success', NOW()),
  ('032', 'create_personal_records', 'success', NOW()),
  ('033', 'add_fitness_dossier_fields', 'success', NOW()),
  ('034', 'add_intro_video_watched', 'success', NOW()),
  ('035', 'videos_storage_bucket', 'success', NOW()),
  ('036', 'fix_profiles_rls_recursion', 'success', NOW()),
  ('037', 'fix_profiles_admin_access', 'success', NOW()),
  ('038', 'add_coach_profile_fields', 'success', NOW()),
  ('040', 'allow_admin_content_management', 'success', NOW()),
  ('041', 'allow_admin_meal_plans', 'success', NOW()),
  ('042', 'add_onboarding_completed', 'success', NOW()),
  ('043', 'allow_admin_briefings', 'success', NOW()),
  ('044', 'add_recipe_freemium_fields', 'success', NOW()),
  ('046', 'add_is_standard_issue_to_recipes', 'success', NOW()),
  ('047', 'create_zero_day_tests', 'success', NOW()),
  ('048', 'fix_briefings_read_policy', 'success', NOW()),
  ('049', 'add_meal_of_the_day', 'success', NOW()),
  ('050', 'remove_tier_based_recipe_access', 'success', NOW()),
  ('051', 'fix_message_trigger', 'success', NOW()),
  ('052', 'create_formation_posts', 'success', NOW()),
  ('053', 'formation_rls_policies', 'success', NOW()),
  ('054', 'meal_planner_enhancements', 'success', NOW()),
  ('055', 'gamification_challenges', 'success', NOW()),
  ('056', 'seed_badge_definitions', 'success', NOW()),
  ('057', 'challenge_triggers', 'success', NOW()),
  ('058', 'create_notifications', 'success', NOW())
ON CONFLICT (version) DO NOTHING;

-- Commit transaction
COMMIT;

-- =========================================================================
-- SETUP COMPLETE
-- =========================================================================
-- All migrations have been applied successfully!
--
-- Next steps:
-- 1. Verify all tables were created
-- 2. Run seed data scripts if needed
-- 3. Generate TypeScript types
-- =========================================================================
