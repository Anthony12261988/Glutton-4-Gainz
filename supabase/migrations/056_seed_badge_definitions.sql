-- Migration 056: Seed Badge Definitions
-- Initial badge definitions for existing and new challenge badges

-- Insert existing workout badges
INSERT INTO badge_definitions (badge_name, display_name, description, category, rarity, requirement_type, requirement_value)
VALUES
  ('First Blood', 'First Blood', 'Complete your first workout', 'workout', 'common', 'workout_count', 1),
  ('Double Digits', 'Double Digits', 'Complete 10 workouts', 'workout', 'common', 'workout_count', 10),
  ('Quarter Century', 'Quarter Century', 'Complete 25 workouts', 'workout', 'rare', 'workout_count', 25),
  ('Half Century', 'Half Century', 'Complete 50 workouts', 'workout', 'rare', 'workout_count', 50),
  ('Century', 'Century', 'Complete 100 workouts', 'workout', 'epic', 'workout_count', 100),
  ('Iron Week', 'Iron Week', 'Maintain a 7-day workout streak', 'streak', 'common', 'streak_days', 7),
  ('Streak Master', 'Streak Master', 'Maintain a 30-day workout streak', 'streak', 'epic', 'streak_days', 30)
ON CONFLICT (badge_name) DO NOTHING;

-- Insert new challenge badges
INSERT INTO badge_definitions (badge_name, display_name, description, category, rarity, requirement_type, requirement_value)
VALUES
  ('Challenge Accepted', 'Challenge Accepted', 'Complete your first challenge', 'challenge', 'common', 'challenges_completed', 1),
  ('Challenge Champion', 'Challenge Champion', 'Complete 5 challenges', 'challenge', 'rare', 'challenges_completed', 5),
  ('Challenge Legend', 'Challenge Legend', 'Complete 10 challenges', 'challenge', 'epic', 'challenges_completed', 10)
ON CONFLICT (badge_name) DO NOTHING;
