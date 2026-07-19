-- P1 foundation: 프로필 · 리딩 · 도감 · 일별 기록. 모두 RLS로 소유자만 접근.
-- Supabase SQL Editor 또는 `supabase db push`로 적용한다.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  display_name text,
  selected_deck_id text not null default 'classic'
);

create table if not exists public.readings (
  id text primary key, -- 클라 생성 id(신규는 uuid, 레거시 마이그레이션은 문자열). upsert 멱등키.
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  local_date date not null,
  iso_week text not null,
  spread text not null,
  type_id text not null,
  category text not null,
  deck_id text not null,
  cards jsonb not null,
  orientations jsonb not null
);
create index if not exists readings_user_idx on public.readings (user_id, local_date);

create table if not exists public.collection (
  user_id uuid not null references auth.users(id) on delete cascade,
  deck_id text not null,
  slug text not null,
  first_at timestamptz not null,
  count int not null default 1,
  primary key (user_id, deck_id, slug)
);

create table if not exists public.journal_entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, entry_date)
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.readings enable row level security;
alter table public.collection enable row level security;
alter table public.journal_entries enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own readings" on public.readings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own collection" on public.collection
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own journal" on public.journal_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 신규 가입 시 profiles 행 자동 생성
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
