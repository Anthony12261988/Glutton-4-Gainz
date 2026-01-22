-- Migration 059: Make videos bucket private with signed URL access
-- Updates bucket visibility and policies for admin uploads and signed reads

-- Ensure videos bucket exists and is private
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  FALSE, -- Private bucket
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = FALSE,
    file_size_limit = 104857600,
    allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/ogg', 'image/jpeg', 'image/png', 'image/webp'];

-- Drop old public policies
DROP POLICY IF EXISTS "Admins and coaches can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins and coaches can update videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins and coaches can delete videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view videos" ON storage.objects;

-- Policy: Only admins/coaches can upload videos
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

-- Policy: Only admins/coaches can update videos
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

-- Policy: Only admins/coaches can delete videos
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

-- Policy: Authenticated users can view videos (via signed URLs)
CREATE POLICY "Authenticated users can view videos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'videos');
