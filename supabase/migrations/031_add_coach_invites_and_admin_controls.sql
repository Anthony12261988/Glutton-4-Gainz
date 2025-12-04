-- Migration 031: Coach invites + admin controls

-- Create the table for coach invitations
create table if not exists public.coach_invites (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  token uuid default gen_random_uuid(),
  status text check (status in ('pending', 'accepted')) default 'pending',
  invited_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure helpful index for lookups by email and status
create index if not exists idx_coach_invites_email_status on public.coach_invites (email, status);

-- Enable RLS
alter table public.coach_invites enable row level security;

-- Policies
-- Admins can read/insert/update invites
create policy "Admins can view all invites" on public.coach_invites
  for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can insert invites" on public.coach_invites
  for insert with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can update invites" on public.coach_invites
  for update using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Public/Anon needs to read invites during onboarding check (restricted by email match)
create policy "Public can check their own invite" on public.coach_invites
  for select using (email = coalesce(auth.jwt() ->> 'email', ''));

-- Invited user can accept their own invite
create policy "Invited coach can accept invite" on public.coach_invites
  for update using (email = coalesce(auth.jwt() ->> 'email', ''))
  with check (email = coalesce(auth.jwt() ->> 'email', ''));

-- Add banned flag and expand role constraint to support admin/soldier
alter table public.profiles
  add column if not exists banned boolean default false;

update public.profiles set banned = false where banned is null;

alter table public.profiles
  alter column banned set not null,
  alter column banned set default false;

-- Expand allowed roles to include soldier/admin
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'soldier', 'coach', 'admin'));

-- Admin level access to profiles for command center controls
create policy "Admins can read all profiles" on public.profiles
  for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can update all profiles" on public.profiles
  for update using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
