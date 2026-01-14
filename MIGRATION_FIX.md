# Migration SQL Syntax Fixes

## Issues Fixed

### 1. CREATE POLICY IF NOT EXISTS Syntax Error
**Error:**
```
ERROR: 42601: syntax error at or near "NOT"
LINE 319: CREATE POLICY IF NOT EXISTS "Users can read own profile"
```

**Cause**: `CREATE POLICY IF NOT EXISTS` is not supported in PostgreSQL versions before 15.

**Fix**: Replaced all occurrences with the compatible pattern:
```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
CREATE POLICY "policy_name"
  ON table_name FOR ...
```

**Result**: Fixed 42 CREATE POLICY statements across all migrations

---

### 2. Storage Objects Permission Error
**Error:**
```
ERROR: 42501: must be owner of table objects
```

**Cause**: Storage policies on `storage.objects` require elevated privileges that are not available in the SQL Editor.

**Fix**:
- Commented out all `storage.objects` policy operations
- Created separate setup guide for manual configuration
- Added notes in migration file directing to Dashboard setup

**Result**: Storage buckets are created, but policies must be configured manually via Supabase Dashboard

---

## Changes Made

1. **Fixed 42 CREATE POLICY IF NOT EXISTS statements** across all migrations
2. **Commented out storage policy operations** (DROP/CREATE on storage.objects)
3. **Commented out ALTER TABLE storage.objects** (already enabled by default)
4. **Added setup instructions** for manual storage policy configuration

## Files Modified

- `supabase/consolidated_migration.sql` - Updated with PostgreSQL-compatible syntax
- `STORAGE_BUCKET_SETUP.md` - Created manual setup guide for storage policies
- `MIGRATION_FIX.md` - Updated documentation (this file)

## Migration Process

### Step 1: Run Main Migration
Run `supabase/consolidated_migration.sql` in Supabase SQL Editor. This will:
- ✅ Create all tables, indexes, and database functions
- ✅ Set up RLS policies for database tables
- ✅ Create 3 storage buckets (avatars, content_assets, videos)
- ⚠️ Skip storage object policies (requires manual setup)

### Step 2: Configure Storage Policies
Follow the guide in `STORAGE_BUCKET_SETUP.md` to set up storage access control via:
- **Option A**: Supabase Dashboard → Storage → Policies (recommended)
- **Option B**: Run the quick SQL script provided in the guide

## Storage Buckets Created

| Bucket | Purpose | Size Limit | Public Read |
|--------|---------|------------|-------------|
| `avatars` | User profile pictures | 5MB | Yes |
| `content_assets` | Recipe images, badges | 10MB | Yes |
| `videos` | Intro videos, demos | 100MB | Yes |

## Verification

### Database Tables
```sql
SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';
-- Should return ~35 tables
```

### Database Policies
```sql
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
-- Should return ~80+ policies
```

### Storage Buckets
```sql
SELECT id, name, public FROM storage.buckets;
-- Should show: avatars, content_assets, videos
```

### Storage Policies (After Manual Setup)
```sql
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage';
-- Should return 12 policies (4 per bucket)
```

## Compatibility
The migration file is now compatible with:
- ✅ PostgreSQL 13
- ✅ PostgreSQL 14
- ✅ PostgreSQL 15+
- ✅ Supabase hosted instances

---
**Date**: January 14, 2026
**Status**: ✅ Fixed and ready to apply
**Next Step**: Run migration, then configure storage policies
