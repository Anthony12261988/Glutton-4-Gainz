-- Migration 037: Fix profiles RLS to include admin access
-- Previous migration (036) fixed recursion but removed admin access
-- This migration adds admin access back using a non-recursive approach

-- Drop existing policy
DROP POLICY IF EXISTS "Users can read profiles" ON profiles;

-- Create comprehensive SELECT policy that:
-- 1. Users can read their own profile (auth.uid() = id)
-- 2. Coaches can read profiles of users they coach (coach_id = auth.uid())
-- 3. Admins can read all profiles (using security definer function)

-- First, create a security definer function to check admin status
-- This avoids recursion by using a function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Now create the policy using the function
CREATE POLICY "Users can read profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id  -- Users can always read their own profile
    OR coach_id = auth.uid()  -- Coaches can read profiles of users they coach
    OR is_admin()  -- Admins can read all profiles
  );

-- Also fix coach_invites policies that might have similar issues
DROP POLICY IF EXISTS "Admins can view all invites" ON coach_invites;
DROP POLICY IF EXISTS "Admins can insert invites" ON coach_invites;
DROP POLICY IF EXISTS "Admins can update invites" ON coach_invites;

CREATE POLICY "Admins can view all invites" ON coach_invites
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can insert invites" ON coach_invites
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update invites" ON coach_invites
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
