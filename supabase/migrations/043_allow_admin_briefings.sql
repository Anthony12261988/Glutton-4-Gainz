-- Migration 043: Allow admins to manage daily briefings
-- Admins should be able to create and update briefings, not just coaches

-- Drop existing policies
DROP POLICY IF EXISTS "Coaches can insert" ON daily_briefings;
DROP POLICY IF EXISTS "Coaches can update" ON daily_briefings;

-- Create new policies that allow both coaches and admins
CREATE POLICY "Coaches and admins can insert"
  ON daily_briefings FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('coach', 'admin')
    )
  );

CREATE POLICY "Coaches and admins can update"
  ON daily_briefings FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('coach', 'admin')
    )
  );

-- Also allow coaches and admins to delete briefings
CREATE POLICY "Coaches and admins can delete"
  ON daily_briefings FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('coach', 'admin')
    )
  );


