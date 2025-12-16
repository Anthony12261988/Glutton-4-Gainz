-- Migration 048: Fix daily briefings read access
-- Ensure all authenticated users can read briefings

-- Drop and recreate the public read policy to ensure it's active
DROP POLICY IF EXISTS "Public read access" ON daily_briefings;
DROP POLICY IF EXISTS "Authenticated users can read" ON daily_briefings;

-- Create policy allowing all authenticated users to read briefings
CREATE POLICY "Authenticated users can read briefings"
  ON daily_briefings FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON POLICY "Authenticated users can read briefings" ON daily_briefings IS 'All authenticated users can view active briefings';
