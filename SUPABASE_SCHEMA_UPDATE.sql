
-- Update the user_data table to include theme_preferences
-- We can add a column for it

alter table public.user_data
add column if not exists theme_preferences jsonb default '{}'::jsonb;
