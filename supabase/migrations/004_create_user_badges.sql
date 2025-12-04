-- Migration 004: Create user_badges table
-- Tracks earned badges (achievements) for gamification

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate badges
  CONSTRAINT unique_user_badge UNIQUE (user_id, badge_name)
);

-- Create indexes for performance
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_name ON user_badges(badge_name);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at);

-- Add comments for documentation
COMMENT ON TABLE user_badges IS 'User achievements/badges for gamification';
COMMENT ON COLUMN user_badges.badge_name IS 'Badge identifier (e.g., "First Blood", "Iron Week", "Century")';

-- Badge names reference (defined in app code):
-- - "First Blood": Complete first workout
-- - "Iron Week": 7-day streak
-- - "Century": 100 workouts
-- - etc.
