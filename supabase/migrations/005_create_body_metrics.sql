-- Migration 005: Create body_metrics table
-- Tracks weight over time for analytics

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
CREATE INDEX idx_body_metrics_user_id ON body_metrics(user_id);
CREATE INDEX idx_body_metrics_recorded_at ON body_metrics(recorded_at);
CREATE INDEX idx_body_metrics_user_date ON body_metrics(user_id, recorded_at);

-- Add comments for documentation
COMMENT ON TABLE body_metrics IS 'Weight tracking for analytics charts';
COMMENT ON COLUMN body_metrics.weight IS 'Body weight with 2 decimal precision (kg or lbs)';
COMMENT ON COLUMN body_metrics.recorded_at IS 'Date the weight was recorded';
