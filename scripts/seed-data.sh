#!/bin/bash

# Seed Data Script for Glutton4Gainz
# This script seeds the database with test data including admin user setup
#
# Usage:
#   ./scripts/seed-data.sh
#   OR
#   bash scripts/seed-data.sh

set -e

echo "=========================================="
echo "G4G Seed Data Script"
echo "=========================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    echo "Please create .env.local with your Supabase credentials"
    exit 1
fi

# Load environment variables
source .env.local

# Check required variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo "❌ Error: Missing required environment variables"
    echo "Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_DB_PASSWORD"
    exit 1
fi

# Extract database connection details from Supabase URL
# Supabase URL format: https://<project-ref>.supabase.co
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's|https://||' | sed 's|.supabase.co||')
DB_HOST="${PROJECT_REF}.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

echo "📦 Connecting to database..."
echo "Host: $DB_HOST"
echo "Database: $DB_NAME"
echo ""

# Run the seed script
echo "🌱 Seeding database..."
PGPASSWORD="$SUPABASE_DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -f supabase/seed-admin-data.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Seed data deployed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Log in as rajeshsunny@gmail.com"
    echo "2. Visit /dashboard to see Motivational Corner"
    echo "3. Visit /barracks/content/briefing to manage briefings"
else
    echo ""
    echo "❌ Error: Failed to seed database"
    exit 1
fi


