-- Migration 055: Gamification Challenges System
-- Challenge-based badges and community challenges

-- Challenge types enum
DO $$ BEGIN
  CREATE TYPE challenge_type AS ENUM ('workout_count', 'streak_days', 'xp_total', 'community_posts', 'personal_record');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Challenge status enum
DO $$ BEGIN
  CREATE TYPE challenge_status AS ENUM ('upcoming', 'active', 'completed', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Badge category enum
DO $$ BEGIN
  CREATE TYPE badge_category AS ENUM ('workout', 'streak', 'community', 'challenge', 'milestone');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Badge rarity enum
DO $$ BEGIN
  CREATE TYPE badge_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type challenge_type NOT NULL,
  target_value INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status challenge_status NOT NULL DEFAULT 'upcoming',
  badge_reward TEXT,
  xp_reward INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Challenge participants
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(challenge_id, user_id)
);

-- Badge definitions (for structured badge management)
CREATE TABLE IF NOT EXISTS badge_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  category badge_category NOT NULL,
  rarity badge_rarity NOT NULL DEFAULT 'common',
  icon_name TEXT,
  requirement_type TEXT,
  requirement_value INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_dates ON challenges(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_completed ON challenge_participants(completed);

-- RLS for challenges
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active challenges" ON challenges;
CREATE POLICY "Anyone can view active challenges" ON challenges
  FOR SELECT TO authenticated USING (status IN ('active', 'upcoming'));

DROP POLICY IF EXISTS "Coaches/admins can manage challenges" ON challenges;
CREATE POLICY "Coaches/admins can manage challenges" ON challenges
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

-- RLS for challenge_participants
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view participants" ON challenge_participants;
CREATE POLICY "Anyone can view participants" ON challenge_participants
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can join challenges" ON challenge_participants;
CREATE POLICY "Users can join challenges" ON challenge_participants
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can track own progress" ON challenge_participants;
CREATE POLICY "Users can track own progress" ON challenge_participants
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- RLS for badge_definitions
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view badge definitions" ON badge_definitions;
CREATE POLICY "Anyone can view badge definitions" ON badge_definitions
  FOR SELECT TO authenticated USING (true);

-- Comments
COMMENT ON TABLE challenges IS 'Community challenges with rewards';
COMMENT ON TABLE challenge_participants IS 'User participation in challenges';
COMMENT ON TABLE badge_definitions IS 'Structured badge definitions with metadata';
