-- Migration 042: Add onboarding_completed field to profiles
-- Tracks whether a user has completed the Day Zero onboarding process

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Tracks if user has completed Day Zero onboarding (fitness test)';

-- Update existing users who have completed onboarding
-- (Users with XP > 0 or user_logs have clearly completed onboarding)
-- Also mark admins and coaches as completed (they don't need onboarding)
UPDATE profiles
SET onboarding_completed = TRUE
WHERE id IN (
  SELECT DISTINCT user_id FROM user_logs
)
OR xp > 0
OR role IN ('admin', 'coach');
