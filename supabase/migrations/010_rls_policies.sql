-- Migration 010: Row Level Security (RLS) Policies
-- Comprehensive security policies for all tables

-- ============================================================================
-- PROFILES TABLE RLS
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Coaches can read profiles of their assigned users
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

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profiles are created automatically via trigger (no direct INSERT policy needed)

-- ============================================================================
-- WORKOUTS TABLE RLS
-- ============================================================================

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read workouts
CREATE POLICY "Authenticated users can read workouts"
  ON workouts FOR SELECT
  TO authenticated
  USING (true);

-- Only coaches can create workouts
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

-- Only coaches can update workouts
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

-- Only coaches can delete workouts
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

-- ============================================================================
-- USER_LOGS TABLE RLS
-- ============================================================================

ALTER TABLE user_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own logs
CREATE POLICY "Users can read own logs"
  ON user_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Coaches can read logs of their assigned users
CREATE POLICY "Coaches can read assigned users logs"
  ON user_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = user_logs.user_id
      AND profiles.coach_id = auth.uid()
    )
  );

-- Users can insert their own logs
CREATE POLICY "Users can insert own logs"
  ON user_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own logs
CREATE POLICY "Users can update own logs"
  ON user_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own logs
CREATE POLICY "Users can delete own logs"
  ON user_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- USER_BADGES TABLE RLS
-- ============================================================================

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Users can read their own badges
CREATE POLICY "Users can read own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

-- Coaches can read badges of their assigned users
CREATE POLICY "Coaches can read assigned users badges"
  ON user_badges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = user_badges.user_id
      AND profiles.coach_id = auth.uid()
    )
  );

-- Badges are inserted only via database functions (service role)
-- No direct INSERT policy for regular users

-- ============================================================================
-- BODY_METRICS TABLE RLS
-- ============================================================================

ALTER TABLE body_metrics ENABLE ROW LEVEL SECURITY;

-- Users can read their own metrics
CREATE POLICY "Users can read own body metrics"
  ON body_metrics FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own metrics
CREATE POLICY "Users can insert own body metrics"
  ON body_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own metrics
CREATE POLICY "Users can update own body metrics"
  ON body_metrics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own metrics
CREATE POLICY "Users can delete own body metrics"
  ON body_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RECIPES TABLE RLS
-- ============================================================================

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read recipes
CREATE POLICY "Authenticated users can read recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (true);

-- Only coaches can create recipes
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

-- Only coaches can update recipes
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

-- Only coaches can delete recipes
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

-- ============================================================================
-- MEAL_PLANS TABLE RLS
-- ============================================================================

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- Users can read their own meal plans
CREATE POLICY "Users can read own meal plans"
  ON meal_plans FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own meal plans
CREATE POLICY "Users can insert own meal plans"
  ON meal_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own meal plans
CREATE POLICY "Users can update own meal plans"
  ON meal_plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own meal plans
CREATE POLICY "Users can delete own meal plans"
  ON meal_plans FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- BUDDIES TABLE RLS
-- ============================================================================

ALTER TABLE buddies ENABLE ROW LEVEL SECURITY;

-- Users can read buddy relationships where they are involved
CREATE POLICY "Users can read own buddy relationships"
  ON buddies FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = buddy_id);

-- Users can create buddy relationships (send requests)
CREATE POLICY "Users can create buddy relationships"
  ON buddies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update buddy relationships (accept requests)
CREATE POLICY "Users can update buddy relationships"
  ON buddies FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = buddy_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = buddy_id);

-- Users can delete their own buddy relationships
CREATE POLICY "Users can delete buddy relationships"
  ON buddies FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = buddy_id);

-- ============================================================================
-- MESSAGES TABLE RLS
-- ============================================================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages where they are sender or receiver
CREATE POLICY "Users can read own messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send messages
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Users can update messages (mark as read)
CREATE POLICY "Users can update received messages"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Users can delete their sent messages
CREATE POLICY "Users can delete sent messages"
  ON messages FOR DELETE
  USING (auth.uid() = sender_id);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Comments
COMMENT ON POLICY "Users can read own profile" ON profiles IS 'Users have full read access to their own profile data';
COMMENT ON POLICY "Coaches can read assigned users" ON profiles IS 'Coaches can view profiles of users assigned to them';
