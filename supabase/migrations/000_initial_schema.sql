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

CREATE POLICY IF NOT EXISTS "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Coaches can read assigned users"
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

CREATE POLICY IF NOT EXISTS "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- WORKOUTS TABLE RLS
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Authenticated users can read workouts"
  ON workouts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY IF NOT EXISTS "Coaches can create workouts"
  ON workouts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'coach'
    )
  );

CREATE POLICY IF NOT EXISTS "Coaches can update workouts"
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

CREATE POLICY IF NOT EXISTS "Coaches can delete workouts"
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

CREATE POLICY IF NOT EXISTS "Users can read own logs"
  ON user_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Coaches can read assigned users logs"
  ON user_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = user_logs.user_id
      AND profiles.coach_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can insert own logs"
  ON user_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own logs"
  ON user_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own logs"
  ON user_logs FOR DELETE
  USING (auth.uid() = user_id);

-- USER_BADGES TABLE RLS
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can read own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Coaches can read assigned users badges"
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

CREATE POLICY IF NOT EXISTS "Users can read own body metrics"
  ON body_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own body metrics"
  ON body_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own body metrics"
  ON body_metrics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own body metrics"
  ON body_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- RECIPES TABLE RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Authenticated users can read recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY IF NOT EXISTS "Coaches can create recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'coach'
    )
  );

CREATE POLICY IF NOT EXISTS "Coaches can update recipes"
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

CREATE POLICY IF NOT EXISTS "Coaches can delete recipes"
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

CREATE POLICY IF NOT EXISTS "Users can read own meal plans"
  ON meal_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own meal plans"
  ON meal_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own meal plans"
  ON meal_plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own meal plans"
  ON meal_plans FOR DELETE
  USING (auth.uid() = user_id);

-- BUDDIES TABLE RLS
ALTER TABLE buddies ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can read own buddy relationships"
  ON buddies FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = buddy_id);

CREATE POLICY IF NOT EXISTS "Users can create buddy relationships"
  ON buddies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update buddy relationships"
  ON buddies FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = buddy_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = buddy_id);

CREATE POLICY IF NOT EXISTS "Users can delete buddy relationships"
  ON buddies FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = buddy_id);

-- MESSAGES TABLE RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can read own messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY IF NOT EXISTS "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY IF NOT EXISTS "Users can update received messages"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

CREATE POLICY IF NOT EXISTS "Users can delete sent messages"
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
CREATE POLICY IF NOT EXISTS "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Authenticated users can update their own files
CREATE POLICY IF NOT EXISTS "Users can update own avatar"
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
CREATE POLICY IF NOT EXISTS "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Anyone can view avatars (public read)
CREATE POLICY IF NOT EXISTS "Anyone can view avatars"
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
CREATE POLICY IF NOT EXISTS "Coaches can upload content assets"
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
CREATE POLICY IF NOT EXISTS "Coaches can update content assets"
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
CREATE POLICY IF NOT EXISTS "Coaches can delete content assets"
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
CREATE POLICY IF NOT EXISTS "Anyone can view content assets"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'content_assets');


-- ============================================================================
-- END OF INITIAL SCHEMA
-- ============================================================================
-- After running this migration, continue with migrations 026-058 in order
-- ============================================================================
