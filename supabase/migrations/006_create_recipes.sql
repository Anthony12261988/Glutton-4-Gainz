-- Migration 006: Create recipes table
-- Stores meal recipes for the nutrition planner (premium feature)

CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT,
  calories INTEGER NOT NULL CHECK (calories >= 0),
  protein INTEGER NOT NULL CHECK (protein >= 0),
  carbs INTEGER NOT NULL CHECK (carbs >= 0),
  fat INTEGER NOT NULL CHECK (fat >= 0),
  instructions TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_recipes_title ON recipes(title);
CREATE INDEX idx_recipes_created_at ON recipes(created_at);

-- Create trigger to auto-update updated_at timestamp
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE recipes IS 'Meal recipes for nutrition planner (premium feature)';
COMMENT ON COLUMN recipes.calories IS 'Total calories per serving';
COMMENT ON COLUMN recipes.protein IS 'Protein in grams per serving';
COMMENT ON COLUMN recipes.carbs IS 'Carbohydrates in grams per serving';
COMMENT ON COLUMN recipes.fat IS 'Fat in grams per serving';
