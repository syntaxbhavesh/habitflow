-- HabitFlow cloud storage. Run in the Supabase SQL editor.
create extension if not exists pgcrypto;

create table if not exists public.habits (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 1 and 120),
 category text not null default 'Personal',
 emoji text not null default '✨',
 target_per_week smallint not null default 7 check (target_per_week between 1 and 7),
 archived_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(id,user_id)
);
create table if not exists public.habit_checkins (
 id uuid primary key default gen_random_uuid(),
 habit_id uuid not null,
 user_id uuid not null references auth.users(id) on delete cascade,
 completed_on date not null,
 created_at timestamptz not null default now(),
 unique(habit_id, completed_on),
 foreign key (habit_id,user_id) references public.habits(id,user_id) on delete cascade
);
create table if not exists public.habit_goals (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(char_length(title) between 1 and 160),
 target integer not null default 1 check(target > 0),
 current integer not null default 0 check(current >= 0),
 due_on date,
 created_at timestamptz not null default now()
);
create table if not exists public.habit_journal (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 entry_date date not null,
 mood text not null default '🙂',
 note text not null default '',
 created_at timestamptz not null default now(),
 unique(user_id, entry_date)
);

alter table public.habits enable row level security;
alter table public.habit_checkins enable row level security;
alter table public.habit_goals enable row level security;
alter table public.habit_journal enable row level security;

drop policy if exists "Users manage own habits" on public.habits;
drop policy if exists "Users manage own checkins" on public.habit_checkins;
drop policy if exists "Users manage own goals" on public.habit_goals;
drop policy if exists "Users manage own journal" on public.habit_journal;
create policy "Users manage own habits" on public.habits for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "Users manage own checkins" on public.habit_checkins for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "Users manage own goals" on public.habit_goals for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "Users manage own journal" on public.habit_journal for all using(auth.uid()=user_id) with check(auth.uid()=user_id);

create index if not exists habits_user_id_idx on public.habits(user_id);
create index if not exists habit_checkins_user_date_idx on public.habit_checkins(user_id, completed_on desc);
create index if not exists habit_goals_user_id_idx on public.habit_goals(user_id);
create index if not exists habit_journal_user_date_idx on public.habit_journal(user_id, entry_date desc);
