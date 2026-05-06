create table public.timetable_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  period smallint not null check (period >= 0),
  subject_id uuid references public.subjects(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, day_of_week, period)
);

alter table public.timetable_slots enable row level security;

create policy "Slots: select own" on public.timetable_slots for select using (auth.uid() = user_id);
create policy "Slots: insert own" on public.timetable_slots for insert with check (auth.uid() = user_id);
create policy "Slots: update own" on public.timetable_slots for update using (auth.uid() = user_id);
create policy "Slots: delete own" on public.timetable_slots for delete using (auth.uid() = user_id);

create trigger timetable_slots_touch before update on public.timetable_slots
  for each row execute function public.touch_updated_at();