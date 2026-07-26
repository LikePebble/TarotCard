-- P1 foundation: 프로필 · 리딩 · 도감 · 일별 기록. 모두 RLS로 소유자만 접근.
-- Supabase SQL Editor 또는 `supabase db push`로 적용한다.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  display_name text,
  selected_deck_id text not null default 'classic',
  ad_free boolean not null default false
);

create table if not exists public.readings (
  id text not null, -- 클라 생성 id(신규는 uuid, 레거시 마이그레이션은 문자열). 사용자 범위 안에서의 upsert 멱등키(전역 유일 아님).
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  local_date date not null,
  iso_week text not null,
  spread text not null,
  type_id text not null,
  category text not null,
  deck_id text not null,
  cards jsonb not null,
  orientations jsonb not null,
  primary key (user_id, id)
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

create table if not exists public.entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  deck_id text not null, -- 소유한 프리미엄 덱. 클래식은 행 없이 암묵 소유.
  granted_at timestamptz not null default now(),
  source text not null default 'grant', -- 지급 출처. 실결제 붙으면 'purchase'|<pg>.
  primary key (user_id, deck_id)
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.readings enable row level security;
alter table public.collection enable row level security;
alter table public.journal_entries enable row level security;
alter table public.entitlements enable row level security;

-- 브라우저에 노출되는 anon key의 테이블 권한을 명시적으로 최소화한다.
-- service_role은 건드리지 않는다 — 지급·결제 같은 서버 작업은 그 역할만 사용한다.
revoke all on public.profiles from anon, authenticated;
revoke all on public.readings from anon, authenticated;
revoke all on public.collection from anon, authenticated;
revoke all on public.journal_entries from anon, authenticated;
revoke all on public.entitlements from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (display_name, selected_deck_id) on public.profiles to authenticated;
grant select, insert, update, delete on public.readings to authenticated;
grant select, insert, update, delete on public.collection to authenticated;
grant select, insert, update, delete on public.journal_entries to authenticated;
grant select on public.entitlements to authenticated;

create policy "own profile select" on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);
create policy "own profile update" on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
create policy "own readings" on public.readings
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "own collection" on public.collection
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "own journal" on public.journal_entries
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "own entitlements select" on public.entitlements
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- 신규 가입 시 profiles 행 자동 생성
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
