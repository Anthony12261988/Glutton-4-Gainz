# Database Migrations Guide

This document explains how to manage and execute database migrations for Glutton4Gainz.

## Overview

The project uses Supabase for database management. Migrations are SQL files that modify the database schema incrementally. We have:

- **Consolidated Initial Schema**: `000_initial_schema.sql` (combines migrations 001-012)
- **Incremental Migrations**: 026-058 (run after initial schema)
- **Migration Tracking**: `schema_migrations` table tracks executed migrations

## Migration Files

### Initial Schema (New Databases)

- `000_initial_schema.sql` - Complete initial schema (combines 001-012)
  - Use this for brand new database setups
  - Includes all core tables, functions, triggers, and RLS policies

### Individual Migrations (Reference)

- `001_create_profiles.sql` through `012_storage_buckets.sql`
  - Keep for reference and historical tracking
  - Use `000_initial_schema.sql` instead for new setups

### Incremental Migrations

- `026_create_daily_briefing.sql` through `058_create_notifications.sql`
  - Run these in order after initial schema
  - Each adds new features or modifies existing schema

## Migration Execution Methods

### Method 1: Supabase CLI (Recommended)

**Prerequisites:**
```bash
npm install -g supabase
supabase login
```

**Setup:**
```bash
# Link to your Supabase project
supabase link --project-ref <your-project-ref>
# Find project-ref in your Supabase URL: https://[project-ref].supabase.co
```

**Execute Migrations:**
```bash
# Development
npm run migrate:dev

# Staging
npm run migrate:staging

# Production
npm run migrate:prod
```

**Manual CLI Commands:**
```bash
# Push all migrations
supabase db push

# Check migration status
supabase migration list

# See what would change (dry run)
supabase db diff --schema public
```

### Method 2: Supabase Dashboard (Manual)

1. Go to Supabase Dashboard → **SQL Editor**
2. For new databases: Run `000_initial_schema.sql`
3. Then run migrations 026-058 in order
4. Each migration should be run in a separate query

**Note**: This method doesn't track migration status automatically.

### Method 3: Node.js Script (Status Check Only)

```bash
# Check which migrations have been executed
npm run migrate:status
```

**Note**: The Node.js script currently only checks status. Actual execution requires Supabase CLI.

## Migration Execution Order

### For New Databases

1. Run `000_initial_schema.sql` (or migrations 001-012 individually)
2. Run `026_create_daily_briefing.sql`
3. Continue with migrations 027-058 in numerical order

### For Existing Databases

1. Check current migration status: `npm run migrate:status`
2. Run any pending migrations in order
3. Start from the highest numbered migration you've already executed

## Environment-Specific Execution

### Development

```bash
npm run migrate:dev
```

- Requires confirmation prompt
- Uses development Supabase project
- Safe to run multiple times (idempotent migrations)

### Staging

```bash
npm run migrate:staging
```

- Requires typing "STAGING" to confirm
- Uses staging Supabase project
- Test migrations here before production

### Production

```bash
npm run migrate:prod
```

- Requires typing "PRODUCTION" and "YES" to confirm
- Shows preview of changes before applying
- **Always test on staging first!**

## Migration Status Tracking

The `schema_migrations` table tracks which migrations have been executed:

```sql
SELECT * FROM schema_migrations 
ORDER BY executed_at DESC;
```

**Check Status:**
```bash
npm run migrate:status
```

This shows:
- ✅ Executed migrations (with timestamp)
- ⏳ Pending migrations
- ❌ Failed migrations (if any)

## Creating New Migrations

### Naming Convention

- Use sequential numbers: `059_description.sql`, `060_description.sql`
- Use descriptive names: `059_add_feature_name.sql`
- Always increment from the highest existing number

### Migration Template

```sql
-- Migration 059: Description of changes
-- Date: YYYY-MM-DD
-- Purpose: Brief description

-- Your SQL changes here
CREATE TABLE IF NOT EXISTS new_table (
  -- table definition
);

-- Add comments
COMMENT ON TABLE new_table IS 'Description';
```

