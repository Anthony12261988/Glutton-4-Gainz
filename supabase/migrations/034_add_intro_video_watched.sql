-- Add intro_video_watched field to profiles
-- This tracks whether the user has watched the welcome video

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS intro_video_watched BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN public.profiles.intro_video_watched IS 'Tracks if user has watched the trainer welcome video';
