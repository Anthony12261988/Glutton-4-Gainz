-- =====================================================
-- GLUTTON4GAMES DATABASE INDEX OPTIMIZATION
-- Migration: 029_add_performance_indexes
-- Purpose: Add indexes for query optimization
-- Date: December 4, 2025
-- =====================================================

-- ===================================
-- USER LOGS INDEXES
-- ===================================

-- Index for user's workout history queries (most common query)
CREATE INDEX IF NOT EXISTS idx_user_logs_user_date
ON user_logs(user_id, date DESC);

-- Index for checking if user logged today
CREATE INDEX IF NOT EXISTS idx_user_logs_user_workout_date
ON user_logs(user_id, workout_id, date);

-- Index for date range queries (analytics)
CREATE INDEX IF NOT EXISTS idx_user_logs_date_range
ON user_logs(date DESC);

-- ===================================
-- WORKOUTS INDEXES
-- ===================================

-- Index for getting workouts by tier and date
CREATE INDEX IF NOT EXISTS idx_workouts_tier_date
ON workouts(tier, scheduled_date DESC);

-- Index for getting today's workout (most common)
CREATE INDEX IF NOT EXISTS idx_workouts_date
ON workouts(scheduled_date DESC);

-- ===================================
-- MESSAGES INDEXES
-- ===================================

-- Index for getting user's received messages
CREATE INDEX IF NOT EXISTS idx_messages_receiver_created_at
ON messages(receiver_id, created_at DESC);

-- Index for getting user's sent messages
CREATE INDEX IF NOT EXISTS idx_messages_sender_created_at
ON messages(sender_id, created_at DESC);

-- Composite index for conversation queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation
ON messages(sender_id, receiver_id, created_at DESC);

-- ===================================
-- BADGES INDEXES
-- ===================================

-- Index for getting user's badges
CREATE INDEX IF NOT EXISTS idx_user_badges_user_earned_at
ON user_badges(user_id, earned_at DESC);

-- Index for checking if badge exists
CREATE INDEX IF NOT EXISTS idx_user_badges_user_badge_name
ON user_badges(user_id, badge_name);

-- ===================================
-- BUDDIES INDEXES
-- ===================================

-- Index for getting user's buddy requests
CREATE INDEX IF NOT EXISTS idx_buddies_user_status_created
ON buddies(user_id, status, created_at DESC);

-- Index for getting pending requests
CREATE INDEX IF NOT EXISTS idx_buddies_buddy_status_created
ON buddies(buddy_id, status, created_at DESC);

-- Composite index for buddy relationship lookups
CREATE INDEX IF NOT EXISTS idx_buddies_both_users
ON buddies(user_id, buddy_id, status);

-- ===================================
-- MEAL PLANS INDEXES
-- ===================================

-- Index for getting user's meal plans by date
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date
ON meal_plans(user_id, assigned_date DESC);

-- Index for getting meals in a date range
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date_range
ON meal_plans(user_id, assigned_date);

-- ===================================
-- BODY METRICS INDEXES
-- ===================================

-- Index for getting user's body metrics history
CREATE INDEX IF NOT EXISTS idx_body_metrics_user_date
ON body_metrics(user_id, recorded_at DESC);

-- ===================================
-- PROFILES INDEXES (Additional)
-- ===================================

-- Index for coach roster queries
CREATE INDEX IF NOT EXISTS idx_profiles_role
ON profiles(role);

-- Index for searching users by email
-- (Note: email is unique, but index helps with lookups)
CREATE INDEX IF NOT EXISTS idx_profiles_email
ON profiles(email);

-- Index for tier-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_tier
ON profiles(tier);

-- ===================================
-- COMMENTS AND METADATA
-- ===================================

COMMENT ON INDEX idx_user_logs_user_date IS
'Optimizes user workout history queries';

COMMENT ON INDEX idx_messages_receiver_created_at IS
'Optimizes inbox message retrieval by newest first';

COMMENT ON INDEX idx_workouts_tier_date IS
'Optimizes workout assignment queries';

COMMENT ON INDEX idx_buddies_both_users IS
'Optimizes buddy relationship lookups';

COMMENT ON INDEX idx_meal_plans_user_date IS
'Optimizes meal planner date queries';

-- ===================================
-- ANALYZE TABLES FOR QUERY PLANNING
-- ===================================

ANALYZE user_logs;
ANALYZE workouts;
ANALYZE messages;
ANALYZE user_badges;
ANALYZE buddies;
ANALYZE meal_plans;
ANALYZE body_metrics;
ANALYZE profiles;

-- ===================================
-- VERIFICATION QUERY
-- ===================================

-- Run this to verify indexes were created:
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
-- ORDER BY tablename, indexname;
