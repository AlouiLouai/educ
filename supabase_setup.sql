-- 1. Create the profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text,
  last_name text,
  email text,
  role text check (role in ('student', 'teacher', 'admin')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Create RLS Policies
create policy "Users can view own profile only"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile except role"
  on public.profiles for update
  using ( auth.uid() = id )
  with check (
    -- This ensures the NEW role is the SAME as the EXISTING role
    role = (select role from public.profiles where id = auth.uid())
  );

-- 4. Create a function to handle new user sync
create or replace function public.handle_user_sync()
returns trigger as $$
declare
  chosen_role text;
begin
  -- 1. Get the role from the metadata
  chosen_role := new.raw_user_meta_data->>'role';

  -- 2. VALIDATION: Only allow 'student' or 'teacher'. 
  -- If it's 'admin' or something else, force it to 'student'.
  if chosen_role not in ('student', 'teacher') then
    chosen_role := 'student';
  end if;

  insert into public.profiles (id, first_name, last_name, email, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'given_name', split_part(new.raw_user_meta_data->>'full_name', ' ', 1)),
    coalesce(new.raw_user_meta_data->>'family_name', substring(new.raw_user_meta_data->>'full_name' from position(' ' in new.raw_user_meta_data->>'full_name') + 1)),
    new.email,
    chosen_role, -- Use the validated role
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
  set
    first_name = coalesce(excluded.first_name, profiles.first_name),
    last_name = coalesce(excluded.last_name, profiles.last_name),
    email = coalesce(excluded.email, profiles.email),
    -- We still don't update role on 'UPDATE' for extra safety
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- 5. Create a trigger to run the function on every user change
create trigger on_auth_user_created_or_updated
  after insert or update on auth.users
  for each row execute procedure public.handle_user_sync();
