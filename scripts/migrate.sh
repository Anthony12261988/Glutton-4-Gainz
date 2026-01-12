#!/bin/bash

# Migration Wrapper Script
# Uses Supabase CLI to execute migrations
#
# Usage:
#   ./scripts/migrate.sh [dev|staging|prod] [--dry-run]

set -e

ENV=${1:-dev}
DRY_RUN=${2:-}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    error "Supabase CLI is not installed"
    log "Install it with: npm install -g supabase"
    log "Or: brew install supabase/tap/supabase"
    exit 1
fi

log "🚀 Starting migrations for environment: $ENV"

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    warn "Project not linked to Supabase"
    log "Run: supabase link --project-ref <your-project-ref>"
    log "Find project-ref in your Supabase URL: https://[project-ref].supabase.co"
    exit 1
fi

if [ "$DRY_RUN" = "--dry-run" ]; then
    warn "DRY RUN MODE - No changes will be made"
    log "Previewing migrations that would be applied..."
    supabase db diff --schema public
else
    log "Pushing migrations to Supabase..."
    supabase db push
    
    if [ $? -eq 0 ]; then
        success "Migrations applied successfully!"
    else
        error "Migration failed"
        exit 1
    fi
fi

success "Migration process completed"
