-- Migration 044: Add freemium fields to recipes
-- This enables proper free vs premium recipe access control

-- Add is_standard_issue flag to mark recipes available to free tier users
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS is_standard_issue BOOLEAN DEFAULT false;

-- Add min_tier to specify minimum tier required to access a recipe
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS min_tier TEXT DEFAULT '.223';

-- Add constraint to ensure min_tier is valid
ALTER TABLE recipes
ADD CONSTRAINT check_min_tier
CHECK (min_tier IN ('.223', '.556', '.762', '.50 Cal'));

-- Create index for better query performance on freemium filtering
CREATE INDEX IF NOT EXISTS idx_recipes_standard_issue ON recipes(is_standard_issue);
CREATE INDEX IF NOT EXISTS idx_recipes_min_tier ON recipes(min_tier);

-- Add comments for documentation
COMMENT ON COLUMN recipes.is_standard_issue IS 'TRUE if recipe is available to free tier users (Recruits with .223 tier)';
COMMENT ON COLUMN recipes.min_tier IS 'Minimum tier required to access this recipe';
