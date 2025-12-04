-- Migration 001: Create profiles table
-- This is the core user profile table that extends Supabase auth.users

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'coach')),
  tier TEXT NOT NULL DEFAULT '.223' CHECK (tier IN ('.223', '.556', '.762', '.50 Cal')),
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  coach_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_coach_id ON profiles(coach_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_last_active ON profiles(last_active);
CREATE INDEX idx_profiles_tier ON profiles(tier);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE profiles IS 'User profiles extending auth.users with fitness app data';
COMMENT ON COLUMN profiles.tier IS 'Fitness tier: .223 (Novice), .556 (Intermediate), .762 (Advanced), .50 Cal (Elite)';
COMMENT ON COLUMN profiles.role IS 'User role: user (default) or coach (admin/trainer)';
COMMENT ON COLUMN profiles.xp IS 'Experience points earned from completing workouts (100 XP per workout)';
COMMENT ON COLUMN profiles.current_streak IS 'Current consecutive days with logged workouts';
