-- 고객 문의 원장. 메일은 전달 수단이고 이 테이블이 접수·재시도의 정본이다.

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('suggestion', 'account', 'other')),
  message text not null check (char_length(message) between 10 and 2000),
  response_contact text check (response_contact is null or char_length(response_contact) <= 200),
  account_email text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  provider_id text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists inquiries_user_created_idx
  on public.inquiries (user_id, created_at desc);

alter table public.inquiries enable row level security;
revoke all on public.inquiries from anon, authenticated;

-- 같은 사용자의 동시 요청은 advisory lock으로 직렬화하고, request_id 재시도는
-- 기존 행을 돌려준다. 브라우저가 테이블을 직접 읽거나 수정할 권한은 주지 않는다.
create or replace function public.create_inquiry(
  p_request_id uuid,
  p_category text,
  p_message text,
  p_response_contact text,
  p_account_email text
)
returns public.inquiries
language plpgsql
security definer
set search_path = ''
as $$
declare
  inquiry public.inquiries;
  caller uuid := (select auth.uid());
begin
  if caller is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(caller::text, 0));

  select * into inquiry
    from public.inquiries
    where request_id = p_request_id;
  if found then
    if inquiry.user_id <> caller then
      raise exception 'request_id_conflict' using errcode = '23505';
    end if;
    return inquiry;
  end if;

  if exists (
    select 1 from public.inquiries
    where user_id = caller and created_at > now() - interval '60 seconds'
  ) then
    raise exception 'inquiry_rate_limited' using errcode = 'P0001';
  end if;

  insert into public.inquiries (
    request_id, user_id, category, message, response_contact, account_email
  ) values (
    p_request_id, caller, p_category, p_message, nullif(p_response_contact, ''), p_account_email
  ) returning * into inquiry;
  return inquiry;
end;
$$;

revoke all on function public.create_inquiry(uuid, text, text, text, text) from public, anon;
grant execute on function public.create_inquiry(uuid, text, text, text, text) to authenticated;

-- service_role에서 월 1회 호출하는 1년 보유기간 정리 함수.
create or replace function public.delete_expired_inquiries()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count bigint;
begin
  delete from public.inquiries where created_at < now() - interval '1 year';
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.delete_expired_inquiries() from public, anon, authenticated;
grant execute on function public.delete_expired_inquiries() to service_role;
