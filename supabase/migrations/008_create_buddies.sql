-- Migration 008: Create buddies table
-- Manages buddy relationships for social features

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
CREATE INDEX idx_buddies_user_id ON buddies(user_id);
CREATE INDEX idx_buddies_buddy_id ON buddies(buddy_id);
CREATE INDEX idx_buddies_status ON buddies(status);
CREATE INDEX idx_buddies_user_status ON buddies(user_id, status);

-- Add comments for documentation
COMMENT ON TABLE buddies IS 'Buddy relationships for social features and nudges';
COMMENT ON COLUMN buddies.status IS 'Relationship status: pending (awaiting acceptance) or accepted';
COMMENT ON CONSTRAINT no_self_buddy ON buddies IS 'Users cannot add themselves as buddies';
