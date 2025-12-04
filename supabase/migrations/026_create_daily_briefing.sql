create table if not exists daily_briefings (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  active boolean default true,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

alter table daily_briefings enable row level security;

create policy "Public read access"
  on daily_briefings for select
  using (true);

create policy "Coaches can insert"
  on daily_briefings for insert
  with check (auth.uid() in (select id from profiles where role = 'coach'));

create policy "Coaches can update"
  on daily_briefings for update
  using (auth.uid() in (select id from profiles where role = 'coach'));
