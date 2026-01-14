# Migration SQL Syntax Fix

## Issue
The consolidated migration file was using `CREATE POLICY IF NOT EXISTS` syntax, which is not supported in PostgreSQL versions before 15. This caused syntax errors when running the migration.

## Error Message
```
ERROR: 42601: syntax error at or near "NOT"
LINE 319: CREATE POLICY IF NOT EXISTS "Users can read own profile"
```

## Fix Applied
Replaced all `CREATE POLICY IF NOT EXISTS` statements with the compatible pattern:
```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
CREATE POLICY "policy_name"
  ON table_name FOR ...
```

## Changes Made
1. **Fixed 42 CREATE POLICY IF NOT EXISTS statements** across all migrations
2. **Fixed storage policy DROP statements** to use `storage.objects` instead of `storage`

## Files Modified
- `supabase/consolidated_migration.sql` - Updated with PostgreSQL-compatible policy syntax

## Verification
Run this query to count the fixed policies:
```sql
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
```

## Testing
The migration file should now run successfully on PostgreSQL 13, 14, and 15+.

---
**Date**: January 14, 2026
**Status**: ✅ Fixed and ready to apply
