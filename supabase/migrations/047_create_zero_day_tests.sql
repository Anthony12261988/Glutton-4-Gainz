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
