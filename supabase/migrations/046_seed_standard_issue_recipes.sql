-- Migration 046: Mark standard issue recipes for free tier
-- These recipes are available to all users, including free tier (.223 Recruits)

-- Mark 5 basic, accessible recipes as standard issue
-- These are nutritious, simple meals suitable for beginners
UPDATE recipes
SET is_standard_issue = true
WHERE title IN (
  'COMBAT OATS',           -- Simple breakfast, easy to make
  'INFANTRY EGGS',         -- Basic protein breakfast
  'TACTICAL PROTEIN BOWL', -- Simple lunch/dinner
  'RECON RECOVERY SHAKE',  -- Post-workout recovery
  'WARRIOR WRAP'           -- Easy portable meal
);

-- All other recipes remain premium (is_standard_issue = false by default)
-- Premium recipes: RANGER BEEF STIR-FRY, SPECIAL FORCES SALMON, COMMANDO CHILI

-- Verify the update
DO $$
DECLARE
  standard_count INTEGER;
  premium_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO standard_count FROM recipes WHERE is_standard_issue = true;
  SELECT COUNT(*) INTO premium_count FROM recipes WHERE is_standard_issue = false;

  RAISE NOTICE 'Standard Issue Recipes: %', standard_count;
  RAISE NOTICE 'Premium Recipes: %', premium_count;

  IF standard_count < 5 THEN
    RAISE WARNING 'Expected at least 5 standard issue recipes, found %', standard_count;
  END IF;
END $$;
