# Storage Bucket Setup - Quick Fix Guide

## The Problem

Migration `012_storage_buckets.sql` may fail with error:
```
ERROR: 42501: must be owner of relation objects
```

This happens because storage policies in Supabase sometimes need special permissions.

---

## ✅ Solution 1: Use the Fixed Migration (Recommended)

The migration file has been updated with proper syntax. Try running it again:

1. Go to Supabase Dashboard → **SQL Editor**
2. Copy/paste contents of `supabase/migrations/012_storage_buckets.sql`
3. Click **Run**

**Changes made:**
- Added `IF NOT EXISTS` to all policies
- Added `ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY`
- Used explicit schema names (`public.profiles`)

---

## ✅ Solution 2: Use Alternative (Buckets Only)

If Solution 1 still fails, use the simplified version:

1. Go to Supabase Dashboard → **SQL Editor**
2. Copy/paste contents of `supabase/migrations/012_storage_buckets_ALTERNATIVE.sql`
3. Click **Run** (this only creates the buckets)
4. Then manually add policies through the UI:

### Add Policies via Supabase Dashboard

#### For "avatars" bucket:

1. Go to **Storage** → Click **"avatars"** → **Policies** tab
2. Click **"New Policy"**

**Policy 1: Users can upload own avatar**
- Operations: INSERT
- Target roles: authenticated
- Policy definition (WITH CHECK):
  ```sql
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  ```

**Policy 2: Users can update own avatar**
- Operations: UPDATE
- Target roles: authenticated
- Policy definition (USING):
  ```sql
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- WITH CHECK (same as above)

**Policy 3: Users can delete own avatar**
- Operations: DELETE
- Target roles: authenticated
- Policy definition (USING):
  ```sql
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  ```

**Policy 4: Anyone can view avatars**
- Operations: SELECT
- Target roles: public
- Policy definition (USING):
  ```sql
  bucket_id = 'avatars'
  ```

#### For "content_assets" bucket:

1. Go to **Storage** → Click **"content_assets"** → **Policies** tab
2. Click **"New Policy"**

**Policy 1: Coaches can upload content assets**
- Operations: INSERT
- Target roles: authenticated
- Policy definition (WITH CHECK):
  ```sql
  bucket_id = 'content_assets' AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'coach'
  )
  ```

**Policy 2: Coaches can update content assets**
- Operations: UPDATE
- Target roles: authenticated
- Policy definition (USING and WITH CHECK):
  ```sql
  bucket_id = 'content_assets' AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'coach'
  )
  ```

**Policy 3: Coaches can delete content assets**
- Operations: DELETE
- Target roles: authenticated
- Policy definition (USING):
  ```sql
  bucket_id = 'content_assets' AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'coach'
  )
  ```

**Policy 4: Anyone can view content assets**
- Operations: SELECT
- Target roles: public
- Policy definition (USING):
  ```sql
  bucket_id = 'content_assets'
  ```

---

## ✅ Solution 3: Manual Setup (No Migration)

Skip the migration entirely and set up through UI:

### Create Buckets

1. Go to **Storage** in Supabase Dashboard
2. Click **"New bucket"**

**Avatars Bucket:**
- Name: `avatars`
- Public: ✅ Yes
- File size limit: 5MB (5242880 bytes)
- Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`

**Content Assets Bucket:**
- Name: `content_assets`
- Public: ✅ Yes
- File size limit: 10MB (10485760 bytes)
- Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif, image/svg+xml`

3. Then add policies as described in Solution 2

---

## ✅ Verify Setup

After completing any solution:

1. Go to **Storage** in Supabase Dashboard
2. You should see 2 buckets:
   - ✅ avatars
   - ✅ content_assets
3. Click each bucket → **Policies** tab
4. Verify 4 policies exist for each bucket

---

## 🎯 Which Solution Should I Use?

| Solution | Best For | Difficulty |
|----------|----------|------------|
| Solution 1 | Most people | ⭐ Easy |
| Solution 2 | If Solution 1 fails | ⭐⭐ Medium |
| Solution 3 | If you prefer UI over SQL | ⭐⭐⭐ Detailed |

**Recommended**: Try Solution 1 first. If it fails, use Solution 2.

---

## 🐛 Still Having Issues?

Check the Supabase Dashboard Logs:
1. Go to **Database** → **Logs**
2. Look for error messages related to storage
3. Check [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)

---

**Note**: This is a known quirk with Supabase storage policies. Once set up (via any method), they work perfectly! 🎖️
