/**
 * Query Layer Index
 *
 * Centralized exports for all database query functions.
 * This layer provides a clean abstraction over Supabase operations.
 *
 * Usage:
 * import { getWorkoutForToday, createUserLog } from '@/lib/queries';
 */

// Workouts
export * from './workouts';

// User Logs
export * from './user-logs';

// Analytics
export * from './analytics';

// Badges
export * from './badges';

// Messages
export * from './messages';

// Buddies
export * from './buddies';

// Meal Plans
export * from './meal-plans';

// Recipes
export * from './recipes';
