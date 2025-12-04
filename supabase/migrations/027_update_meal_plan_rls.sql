-- Tighten meal_plans RLS to align with premium access (Soldier/Coach only)
-- Adds role check to existing CRUD policies so recruits cannot access meal plans

-- SELECT: only soldier/coach can read their own plans
DROP POLICY IF EXISTS "Users can read own meal plans" ON meal_plans;
CREATE POLICY "Users (soldier/coach) can read own meal plans"
  ON meal_plans FOR SELECT
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('soldier', 'coach')
    )
  );

-- INSERT
DROP POLICY IF EXISTS "Users can insert own meal plans" ON meal_plans;
CREATE POLICY "Users (soldier/coach) can insert own meal plans"
  ON meal_plans FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('soldier', 'coach')
    )
  );

-- UPDATE
DROP POLICY IF EXISTS "Users can update own meal plans" ON meal_plans;
CREATE POLICY "Users (soldier/coach) can update own meal plans"
  ON meal_plans FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('soldier', 'coach')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('soldier', 'coach')
    )
  );

-- DELETE
DROP POLICY IF EXISTS "Users can delete own meal plans" ON meal_plans;
CREATE POLICY "Users (soldier/coach) can delete own meal plans"
  ON meal_plans FOR DELETE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('soldier', 'coach')
    )
  );
