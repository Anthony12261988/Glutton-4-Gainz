-- Migration 002: Create workouts table
-- Stores tier-based workout missions with YouTube videos and exercise details

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
CREATE INDEX idx_workouts_tier ON workouts(tier);
CREATE INDEX idx_workouts_scheduled_date ON workouts(scheduled_date);
CREATE INDEX idx_workouts_tier_date ON workouts(tier, scheduled_date);

-- Create trigger to auto-update updated_at timestamp
CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE workouts IS 'Daily workout missions assigned by tier';
COMMENT ON COLUMN workouts.sets_reps IS 'Array of exercise objects: [{"exercise": "Pushups", "reps": "20"}, ...]';
COMMENT ON COLUMN workouts.video_url IS 'YouTube video ID (e.g., "dQw4w9WgXcQ") or full URL';

-- Example sets_reps format:
-- [
--   {"exercise": "Pushups", "reps": "20"},
--   {"exercise": "Squats", "reps": "30"},
--   {"exercise": "Burpees", "reps": "15"}
-- ]
