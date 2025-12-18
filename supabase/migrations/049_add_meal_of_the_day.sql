-- Migration 049: Add Meal of the Day feature
-- Creates featured_meals table to store daily featured recipes visible to all users

CREATE TABLE IF NOT EXISTS featured_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  featured_date DATE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Index for fast daily lookup
CREATE INDEX IF NOT EXISTS idx_featured_meals_date ON featured_meals(featured_date);
CREATE INDEX IF NOT EXISTS idx_featured_meals_recipe ON featured_meals(recipe_id);

-- Enable RLS
ALTER TABLE featured_meals ENABLE ROW LEVEL SECURITY;

-- Everyone can read featured meals (including free users)
CREATE POLICY "Anyone can view featured meals"
  ON featured_meals FOR SELECT
  TO authenticated
  USING (true);

-- Only admins and coaches can manage featured meals
CREATE POLICY "Admins and coaches can insert featured meals"
  ON featured_meals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach')
    )
  );

CREATE POLICY "Admins and coaches can update featured meals"
  ON featured_meals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach')
    )
  );

CREATE POLICY "Admins and coaches can delete featured meals"
  ON featured_meals FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach')
    )
  );

-- Add helpful comments
COMMENT ON TABLE featured_meals IS 'Daily featured recipe visible to all users including free recruits';
COMMENT ON COLUMN featured_meals.recipe_id IS 'Recipe to feature for this date';
COMMENT ON COLUMN featured_meals.featured_date IS 'Date this recipe is featured (one per day)';
COMMENT ON COLUMN featured_meals.created_by IS 'Admin/coach who set this featured meal';
