-- Add coach-specific profile fields to profiles table
-- Migration: 038_add_coach_profile_fields.sql

-- Add coach profile fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS specialties TEXT,
ADD COLUMN IF NOT EXISTS certifications TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN profiles.bio IS 'Coach bio/about section describing their background and philosophy';
COMMENT ON COLUMN profiles.specialties IS 'Comma-separated list of training specialties (e.g., Strength Training, HIIT, Calisthenics)';
COMMENT ON COLUMN profiles.certifications IS 'Comma-separated list of certifications (e.g., NASM-CPT, CSCS)';
COMMENT ON COLUMN profiles.years_experience IS 'Number of years of coaching experience';
