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
