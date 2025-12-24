-- Migration 057: Challenge Progress Triggers
-- Automatic challenge progress tracking and badge awarding

-- Function to update challenge progress
CREATE OR REPLACE FUNCTION update_challenge_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_challenge RECORD;
  v_progress INTEGER;
BEGIN
  -- Find active challenges user is participating in
  FOR v_challenge IN
    SELECT cp.id as participant_id, c.id as challenge_id, c.challenge_type, c.target_value
    FROM challenge_participants cp
    JOIN challenges c ON c.id = cp.challenge_id
    WHERE cp.user_id = NEW.user_id
      AND cp.completed = false
      AND c.status = 'active'
  LOOP
    -- Calculate progress based on challenge type
    CASE v_challenge.challenge_type
      WHEN 'workout_count' THEN
        SELECT COUNT(*) INTO v_progress FROM user_logs WHERE user_id = NEW.user_id;
      WHEN 'streak_days' THEN
        SELECT current_streak INTO v_progress FROM profiles WHERE id = NEW.user_id;
      WHEN 'xp_total' THEN
        SELECT xp INTO v_progress FROM profiles WHERE id = NEW.user_id;
      ELSE
        v_progress := 0;
    END CASE;

    -- Update participant progress
    UPDATE challenge_participants
    SET progress = v_progress,
        completed = (v_progress >= v_challenge.target_value),
        completed_at = CASE WHEN v_progress >= v_challenge.target_value THEN NOW() ELSE completed_at END
    WHERE id = v_challenge.participant_id;

    -- Award badge if challenge completed
    IF v_progress >= v_challenge.target_value THEN
      PERFORM award_challenge_badge(NEW.user_id, v_challenge.participant_id);
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to award challenge badges
CREATE OR REPLACE FUNCTION award_challenge_badge(p_user_id UUID, p_participant_id UUID)
RETURNS VOID AS $$
DECLARE
  v_badge_name TEXT;
  v_completed_count INTEGER;
BEGIN
  -- Get badge reward from challenge
  SELECT c.badge_reward INTO v_badge_name
  FROM challenge_participants cp
  JOIN challenges c ON c.id = cp.challenge_id
  WHERE cp.id = p_participant_id;

  -- Award specific challenge badge if defined
  IF v_badge_name IS NOT NULL THEN
    INSERT INTO user_badges (user_id, badge_name, earned_at)
    VALUES (p_user_id, v_badge_name, NOW())
    ON CONFLICT (user_id, badge_name) DO NOTHING;
  END IF;

  -- Check for challenge completion milestone badges
  SELECT COUNT(*) INTO v_completed_count
  FROM challenge_participants
  WHERE user_id = p_user_id AND completed = true;

  IF v_completed_count = 1 THEN
    INSERT INTO user_badges (user_id, badge_name) VALUES (p_user_id, 'Challenge Accepted') ON CONFLICT DO NOTHING;
  ELSIF v_completed_count = 5 THEN
    INSERT INTO user_badges (user_id, badge_name) VALUES (p_user_id, 'Challenge Champion') ON CONFLICT DO NOTHING;
  ELSIF v_completed_count = 10 THEN
    INSERT INTO user_badges (user_id, badge_name) VALUES (p_user_id, 'Challenge Legend') ON CONFLICT DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on workout completion to update challenge progress
DROP TRIGGER IF EXISTS update_challenges_on_workout ON user_logs;
CREATE TRIGGER update_challenges_on_workout
  AFTER INSERT ON user_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_progress();

-- Trigger on profile XP/streak update
DROP TRIGGER IF EXISTS update_challenges_on_profile_update ON profiles;
CREATE TRIGGER update_challenges_on_profile_update
  AFTER UPDATE OF xp, current_streak ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_progress();

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_challenge_progress() TO authenticated;
GRANT EXECUTE ON FUNCTION award_challenge_badge(UUID, UUID) TO authenticated;

-- Comments
COMMENT ON FUNCTION update_challenge_progress() IS 'Automatically updates challenge progress when users complete workouts or gain XP';
COMMENT ON FUNCTION award_challenge_badge(UUID, UUID) IS 'Awards badges when challenges are completed';
