-- Migration 046: Add is_standard_issue column to recipes table
-- This column is used to distinguish standard issue recipes for freemium access control

ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS is_standard_issue boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN recipes.is_standard_issue IS 'Indicates if the recipe is standard issue (visible to free .223 tier users)';
