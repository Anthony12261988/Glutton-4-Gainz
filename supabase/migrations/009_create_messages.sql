-- Migration 009: Create messages table
-- Messaging system between users and coaches

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_receiver_unread ON messages(receiver_id, is_read) WHERE is_read = FALSE;

-- Add comments for documentation
COMMENT ON TABLE messages IS 'Messaging system for coach-user communication';
COMMENT ON COLUMN messages.is_read IS 'Whether the message has been read by the receiver';
