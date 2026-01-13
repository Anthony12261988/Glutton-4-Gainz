#!/bin/bash

# =========================================================================
# Setup New Database - Glutton4Gainz
# =========================================================================
# This script creates a consolidated SQL file with ALL migrations
# and provides instructions for applying it to your new Supabase database
# =========================================================================

set -e  # Exit on error

echo "═══════════════════════════════════════════════════════════════════════"
echo "  Glutton4Gainz - New Database Setup Script"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Output file
OUTPUT_FILE="supabase/consolidated_migration.sql"

echo -e "${BLUE}📦 Creating consolidated migration file...${NC}"
echo ""

# Create header
cat > "$OUTPUT_FILE" << 'EOF'
-- =========================================================================
-- GLUTTON4GAINZ - CONSOLIDATED DATABASE MIGRATION
-- =========================================================================
-- This file contains ALL database migrations consolidated into one script
-- Run this on a fresh Supabase database to set up the complete schema
--
-- Generated: $(date)
-- Total Migrations: 34 files (000 + 026-058)
-- =========================================================================

-- Start transaction
BEGIN;

EOF

# Array of migration files in order
MIGRATIONS=(
  "000_initial_schema.sql"
  "026_create_daily_briefing.sql"
  "027_update_meal_plan_rls.sql"
  "028_add_stripe_customer_id.sql"
  "029_add_performance_indexes.sql"
  "030_add_push_subscriptions.sql"
  "031_add_coach_invites_and_admin_controls.sql"
  "032_create_personal_records.sql"
  "033_add_fitness_dossier_fields.sql"
  "034_add_intro_video_watched.sql"
  "035_videos_storage_bucket.sql"
  "036_fix_profiles_rls_recursion.sql"
  "037_fix_profiles_admin_access.sql"
  "038_add_coach_profile_fields.sql"
  "040_allow_admin_content_management.sql"
  "041_allow_admin_meal_plans.sql"
  "042_add_onboarding_completed.sql"
  "043_allow_admin_briefings.sql"
  "044_add_recipe_freemium_fields.sql"
  "046_add_is_standard_issue_to_recipes.sql"
  "046_fix_recipes_rls_freemium.sql"
  "046_seed_standard_issue_recipes.sql"
  "047_create_zero_day_tests.sql"
  "048_fix_briefings_read_policy.sql"
  "049_add_meal_of_the_day.sql"
  "050_remove_tier_based_recipe_access.sql"
  "051_fix_message_trigger.sql"
  "052_create_formation_posts.sql"
  "053_formation_rls_policies.sql"
  "054_meal_planner_enhancements.sql"
  "055_gamification_challenges.sql"
  "056_seed_badge_definitions.sql"
  "057_challenge_triggers.sql"
  "058_create_notifications.sql"
)

# Append each migration
for migration in "${MIGRATIONS[@]}"; do
  migration_file="supabase/migrations/$migration"

  if [ -f "$migration_file" ]; then
    echo -e "${GREEN}✓${NC} Adding: $migration"

    # Add separator and migration to output
    cat >> "$OUTPUT_FILE" << EOF

-- =========================================================================
-- MIGRATION: $migration
-- =========================================================================

EOF
    cat "$migration_file" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
  else
    echo -e "${YELLOW}⚠${NC}  Skipping (not found): $migration"
  fi
done

# Add schema_migrations tracking
cat >> "$OUTPUT_FILE" << 'EOF'

-- =========================================================================
-- MIGRATION TRACKING TABLE
-- =========================================================================

-- Create schema_migrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  execution_time_ms INTEGER,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'pending')),
  executed_by TEXT,
  notes TEXT
);

