#!/bin/bash

# Staging Environment Migration Script
# Executes migrations on staging Supabase project

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

log "🔧 Running migrations on STAGING environment"

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
    log "Run: supabase link --project-ref <your-staging-project-ref>"
    exit 1
fi

# Strong confirmation for staging
warn "⚠️  WARNING: This will modify the STAGING database"
read -p "Are you sure you want to continue? Type 'STAGING' to confirm: " -r
echo
if [ "$REPLY" != "STAGING" ]; then
    log "Migration cancelled"
    exit 0
fi

# Execute migrations
log "Pushing migrations to staging..."
supabase db push

if [ $? -eq 0 ]; then
    success "Staging migrations applied successfully!"
else
    error "Migration failed"
    exit 1
fi
