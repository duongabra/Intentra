-- Add is_hidden to projects (soft delete). Run in Supabase SQL Editor if table already exists.
alter table public.projects
  add column if not exists is_hidden boolean not null default false;
