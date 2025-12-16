# Quick Fix: Briefing Publishing Issue

## Problem
When clicking "Publish Briefing" as admin, the button shows loading but nothing happens.

## Root Cause
The RLS (Row Level Security) policies only allow coaches to create/update briefings. Admins need permission too.

## Solution: Run Migration 043

### Option 1: Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of `supabase/migrations/043_allow_admin_briefings.sql`
4. Paste into SQL Editor
5. Click **Run**
6. You should see: "Success. No rows returned"

### Option 2: Check Current Policies

Run this query in SQL Editor to see current policies:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'daily_briefings';
```

You should see policies that include both 'coach' and 'admin' in the role check.

### Option 3: Manual Policy Update

If migration doesn't work, run these commands manually:

```sql
-- Drop old policies
DROP POLICY IF EXISTS "Coaches can insert" ON daily_briefings;
DROP POLICY IF EXISTS "Coaches can update" ON daily_briefings;

-- Create new policies
CREATE POLICY "Coaches and admins can insert"
  ON daily_briefings FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('coach', 'admin')
    )
  );

CREATE POLICY "Coaches and admins can update"
  ON daily_briefings FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('coach', 'admin')
    )
  );

CREATE POLICY "Coaches and admins can delete"
  ON daily_briefings FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('coach', 'admin')
    )
  );
```

## After Running Migration

1. **Refresh your browser** (hard refresh: Cmd+Shift+R or Ctrl+Shift+R)
2. Try publishing a briefing again
3. **Check browser console** (F12) - you should now see detailed error messages if something fails
4. The error toast will now show the actual error message instead of a generic one

## Testing

After running the migration, test by:
1. Creating a new briefing
2. The error message (if any) will now be visible in the toast notification
3. Check browser console for detailed logs

## If Still Not Working

Check browser console (F12 → Console tab) for errors. The improved error handling will show:
- Exact error message from Supabase
- Which operation failed (update or insert)
- RLS policy violation messages


