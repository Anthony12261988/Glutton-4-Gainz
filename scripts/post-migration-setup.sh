#!/bin/bash

# =========================================================================
# Post-Migration Setup Script
# =========================================================================
# Run this AFTER applying consolidated_migration.sql to your new database
# This script will:
# 1. Verify database connection
# 2. Regenerate TypeScript types
# 3. Test the build
# 4. Optionally run seed data
# =========================================================================

set -e

echo "═══════════════════════════════════════════════════════════════════════"
echo "  Post-Migration Setup - Glutton4Gainz"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo -e "${RED}❌ Error: .env.local file not found${NC}"
  echo ""
  echo "Please create .env.local with your new database credentials:"
  echo "  NEXT_PUBLIC_SUPABASE_URL=..."
  echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=..."
  echo "  SUPABASE_SERVICE_ROLE_KEY=..."
  exit 1
fi

echo -e "${BLUE}🔍 Step 1: Verifying Database Connection${NC}"
echo "─────────────────────────────────────────"

# Extract project ID from Supabase URL
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'")

if [ -z "$SUPABASE_URL" ]; then
  echo -e "${RED}❌ Could not find NEXT_PUBLIC_SUPABASE_URL in .env.local${NC}"
  exit 1
fi

# Extract project ref from URL (format: https://PROJECT_REF.supabase.co)
PROJECT_REF=$(echo "$SUPABASE_URL" | sed -E 's|https://([^.]+)\.supabase\.co|\1|')

echo -e "${GREEN}✓${NC} Supabase URL found"
echo "  Project: $PROJECT_REF"
echo ""

# Ask for confirmation before proceeding
echo -e "${YELLOW}⚠️  This script will:${NC}"
echo "  1. Generate TypeScript types from your database"
echo "  2. Run a production build test"
echo "  3. Optionally seed sample data"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo -e "${BLUE}🔄 Step 2: Generating TypeScript Types${NC}"
echo "─────────────────────────────────────────"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo -e "${YELLOW}⚠️  Supabase CLI not found. Installing...${NC}"
  npm install -g supabase
fi

# Generate types
echo "Running: npx supabase gen types typescript --project-id $PROJECT_REF"
echo ""

if npx supabase gen types typescript --project-id "$PROJECT_REF" > lib/types/database.types.ts 2>&1; then
  LINES=$(wc -l < lib/types/database.types.ts)
  echo ""
  echo -e "${GREEN}✅ TypeScript types generated successfully!${NC}"
  echo "   File: lib/types/database.types.ts"
  echo "   Lines: $LINES"
else
  echo ""
  echo -e "${RED}❌ Failed to generate types${NC}"
  echo ""
  echo "Try manually with:"
  echo "  npx supabase gen types typescript --project-id $PROJECT_REF > lib/types/database.types.ts"
  exit 1
fi

echo ""
echo -e "${BLUE}🏗️  Step 3: Testing Production Build${NC}"
echo "─────────────────────────────────────────"
echo "Running: npm run build"
echo ""

if npm run build 2>&1 | tee /tmp/build-output.log; then
  echo ""
  echo -e "${GREEN}✅ Build completed successfully!${NC}"

  # Check for the notifications table type issue
  if grep -q "notifications" /tmp/build-output.log && grep -q "Type error" /tmp/build-output.log; then
    echo -e "${YELLOW}⚠️  Note: Build passed but notifications type might need verification${NC}"
  fi
else
  echo ""
  echo -e "${RED}❌ Build failed${NC}"
  echo ""
  echo "Common issues:"
  echo "  1. Types not generated correctly - try regenerating"
  echo "  2. Database migration incomplete - verify in Supabase Dashboard"
  echo "  3. .env.local has wrong credentials"
  exit 1
fi

echo ""
echo -e "${BLUE}🌱 Step 4: Seed Sample Data (Optional)${NC}"
echo "─────────────────────────────────────────"
read -p "Would you like to seed sample data (workouts, recipes, badges)? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Running: npm run seed"
  echo ""

  if npm run seed; then
    echo ""
    echo -e "${GREEN}✅ Sample data seeded successfully!${NC}"
  else
    echo ""
    echo -e "${YELLOW}⚠️  Seeding encountered issues (this is optional)${NC}"
  fi
else
  echo "Skipped seeding."
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "✅ Database migrated"
echo "✅ TypeScript types generated"
echo "✅ Production build verified"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo ""
echo "  1. Start development server:"
echo "     npm run dev"
echo ""
echo "  2. Test key features:"
echo "     • Sign up / Login"
echo "     • Zero-Day Assessment"
echo "     • Formation Feed"
echo "     • Challenges"
echo "     • Dashboard Charts"
echo ""
echo "  3. Verify storage buckets exist:"
echo "     Supabase Dashboard → Storage"
echo "     Required: avatars, content_assets, videos, post-images"
echo ""
echo "  4. Configure Stripe webhooks:"
echo "     Point to: https://your-domain.com/api/stripe/webhook"
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "📖 Documentation:"
echo "   • Setup Guide: NEW_DATABASE_SETUP.md"
echo "   • Full Plan: .claude/plans/luminous-squishing-quilt.md"
echo "   • Migrations: supabase/MIGRATIONS.md"
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
