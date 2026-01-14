# Storage Bucket Setup Guide

## Overview
The consolidated migration creates 3 storage buckets but cannot set up the access policies automatically due to permission restrictions. You need to configure the storage policies manually via the Supabase Dashboard.

## Storage Buckets Created

### 1. `avatars` Bucket
**Purpose**: User profile pictures
**Size Limit**: 5MB
**Allowed Types**: image/jpeg, image/png, image/webp, image/gif
**Public Access**: Yes (read-only)

### 2. `content_assets` Bucket
**Purpose**: Recipe images, badges, workout media
**Size Limit**: 10MB
**Allowed Types**: image/jpeg, image/png, image/webp, image/gif, image/svg+xml
**Public Access**: Yes (read-only)

### 3. `videos` Bucket
**Purpose**: Intro videos, workout demos
**Size Limit**: 100MB
**Allowed Types**: video/mp4, video/webm, video/ogg, image/jpeg, image/png, image/webp
**Public Access**: Yes (read-only)

---

## Manual Setup Required

After running the migration, configure storage policies via Supabase Dashboard:

### Step 1: Navigate to Storage
1. Open Supabase Dashboard
2. Go to **Storage** section
3. You should see 3 buckets: `avatars`, `content_assets`, `videos`

### Step 2: Configure `avatars` Bucket Policies

Click on `avatars` bucket → **Policies** tab → **New Policy**

#### Policy 1: Users can upload own avatar
```sql
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 2: Users can update own avatar
```sql
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 3: Users can delete own avatar
```sql
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 4: Anyone can view avatars
```sql
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

---

### Step 3: Configure `content_assets` Bucket Policies

Click on `content_assets` bucket → **Policies** tab → **New Policy**

#### Policy 1: Coaches can upload content assets
```sql
CREATE POLICY "Coaches can upload content assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content_assets'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'coach'
  )
);
```

#### Policy 2: Coaches can update content assets
```sql
CREATE POLICY "Coaches can update content assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'content_assets'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'coach'
  )
)
WITH CHECK (
  bucket_id = 'content_assets'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'coach'
  )
);
```

#### Policy 3: Coaches can delete content assets
```sql
CREATE POLICY "Coaches can delete content assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'content_assets'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'coach'
  )
);
```

#### Policy 4: Anyone can view content assets
```sql
CREATE POLICY "Anyone can view content assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'content_assets');
```

---

### Step 4: Configure `videos` Bucket Policies

Click on `videos` bucket → **Policies** tab → **New Policy**

#### Policy 1: Admins and coaches can upload videos
```sql
CREATE POLICY "Admins and coaches can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'coach')
  )
);
```

#### Policy 2: Admins and coaches can update videos
```sql
CREATE POLICY "Admins and coaches can update videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'videos'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'coach')
  )
)
WITH CHECK (
  bucket_id = 'videos'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'coach')
  )
);
```

#### Policy 3: Admins and coaches can delete videos
```sql
CREATE POLICY "Admins and coaches can delete videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'coach')
  )
);
```

#### Policy 4: Anyone can view videos
```sql
CREATE POLICY "Anyone can view videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');
```

---

## Quick Policy Setup (Alternative)

**RECOMMENDED**: Use the fixed SQL script file `STORAGE_POLICIES_FIXED.sql` which includes `DROP POLICY IF EXISTS` statements to handle existing policies safely.

### Option A: Run the Fixed Script File (Recommended)
```bash
# In Supabase SQL Editor, load and run:
# supabase/STORAGE_POLICIES_FIXED.sql
```

This script safely drops any existing policies before creating new ones, avoiding the error:
```
ERROR: 42710: policy "..." for table "objects" already exists
```

### Option B: Manual One-Line Script (Legacy)
⚠️ **Note**: This may fail if policies already exist. Use Option A instead.

If you prefer a one-line approach, you can run this (but it will fail if policies exist):

```sql
-- WARNING: Only use this if no policies exist yet
-- Avatars bucket policies
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text) WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');

-- Content assets bucket policies
CREATE POLICY "Coaches can upload content assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'content_assets' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'coach'));
CREATE POLICY "Coaches can update content assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'content_assets' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'coach')) WITH CHECK (bucket_id = 'content_assets' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'coach'));
CREATE POLICY "Coaches can delete content assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'content_assets' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'coach'));
CREATE POLICY "Anyone can view content assets" ON storage.objects FOR SELECT TO public USING (bucket_id = 'content_assets');

-- Videos bucket policies
CREATE POLICY "Admins and coaches can upload videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'videos' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach')));
CREATE POLICY "Admins and coaches can update videos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'videos' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))) WITH CHECK (bucket_id = 'videos' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach')));
CREATE POLICY "Admins and coaches can delete videos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'videos' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach')));
CREATE POLICY "Anyone can view videos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'videos');
```

---

## Verification

After setting up policies, verify they work:

1. **Test avatar upload**: Try uploading a profile picture as a regular user
2. **Test recipe image**: Try uploading a recipe image as a coach
3. **Test video upload**: Try uploading a video as an admin/coach

---

**Last Updated**: January 14, 2026
**Status**: Manual setup required after migration
