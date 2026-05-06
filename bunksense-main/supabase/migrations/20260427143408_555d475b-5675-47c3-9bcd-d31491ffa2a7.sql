-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles: select own" on public.profiles for select using (auth.uid() = id);
create policy "Profiles: insert own" on public.profiles for insert with check (auth.uid() = id);
create policy "Profiles: update own" on public.profiles for update using (auth.uid() = id);

-- Subjects
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_name text not null,
  total_classes integer not null default 0 check (total_classes >= 0),
  attended_classes integer not null default 0 check (attended_classes >= 0),
  required_percentage numeric(5,2) not null default 75 check (required_percentage >= 0 and required_percentage <= 100),
  color text not null default 'blue',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.subjects enable row level security;

create policy "Subjects: select own" on public.subjects for select using (auth.uid() = user_id);
create policy "Subjects: insert own" on public.subjects for insert with check (auth.uid() = user_id);
create policy "Subjects: update own" on public.subjects for update using (auth.uid() = user_id);
create policy "Subjects: delete own" on public.subjects for delete using (auth.uid() = user_id);

create index subjects_user_idx on public.subjects(user_id);

-- Planner logs
create table public.planner_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete cascade,
  action text not null,
  created_at timestamptz not null default now()
);
alter table public.planner_logs enable row level security;

create policy "Logs: select own" on public.planner_logs for select using (auth.uid() = user_id);
create policy "Logs: insert own" on public.planner_logs for insert with check (auth.uid() = user_id);
create policy "Logs: delete own" on public.planner_logs for delete using (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger subjects_touch before update on public.subjects
for each row execute function public.touch_updated_at();
create trigger profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();