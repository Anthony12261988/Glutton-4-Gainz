-- =====================================================
-- SAMPLE CHALLENGES - Glutton4Gainz
-- =====================================================
-- Creates sample challenges for testing the gamification system
-- Run this after applying all migrations
-- =====================================================

-- Insert sample challenges
INSERT INTO challenges (title, description, challenge_type, requirement_value, start_date, end_date, badge_reward, is_active)
VALUES
  -- Workout Count Challenges
  (
    'Week Warrior',
    'Complete 5 workouts in 7 days. Show your commitment to the mission!',
    'workout_count',
    5,
    NOW(),
    NOW() + INTERVAL '7 days',
    'Challenge Accepted',
    true
  ),
  (
    'Iron Regiment',
    'Complete 20 workouts this month. Join the elite ranks!',
    'workout_count',
    20,
    DATE_TRUNC('month', NOW()),
    DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
    'Champion',
    true
  ),
  (
    'Fitness Blitz',
    'Complete 3 workouts in 3 days. Quick and intense!',
    'workout_count',
    3,
    NOW(),
    NOW() + INTERVAL '3 days',
    'Challenge Accepted',
    true
  ),

  -- Streak Challenges
  (
    'Seven Day Siege',
    'Maintain a 7-day workout streak. Consistency is key!',
    'streak_days',
    7,
    NOW(),
    NOW() + INTERVAL '14 days',
    'Challenge Accepted',
    true
  ),
  (
    'The Monthly Marathon',
    'Achieve a 30-day workout streak. Ultimate dedication!',
    'streak_days',
    30,
    DATE_TRUNC('month', NOW()),
    DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
    'Legend',
    true
  ),
  (
    'Weekend Warrior Sprint',
    'Maintain a 3-day streak over the weekend.',
    'streak_days',
    3,
    NOW(),
    NOW() + INTERVAL '5 days',
    'Challenge Accepted',
    true
  ),

  -- XP Total Challenges
  (
    'Rapid Ascent',
    'Earn 500 XP in one week. Rise through the ranks!',
    'xp_total',
    500,
    NOW(),
    NOW() + INTERVAL '7 days',
    'Challenge Accepted',
    true
  ),
  (
    'XP Dominator',
    'Accumulate 2,000 XP this month. Become unstoppable!',
    'xp_total',
    2000,
    DATE_TRUNC('month', NOW()),
    DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
    'Champion',
    true
  ),
  (
    'Quick Strike',
    'Earn 100 XP in 24 hours. Fast and furious!',
    'xp_total',
    100,
    NOW(),
    NOW() + INTERVAL '1 day',
    'Challenge Accepted',
    true
  ),

  -- Long-term Challenges
  (
    'Quarter Commando',
    'Complete 60 workouts in 90 days. Long-term commitment!',
    'workout_count',
    60,
    NOW(),
    NOW() + INTERVAL '90 days',
    'Legend',
    true
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFY CHALLENGES CREATED
-- =====================================================
-- Run this query to see all active challenges:
-- SELECT id, title, challenge_type, requirement_value, start_date, end_date, badge_reward
-- FROM challenges
-- WHERE is_active = true
-- ORDER BY start_date;

-- =====================================================
-- CLEAN UP (if needed)
-- =====================================================
-- To remove sample challenges, uncomment and run:
-- DELETE FROM challenges WHERE title IN (
--   'Week Warrior', 'Iron Regiment', 'Fitness Blitz',
--   'Seven Day Siege', 'The Monthly Marathon', 'Weekend Warrior Sprint',
--   'Rapid Ascent', 'XP Dominator', 'Quick Strike', 'Quarter Commando'
-- );
