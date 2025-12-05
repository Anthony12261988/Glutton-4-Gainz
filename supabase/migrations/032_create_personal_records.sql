-- Personal Records (PRs) Table for tracking personal bests
-- Supports various exercise types: weight-based, reps-based, time-based

create table if not exists personal_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  exercise_name text not null,
  record_type text not null check (record_type in ('weight', 'reps', 'time')),
  value numeric not null,
  unit text not null, -- 'lbs', 'kg', 'reps', 'seconds', 'minutes'
  notes text,
  achieved_at date default current_date not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for faster lookups
create index idx_personal_records_user_id on personal_records(user_id);
create index idx_personal_records_exercise on personal_records(exercise_name);

-- Enable RLS
alter table personal_records enable row level security;

-- Users can only see their own records
create policy "Users can view own PRs"
  on personal_records for select
  using (auth.uid() = user_id);

-- Users can insert their own records
create policy "Users can insert own PRs"
  on personal_records for insert
  with check (auth.uid() = user_id);

-- Users can update their own records
create policy "Users can update own PRs"
  on personal_records for update
  using (auth.uid() = user_id);

-- Users can delete their own records
create policy "Users can delete own PRs"
  on personal_records for delete
  using (auth.uid() = user_id);

-- Coaches can view all PRs
create policy "Coaches can view all PRs"
  on personal_records for select
  using (auth.uid() in (select id from profiles where role in ('coach', 'admin')));
