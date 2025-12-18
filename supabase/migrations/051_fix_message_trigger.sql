-- Migration 051: Fix message trigger to use correct column names
-- The messages table uses sender_id/receiver_id, not user_id

-- Drop the old trigger and function
DROP TRIGGER IF EXISTS update_last_active_on_message ON messages;

-- Create new function that updates both sender and receiver last_active
CREATE OR REPLACE FUNCTION update_last_active_on_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update sender's last_active
  UPDATE profiles
  SET last_active = NOW()
  WHERE id = NEW.sender_id;

  -- Optionally update receiver's last_active when they receive a message
  -- (This shows they have activity even if they haven't sent messages)
  UPDATE profiles
  SET last_active = NOW()
  WHERE id = NEW.receiver_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger using the fixed function
CREATE TRIGGER update_last_active_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_last_active_on_message();

COMMENT ON FUNCTION update_last_active_on_message() IS 'Updates last_active timestamp for both sender and receiver when a message is sent';
