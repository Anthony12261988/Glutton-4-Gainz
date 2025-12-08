-- Migration 041: Allow admins to manage meal plans
-- Adds admin role to meal_plans RLS policies

-- SELECT: soldier/coach/admin can read their own plans
DROP POLICY IF EXISTS "Users (soldier/coach) can read own meal plans" ON meal_plans;
CREATE POLICY "Users can read own meal plans"
  ON meal_plans FOR SELECT
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('soldier', 'coach', 'admin')
    )
  );

-- INSERT: soldier/coach/admin can insert own plans
DROP POLICY IF EXISTS "Users (soldier/coach) can insert own meal plans" ON meal_plans;
CREATE POLICY "Users can insert own meal plans"
  ON meal_plans FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('soldier', 'coach', 'admin')
    )
  );

-- UPDATE: soldier/coach/admin can update own plans
DROP POLICY IF EXISTS "Users (soldier/coach) can update own meal plans" ON meal_plans;
CREATE POLICY "Users can update own meal plans"
  ON meal_plans FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('soldier', 'coach', 'admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('soldier', 'coach', 'admin')
    )
  );

-- DELETE: soldier/coach/admin can delete own plans
DROP POLICY IF EXISTS "Users (soldier/coach) can delete own meal plans" ON meal_plans;
CREATE POLICY "Users can delete own meal plans"
  ON meal_plans FOR DELETE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('soldier', 'coach', 'admin')
    )
  );