### Best Practices

1. **Use IF NOT EXISTS**: Prevents errors if migration runs twice
   ```sql
   CREATE TABLE IF NOT EXISTS ...
   CREATE INDEX IF NOT EXISTS ...
   CREATE POLICY IF NOT EXISTS ...
   ```

2. **Idempotent Operations**: Migrations should be safe to run multiple times
   ```sql
   INSERT INTO ... ON CONFLICT DO NOTHING;
   ```

3. **Add Comments**: Document what each migration does
   ```sql
   COMMENT ON TABLE ... IS 'Description';
   ```

4. **Test First**: Always test migrations on development/staging

5. **Backup Production**: Always backup production database before migrations

## Troubleshooting

### Migration Already Applied

**Error**: `relation already exists` or `policy already exists`

**Solution**: This is normal if migration was already run. The migration is idempotent and safe to ignore.

### Migration Failed

**Check Status:**
```bash
npm run migrate:status
```

**View Error:**
```sql
SELECT * FROM schema_migrations 
WHERE status = 'failed' 
ORDER BY executed_at DESC;
```

**Fix:**
1. Identify the failed migration
2. Fix the SQL issue
3. Manually mark as failed in `schema_migrations` table
4. Re-run the migration

### Project Not Linked

**Error**: `Project not linked to Supabase`

**Solution:**
```bash
supabase link --project-ref <your-project-ref>
```

### CLI Not Installed

**Error**: `Supabase CLI is not installed`

**Solution:**
```bash
npm install -g supabase
# Or
brew install supabase/tap/supabase
```

### Migration Order Issues

**Error**: Migration fails because dependency doesn't exist

**Solution**: Ensure migrations are run in numerical order. Check that all previous migrations have been executed.

## Migration Rollback

**Note**: Supabase migrations are forward-only. To rollback:

1. Create a new migration that reverses the changes
2. Test thoroughly on staging
3. Apply to production

**Example Rollback Migration:**
```sql
-- Migration 060: Rollback feature X
DROP TABLE IF EXISTS feature_x_table;
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Run Migrations

on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: supabase/setup-cli@v1
      - run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
      - run: supabase db push
```

## Migration Checklist

Before running migrations on production:

- [ ] All migrations tested on development
- [ ] All migrations tested on staging
- [ ] Database backup created
- [ ] Migration order verified
- [ ] No breaking changes without data migration
- [ ] Rollback plan prepared
- [ ] Team notified of migration window
- [ ] Monitoring in place

## File Structure

```
supabase/
├── migrations/
│   ├── 000_initial_schema.sql      (Consolidated initial schema)
│   ├── 001_create_profiles.sql     (Reference - use 000 instead)
│   ├── ...
│   ├── 012_storage_buckets.sql     (Reference - use 000 instead)
│   ├── 026_create_daily_briefing.sql
│   ├── ...
│   ├── 058_create_notifications.sql
│   └── schema_migrations.sql       (Migration tracking table)
├── MIGRATIONS.md                    (This file)
└── README.md                        (General Supabase setup)

scripts/
├── migrate.sh                       (Generic migration wrapper)
├── migrate-dev.sh                   (Development migrations)
├── migrate-staging.sh               (Staging migrations)
├── migrate-prod.sh                 (Production migrations)
├── run-migrations.js                (Node.js status checker)
└── check-migration-status.js        (Status report)
```

## Quick Reference

```bash
# Check migration status
npm run migrate:status

# Run on development
npm run migrate:dev

# Run on staging
npm run migrate:staging

# Run on production
npm run migrate:prod

# List migrations (Supabase CLI)
supabase migration list

# Preview changes
supabase db diff --schema public
```

## Support

- [Supabase CLI Docs](https://supabase.com/docs/reference/cli)
- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL Migration Best Practices](https://www.postgresql.org/docs/current/ddl-alter.html)

---

**Last Updated**: January 2025
