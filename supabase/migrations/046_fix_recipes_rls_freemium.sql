-- Migration 045: Fix recipes RLS policy for freemium model
-- Enforces proper access control: free users see only standard issue recipes

-- Drop the overly permissive policy that allows all authenticated users to see all recipes
DROP POLICY IF EXISTS "Authenticated users can read recipes" ON recipes;

-- Create new policy that enforces freemium access control
CREATE POLICY "Users can read available recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (
    -- Coaches and admins can see all recipes
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('coach', 'admin')
    )
    OR
    -- Soldiers (paid users) can see all recipes
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'soldier'
    )
    OR
    -- Free users (role: 'user') with .223 tier can only see standard issue recipes
    (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'user'
        AND tier = '.223'
      )
      AND is_standard_issue = true
    )
    OR
    -- Free users with higher tiers (.556, .762, .50 Cal) earned via Zero Day can see all recipes
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'user'
      AND tier IN ('.556', '.762', '.50 Cal')
    )
  );

COMMENT ON POLICY "Users can read available recipes" ON recipes IS 'Enforces freemium model: free .223 users see standard issue only, premium users see all';
