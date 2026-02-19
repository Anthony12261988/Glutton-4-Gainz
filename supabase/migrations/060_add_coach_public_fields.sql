-- Add public visibility and location fields to coach profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- Allow anonymous users to read public coach profiles
CREATE POLICY "Public COs visible to everyone"
  ON profiles FOR SELECT
  USING (role = 'coach' AND is_public = true);
