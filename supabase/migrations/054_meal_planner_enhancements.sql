-- Migration 054: Enhanced Meal Planner Tables
-- Macro tracking, templates, shopping lists, and multi-meal support

-- Daily macros tracking
CREATE TABLE IF NOT EXISTS daily_macros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  target_calories INTEGER,
  target_protein INTEGER,
  target_carbs INTEGER,
  target_fat INTEGER,
  actual_calories INTEGER DEFAULT 0,
  actual_protein INTEGER DEFAULT 0,
  actual_carbs INTEGER DEFAULT 0,
  actual_fat INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Meal templates
CREATE TABLE IF NOT EXISTS meal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Template meals (junction table)
CREATE TABLE IF NOT EXISTS template_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES meal_templates(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  day_offset INTEGER NOT NULL DEFAULT 0,
  meal_number INTEGER NOT NULL DEFAULT 1 CHECK (meal_number >= 1 AND meal_number <= 6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(template_id, day_offset, meal_number)
);

-- Shopping lists
CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  ingredients JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Extend meal_plans table for multi-meal support
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS meal_number INTEGER DEFAULT 1 CHECK (meal_number >= 1 AND meal_number <= 6);
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS notes TEXT;

-- Drop old unique constraint if exists
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_user_id_assigned_date_key;

-- Add new unique constraint for user + date + meal number
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'meal_plans_unique_meal'
  ) THEN
    ALTER TABLE meal_plans
    ADD CONSTRAINT meal_plans_unique_meal
    UNIQUE (user_id, assigned_date, meal_number);
  END IF;
END $$;

-- Extend recipes table for ingredients and timing
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS ingredients JSONB DEFAULT '[]';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS prep_time_minutes INTEGER;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cook_time_minutes INTEGER;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_macros_user_date ON daily_macros(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_meal_templates_user ON meal_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_templates_public ON meal_templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user ON shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_meal_number ON meal_plans(meal_number);

-- RLS policies for daily_macros
ALTER TABLE daily_macros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own macros" ON daily_macros;
CREATE POLICY "Users can manage own macros" ON daily_macros
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- RLS policies for meal_templates
ALTER TABLE meal_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view public templates" ON meal_templates;
CREATE POLICY "Users can view public templates" ON meal_templates
  FOR SELECT TO authenticated USING (is_public = true OR auth.uid() = user_id OR auth.uid() = coach_id);

DROP POLICY IF EXISTS "Users can manage own templates" ON meal_templates;
CREATE POLICY "Users can manage own templates" ON meal_templates
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- RLS policies for template_meals
ALTER TABLE template_meals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view template meals" ON template_meals;
CREATE POLICY "Users can view template meals" ON template_meals
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM meal_templates WHERE id = template_id AND (is_public = true OR user_id = auth.uid() OR coach_id = auth.uid()))
  );

-- RLS policies for shopping_lists
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own shopping lists" ON shopping_lists;
CREATE POLICY "Users can manage own shopping lists" ON shopping_lists
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE daily_macros IS 'Daily macro targets and actuals for users';
COMMENT ON TABLE meal_templates IS 'Reusable meal plan templates';
COMMENT ON TABLE template_meals IS 'Meals within templates';
COMMENT ON TABLE shopping_lists IS 'Auto-generated shopping lists from meal plans';
