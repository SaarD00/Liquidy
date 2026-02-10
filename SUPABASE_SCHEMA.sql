
-- Create a table to store user data (favorites, playlists, history) as JSONB
-- This allows for a flexible schema that matches the local storage structure.

create table public.user_data (
  user_id uuid not null references auth.users on delete cascade,
  favorites jsonb default '[]'::jsonb,
  playlists jsonb default '[]'::jsonb,
  history jsonb default '[]'::jsonb,
  primary key (user_id)
);

-- Enable Row Level Security (RLS)
alter table public.user_data enable row level security;

-- Create policies
create policy "Users can view their own data"
on public.user_data for select
using (auth.uid() = user_id);

create policy "Users can insert their own data"
on public.user_data for insert
with check (auth.uid() = user_id);

create policy "Users can update their own data"
on public.user_data for update
using (auth.uid() = user_id);

-- Optional: Create a trigger to automatically create a row when a user signs up
-- copy/paste this function or just rely on the frontend to create the row on first save.
