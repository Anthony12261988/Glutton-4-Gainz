-- Add Fitness Dossier fields to profiles table
-- These fields capture detailed health and fitness information during onboarding

-- Fitness experience level
alter table profiles add column if not exists fitness_experience text 
  check (fitness_experience in ('beginner', 'intermediate', 'advanced', 'athlete'));

-- Primary fitness goal
alter table profiles add column if not exists fitness_goal text
  check (fitness_goal in ('lose_fat', 'build_muscle', 'get_stronger', 'improve_endurance', 'general_fitness'));

-- Available equipment
alter table profiles add column if not exists available_equipment text[]
  default '{}';

-- Injuries or limitations (free text for flexibility)
alter table profiles add column if not exists injuries_limitations text;

-- Preferred workout duration (in minutes)
alter table profiles add column if not exists preferred_duration integer
  check (preferred_duration >= 15 and preferred_duration <= 120);

-- Workout days per week
alter table profiles add column if not exists workout_days_per_week integer
  check (workout_days_per_week >= 1 and workout_days_per_week <= 7);

-- Height (in inches for US, can convert from cm)
alter table profiles add column if not exists height_inches numeric;

-- Target weight (optional goal weight)
alter table profiles add column if not exists target_weight numeric;

-- Date of birth (for age-appropriate programming)
alter table profiles add column if not exists date_of_birth date;

-- Gender (for physiology-based recommendations)
alter table profiles add column if not exists gender text
  check (gender in ('male', 'female', 'other', 'prefer_not_to_say'));

-- Has completed full dossier
alter table profiles add column if not exists dossier_complete boolean default false;
