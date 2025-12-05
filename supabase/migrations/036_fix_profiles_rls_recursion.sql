-- Migration 036: Fix profiles RLS infinite recursion
-- The "Coaches can read assigned users" policy caused infinite recursion
-- by querying profiles table within a profiles policy

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Coaches can read assigned users" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Create a single, non-recursive SELECT policy
-- This combines all read access rules without querying profiles table
CREATE POLICY "Users can read profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id  -- Users can always read their own profile
    OR coach_id = auth.uid()  -- Coaches can read profiles of users they coach
  );
