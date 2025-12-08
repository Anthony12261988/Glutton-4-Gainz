-- Migration 040: Allow admins to manage content (workouts, recipes)
-- This updates the RLS policies to allow both coach AND admin roles
-- Coaches can only delete content they created, admins can delete anything

-- ============================================================================
-- ADD created_by COLUMNS
-- ============================================================================

-- Add created_by to workouts table
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add created_by to recipes table  
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_workouts_created_by ON workouts(created_by);
CREATE INDEX IF NOT EXISTS idx_recipes_created_by ON recipes(created_by);

-- ============================================================================
-- WORKOUTS TABLE RLS - Add admin access
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Coaches can insert workouts" ON workouts;
DROP POLICY IF EXISTS "Coaches can update workouts" ON workouts;
DROP POLICY IF EXISTS "Coaches can delete workouts" ON workouts;

-- Recreate with admin access
-- Insert: coaches and admins can insert, and we set created_by to their user id
CREATE POLICY "Coaches and admins can insert workouts"
  ON workouts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('coach', 'admin')
    )
  );

-- Update: coaches can update their own, admins can update any
CREATE POLICY "Coaches and admins can update workouts"
  ON workouts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (
        role = 'admin'
        OR (role = 'coach' AND workouts.created_by = auth.uid())
        OR (role = 'coach' AND workouts.created_by IS NULL) -- Allow updating legacy content
      )
    )
  );

-- Delete: coaches can delete their own, admins can delete any
CREATE POLICY "Coaches and admins can delete workouts"
  ON workouts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (
        role = 'admin'
        OR (role = 'coach' AND workouts.created_by = auth.uid())
        OR (role = 'coach' AND workouts.created_by IS NULL) -- Allow deleting legacy content
      )
    )
  );

-- ============================================================================
-- RECIPES TABLE RLS - Add admin access
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Coaches can insert recipes" ON recipes;
DROP POLICY IF EXISTS "Coaches can update recipes" ON recipes;
DROP POLICY IF EXISTS "Coaches can delete recipes" ON recipes;

-- Recreate with admin access
-- Insert: coaches and admins can insert
CREATE POLICY "Coaches and admins can insert recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('coach', 'admin')
    )
  );

-- Update: coaches can update their own, admins can update any
CREATE POLICY "Coaches and admins can update recipes"
  ON recipes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (
        role = 'admin'
        OR (role = 'coach' AND recipes.created_by = auth.uid())
        OR (role = 'coach' AND recipes.created_by IS NULL) -- Allow updating legacy content
      )
    )
  );

-- Delete: coaches can delete their own, admins can delete any
CREATE POLICY "Coaches and admins can delete recipes"
  ON recipes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (
        role = 'admin'
        OR (role = 'coach' AND recipes.created_by = auth.uid())
        OR (role = 'coach' AND recipes.created_by IS NULL) -- Allow deleting legacy content
      )
    )
  );
