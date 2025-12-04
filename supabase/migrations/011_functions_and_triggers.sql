-- Migration 011: Database Functions and Triggers
-- Automated functions for profile creation, XP management, badges, and streaks

-- ============================================================================
-- FUNCTION: Auto-create profile on user signup
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, tier, xp, current_streak, last_active)
  VALUES (
    NEW.id,
    NEW.email,
    'user', -- Default role
    '.223', -- Default tier (Novice)
    0,      -- Starting XP
    0,      -- Starting streak
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

COMMENT ON FUNCTION handle_new_user() IS 'Automatically creates a profile when a new user signs up';

-- ============================================================================
-- FUNCTION: Calculate current streak
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_current_date DATE := CURRENT_DATE;
  v_check_date DATE;
BEGIN
  -- Start from today and count backwards
  v_check_date := v_current_date;

  LOOP
    -- Check if there's a log for this date
    IF EXISTS (
      SELECT 1 FROM user_logs
      WHERE user_id = p_user_id
      AND date = v_check_date
    ) THEN
      v_streak := v_streak + 1;
      v_check_date := v_check_date - INTERVAL '1 day';
    ELSE
      -- Streak broken
      EXIT;
    END IF;

    -- Safety: don't loop more than 365 days
    IF v_streak >= 365 THEN
      EXIT;
    END IF;
  END LOOP;

  RETURN v_streak;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_streak(UUID) IS 'Calculates consecutive days of workout logs for a user';

-- ============================================================================
-- FUNCTION: Award "First Blood" badge
-- ============================================================================

CREATE OR REPLACE FUNCTION award_first_blood_badge(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_log_count INTEGER;
BEGIN
  -- Count user's workout logs
  SELECT COUNT(*) INTO v_log_count
  FROM user_logs
  WHERE user_id = p_user_id;

  -- Award badge if this is their first workout
  IF v_log_count = 1 THEN
    INSERT INTO user_badges (user_id, badge_name, earned_at)
    VALUES (p_user_id, 'First Blood', NOW())
    ON CONFLICT (user_id, badge_name) DO NOTHING; -- Prevent duplicates
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION award_first_blood_badge(UUID) IS 'Awards "First Blood" badge on first workout completion';

-- ============================================================================
-- FUNCTION: Award "Iron Week" badge
-- ============================================================================

CREATE OR REPLACE FUNCTION award_iron_week_badge(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_streak INTEGER;
BEGIN
  -- Get current streak
  v_streak := calculate_streak(p_user_id);

  -- Award badge if streak >= 7 days
  IF v_streak >= 7 THEN
    INSERT INTO user_badges (user_id, badge_name, earned_at)
    VALUES (p_user_id, 'Iron Week', NOW())
    ON CONFLICT (user_id, badge_name) DO NOTHING; -- Prevent duplicates
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION award_iron_week_badge(UUID) IS 'Awards "Iron Week" badge on 7-day streak achievement';

-- ============================================================================
-- FUNCTION: Award "Century" badge
-- ============================================================================

CREATE OR REPLACE FUNCTION award_century_badge(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_log_count INTEGER;
BEGIN
  -- Count user's workout logs
  SELECT COUNT(*) INTO v_log_count
  FROM user_logs
  WHERE user_id = p_user_id;

  -- Award badge if 100+ workouts
  IF v_log_count >= 100 THEN
    INSERT INTO user_badges (user_id, badge_name, earned_at)
    VALUES (p_user_id, 'Century', NOW())
    ON CONFLICT (user_id, badge_name) DO NOTHING; -- Prevent duplicates
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION award_century_badge(UUID) IS 'Awards "Century" badge on 100th workout completion';

-- ============================================================================
-- FUNCTION: Handle workout log completion (main trigger function)
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_workout_log()
RETURNS TRIGGER AS $$
DECLARE
  v_new_streak INTEGER;
BEGIN
  -- 1. Add 100 XP to user profile
  UPDATE profiles
  SET
    xp = xp + 100,
    last_active = NOW()
  WHERE id = NEW.user_id;

  -- 2. Calculate and update streak
  v_new_streak := calculate_streak(NEW.user_id);

  UPDATE profiles
  SET current_streak = v_new_streak
  WHERE id = NEW.user_id;

  -- 3. Award badges
  PERFORM award_first_blood_badge(NEW.user_id);
  PERFORM award_iron_week_badge(NEW.user_id);
  PERFORM award_century_badge(NEW.user_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION handle_workout_log() IS 'Main trigger function: awards XP, updates streak, and checks for badge eligibility';

-- Trigger: Handle workout completion
CREATE TRIGGER on_workout_log_created
  AFTER INSERT ON user_logs
  FOR EACH ROW
  EXECUTE FUNCTION handle_workout_log();

-- ============================================================================
-- FUNCTION: Update last_active timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET last_active = NOW()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers: Update last_active on various user actions
CREATE TRIGGER update_last_active_on_log
  AFTER INSERT ON user_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_last_active();

CREATE TRIGGER update_last_active_on_metric
  AFTER INSERT ON body_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_last_active();

CREATE TRIGGER update_last_active_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_last_active();

COMMENT ON FUNCTION update_last_active() IS 'Updates user last_active timestamp on various actions';

-- ============================================================================
-- GRANT EXECUTE PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_streak(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION handle_workout_log() TO authenticated;
GRANT EXECUTE ON FUNCTION update_last_active() TO authenticated;

-- Service definer functions (badges) don't need explicit grants
