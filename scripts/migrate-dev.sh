#!/bin/bash

# Development Environment Migration Script
# Executes migrations on development Supabase project

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

log "🔧 Running migrations on DEVELOPMENT environment"

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
    log "Run: supabase link --project-ref <your-dev-project-ref>"
    exit 1
fi

# Confirm execution
read -p "Apply migrations to DEVELOPMENT database? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log "Migration cancelled"
    exit 0
fi

# Execute migrations
log "Pushing migrations..."
supabase db push

if [ $? -eq 0 ]; then
    success "Development migrations applied successfully!"
else
    error "Migration failed"
    exit 1
fi