-- Record all migrations as executed
INSERT INTO schema_migrations (version, name, status, executed_at)
VALUES
  ('000', 'initial_schema', 'success', NOW()),
  ('026', 'create_daily_briefing', 'success', NOW()),
  ('027', 'update_meal_plan_rls', 'success', NOW()),
  ('028', 'add_stripe_customer_id', 'success', NOW()),
  ('029', 'add_performance_indexes', 'success', NOW()),
  ('030', 'add_push_subscriptions', 'success', NOW()),
  ('031', 'add_coach_invites_and_admin_controls', 'success', NOW()),
  ('032', 'create_personal_records', 'success', NOW()),
  ('033', 'add_fitness_dossier_fields', 'success', NOW()),
  ('034', 'add_intro_video_watched', 'success', NOW()),
  ('035', 'videos_storage_bucket', 'success', NOW()),
  ('036', 'fix_profiles_rls_recursion', 'success', NOW()),
  ('037', 'fix_profiles_admin_access', 'success', NOW()),
  ('038', 'add_coach_profile_fields', 'success', NOW()),
  ('040', 'allow_admin_content_management', 'success', NOW()),
  ('041', 'allow_admin_meal_plans', 'success', NOW()),
  ('042', 'add_onboarding_completed', 'success', NOW()),
  ('043', 'allow_admin_briefings', 'success', NOW()),
  ('044', 'add_recipe_freemium_fields', 'success', NOW()),
  ('046', 'add_is_standard_issue_to_recipes', 'success', NOW()),
  ('047', 'create_zero_day_tests', 'success', NOW()),
  ('048', 'fix_briefings_read_policy', 'success', NOW()),
  ('049', 'add_meal_of_the_day', 'success', NOW()),
  ('050', 'remove_tier_based_recipe_access', 'success', NOW()),
  ('051', 'fix_message_trigger', 'success', NOW()),
  ('052', 'create_formation_posts', 'success', NOW()),
  ('053', 'formation_rls_policies', 'success', NOW()),
  ('054', 'meal_planner_enhancements', 'success', NOW()),
  ('055', 'gamification_challenges', 'success', NOW()),
  ('056', 'seed_badge_definitions', 'success', NOW()),
  ('057', 'challenge_triggers', 'success', NOW()),
  ('058', 'create_notifications', 'success', NOW())
ON CONFLICT (version) DO NOTHING;

-- Commit transaction
COMMIT;

-- =========================================================================
-- SETUP COMPLETE
-- =========================================================================
-- All migrations have been applied successfully!
--
-- Next steps:
-- 1. Verify all tables were created
-- 2. Run seed data scripts if needed
-- 3. Generate TypeScript types
-- =========================================================================
EOF

echo ""
echo -e "${GREEN}✅ Consolidated migration file created!${NC}"
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo -e "${BLUE}📄 File Location:${NC}"
echo "   $OUTPUT_FILE"
echo ""
echo -e "${BLUE}📋 How to Apply to New Supabase Database:${NC}"
echo ""
echo "  Method 1: Supabase Dashboard (Recommended)"
echo "  ──────────────────────────────────────────"
echo "  1. Go to: https://supabase.com/dashboard"
echo "  2. Create or select your new project"
echo "  3. Go to SQL Editor"
echo "  4. Copy the contents of: $OUTPUT_FILE"
echo "  5. Paste into SQL Editor"
echo "  6. Click 'Run' to execute"
echo ""
echo "  Method 2: Supabase CLI (if linked)"
echo "  ──────────────────────────────────────────"
echo "  1. Link to new project:"
echo "     supabase link --project-ref YOUR_NEW_PROJECT_REF"
echo "  2. Run migrations:"
echo "     supabase db push"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "  - This will create ALL tables, functions, triggers, and policies"
echo "  - Run this on a FRESH/EMPTY database"
echo "  - The transaction will roll back if any errors occur"
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo -e "${BLUE}🔄 After Migration:${NC}"
echo ""
echo "  1. Update .env.local with new database credentials:"
echo "     NEXT_PUBLIC_SUPABASE_URL=your-new-project-url"
echo "     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key"
echo "     SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key"
echo ""
echo "  2. Generate TypeScript types:"
echo "     npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types/database.types.ts"
echo ""
echo "  3. Run seed data (optional):"
echo "     npm run seed"
echo ""
echo "  4. Test the build:"
echo "     npm run build"
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
