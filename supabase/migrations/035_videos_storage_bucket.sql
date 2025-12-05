-- Migration 035: Videos Storage Bucket
-- Sets up storage for intro video and future video content
-- NOTE: Run this migration via the Supabase Dashboard SQL Editor

-- ============================================================================
-- BUCKET: videos (Intro video, workout demos, etc.)
-- ============================================================================

-- Create videos bucket (public bucket for video content)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  TRUE, -- Public read access
  104857600, -- 100MB limit for videos
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (for idempotent migrations)
DROP POLICY IF EXISTS "Admins and coaches can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins and coaches can update videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins and coaches can delete videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view videos" ON storage.objects;

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

-- Policy: Anyone can view videos (public read)
CREATE POLICY "Anyone can view videos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'videos');
