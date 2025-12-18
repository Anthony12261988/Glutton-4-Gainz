-- Migration 050: Remove tier-based recipe access
-- Updates RLS policy to enforce strict role-based access
-- Premium features now require Soldier role (payment only), NOT tier

-- Drop old policy that allows tier-based access
DROP POLICY IF EXISTS "Users can read available recipes" ON recipes;

-- Create new policy: ONLY role-based access
CREATE POLICY "Role-based recipe access"
  ON recipes FOR SELECT
  TO authenticated
  USING (
    -- Admins and coaches see all recipes
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('coach', 'admin')
    )
    OR
    -- Soldiers (paid users) see all recipes
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'soldier'
    )
    OR
    -- Free users (role: 'user') ONLY see standard issue recipes
    -- Regardless of their tier (.223, .556, .762, .50 Cal)
    (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'user'
      )
      AND is_standard_issue = true
    )
  );

COMMENT ON POLICY "Role-based recipe access" ON recipes IS
  'Free recruits (role: user) see only standard_issue recipes. Premium access requires Soldier role (payment), NOT tier.';
