-- Migration 003: Create user_logs table
-- Tracks completed workouts with duration and notes

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
CREATE INDEX idx_user_logs_user_id ON user_logs(user_id);
CREATE INDEX idx_user_logs_workout_id ON user_logs(workout_id);
CREATE INDEX idx_user_logs_date ON user_logs(date);
CREATE INDEX idx_user_logs_user_date ON user_logs(user_id, date);
CREATE INDEX idx_user_logs_created_at ON user_logs(created_at);

-- Add comments for documentation
COMMENT ON TABLE user_logs IS 'Completed workout logs with duration and optional notes';
COMMENT ON COLUMN user_logs.duration IS 'Workout duration in minutes';
COMMENT ON COLUMN user_logs.date IS 'Date the workout was completed (defaults to today)';
