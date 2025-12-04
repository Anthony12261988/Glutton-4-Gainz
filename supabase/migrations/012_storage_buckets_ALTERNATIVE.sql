-- Migration 012: Storage Buckets Configuration (ALTERNATIVE)
-- This is a simplified version that just creates the buckets
-- Configure policies through the Supabase Dashboard UI instead

-- ============================================================================
-- BUCKET: avatars (User profile pictures)
-- ============================================================================

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  TRUE, -- Public read access
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- BUCKET: content_assets (Recipe images, badges, etc.)
-- ============================================================================

-- Create content_assets bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content_assets',
  'content_assets',
  TRUE, -- Public read access
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- MANUAL SETUP REQUIRED: Configure Storage Policies via Supabase Dashboard
-- ============================================================================
--
-- After running this migration, set up storage policies in the Supabase Dashboard:
--
-- 1. Go to Storage → Policies
-- 2. Select "avatars" bucket
-- 3. Add these policies:
--
--    Policy: "Users can upload own avatar"
--    Allowed operation: INSERT
--    Target roles: authenticated
--    USING expression: bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
--
--    Policy: "Users can update own avatar"
--    Allowed operation: UPDATE
--    Target roles: authenticated
--    USING expression: bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
--
--    Policy: "Users can delete own avatar"
--    Allowed operation: DELETE
--    Target roles: authenticated
--    USING expression: bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
--
--    Policy: "Anyone can view avatars"
--    Allowed operation: SELECT
--    Target roles: public
--    USING expression: bucket_id = 'avatars'
--
-- 4. Select "content_assets" bucket
-- 5. Add these policies:
--
--    Policy: "Coaches can upload content assets"
--    Allowed operation: INSERT
--    Target roles: authenticated
--    USING expression: bucket_id = 'content_assets' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'coach')
--
--    Policy: "Coaches can update content assets"
--    Allowed operation: UPDATE
--    Target roles: authenticated
--    USING expression: bucket_id = 'content_assets' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'coach')
--
--    Policy: "Coaches can delete content assets"
--    Allowed operation: DELETE
--    Target roles: authenticated
--    USING expression: bucket_id = 'content_assets' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'coach')
--
--    Policy: "Anyone can view content assets"
--    Allowed operation: SELECT
--    Target roles: public
--    USING expression: bucket_id = 'content_assets'
