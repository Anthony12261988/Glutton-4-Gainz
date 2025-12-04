-- Migration 012: Storage Buckets Configuration
-- Sets up storage for avatars and content assets
-- NOTE: Run this migration via the Supabase Dashboard SQL Editor

-- ============================================================================
-- BUCKET: avatars (User profile pictures)
-- ============================================================================

-- Create avatars bucket (public bucket for user avatars)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  TRUE, -- Public read access
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects (should already be enabled, but ensure it)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can upload to their own folder
CREATE POLICY IF NOT EXISTS "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Authenticated users can update their own files
CREATE POLICY IF NOT EXISTS "Users can update own avatar"
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

-- Policy: Authenticated users can delete their own files
CREATE POLICY IF NOT EXISTS "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Anyone can view avatars (public read)
CREATE POLICY IF NOT EXISTS "Anyone can view avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- ============================================================================
-- BUCKET: content_assets (Recipe images, badges, etc.)
-- ============================================================================

-- Create content_assets bucket (public bucket for coaches to upload content)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content_assets',
  'content_assets',
  TRUE, -- Public read access
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Only coaches can upload content assets
CREATE POLICY IF NOT EXISTS "Coaches can upload content assets"
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

-- Policy: Only coaches can update content assets
CREATE POLICY IF NOT EXISTS "Coaches can update content assets"
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

-- Policy: Only coaches can delete content assets
CREATE POLICY IF NOT EXISTS "Coaches can delete content assets"
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

-- Policy: Anyone can view content assets (public read)
CREATE POLICY IF NOT EXISTS "Anyone can view content assets"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'content_assets');
