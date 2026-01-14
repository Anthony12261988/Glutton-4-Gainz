-- ============================================================================
-- STORAGE POLICIES - Fixed Version with DROP IF EXISTS
-- ============================================================================
-- Run this AFTER the main migration completes
-- This version safely handles existing policies
-- ============================================================================

-- ============================================================================
-- AVATARS BUCKET POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
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

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ============================================================================
-- CONTENT_ASSETS BUCKET POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Coaches can upload content assets" ON storage.objects;
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

DROP POLICY IF EXISTS "Coaches can update content assets" ON storage.objects;
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

DROP POLICY IF EXISTS "Coaches can delete content assets" ON storage.objects;
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

DROP POLICY IF EXISTS "Anyone can view content assets" ON storage.objects;
CREATE POLICY "Anyone can view content assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'content_assets');

-- ============================================================================
-- VIDEOS BUCKET POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Admins and coaches can upload videos" ON storage.objects;
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

DROP POLICY IF EXISTS "Admins and coaches can update videos" ON storage.objects;
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

DROP POLICY IF EXISTS "Admins and coaches can delete videos" ON storage.objects;
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

DROP POLICY IF EXISTS "Anyone can view videos" ON storage.objects;
CREATE POLICY "Anyone can view videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check that all policies were created
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;

-- Should show 12 policies total (4 per bucket)
