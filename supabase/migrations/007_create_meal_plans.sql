-- Migration 007: Create meal_plans table
-- Assigns recipes to specific dates for weekly meal planning

CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  assigned_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One meal per user per day
  CONSTRAINT unique_user_meal_date UNIQUE (user_id, assigned_date)
);

-- Create indexes for performance
CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX idx_meal_plans_recipe_id ON meal_plans(recipe_id);
CREATE INDEX idx_meal_plans_assigned_date ON meal_plans(assigned_date);
CREATE INDEX idx_meal_plans_user_date ON meal_plans(user_id, assigned_date);

-- Add comments for documentation
COMMENT ON TABLE meal_plans IS 'User meal assignments for weekly planning (premium feature)';
COMMENT ON COLUMN meal_plans.assigned_date IS 'Date this meal is assigned to';
