#!/bin/bash

# Production Environment Migration Script
# Executes migrations on production Supabase project
# Includes extra safety checks and confirmations

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

log() {
    echo -e "\033[0;36mℹ️  $1\033[0m"
}

success() {
    echo -e "\033[0;32m✅ $1\033[0m"
}

error() {
    echo -e "\033[0;31m❌ $1\033[0m"
}

warn() {
    echo -e "\033[1;33m⚠️  $1\033[0m"
}

log "🔧 Running migrations on PRODUCTION environment"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    error "Supabase CLI is not installed"
    log "Install it with: npm install -g supabase"
    exit 1
fi

# Check if logged in
if ! supabase projects list &> /dev/null; then
    warn "Not logged in to Supabase"
    log "Run: supabase login"
    exit 1
fi

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    warn "Project not linked to Supabase"
    log "Run: supabase link --project-ref <your-prod-project-ref>"
    exit 1
fi

# Strong confirmation for production
error "⚠️  ⚠️  ⚠️  PRODUCTION DATABASE ⚠️  ⚠️  ⚠️"
warn "This will modify the PRODUCTION database"
warn "Make sure you have:"
warn "  1. Tested migrations on staging"
warn "  2. Backed up the production database"
warn "  3. Reviewed all migration files"
echo ""
read -p "Type 'PRODUCTION' to confirm: " -r
echo
if [ "$REPLY" != "PRODUCTION" ]; then
    log "Migration cancelled"
    exit 0
fi

# Double confirmation
read -p "Are you absolutely sure? Type 'YES' to proceed: " -r
echo
if [ "$REPLY" != "YES" ]; then
    log "Migration cancelled"
    exit 0
fi

# Show what will be executed
log "Previewing migrations..."
supabase db diff --schema public

read -p "Apply these changes to PRODUCTION? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log "Migration cancelled"
    exit 0
fi

# Execute migrations
log "Pushing migrations to production..."
supabase db push

if [ $? -eq 0 ]; then
    success "Production migrations applied successfully!"
    log "Monitor your application for any issues"
else
    error "Migration failed"
    error "Check the error above and verify database state"
    exit 1
fi
