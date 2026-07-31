-- 대문 팝업: 로그인 전에도 공지를 보여 주기 위한 공개 팝업 테이블.
-- anon이 읽을 수 있는 첫 테이블이므로 개인 정보는 절대 넣지 않는다.

create table if not exists public.popups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,          -- 관리용 이름. 화면에 노출하지 않는다
  image_path text not null,     -- Storage 'popups' 버킷 기준 경로 (예: '2026-08-event.png')
  image_alt text not null,       -- 접근성 대체 텍스트. 필수로 둔다
  link_url text,                -- 이미지 클릭 시 이동할 주소. null이면 클릭 불가
  starts_at timestamptz,        -- null이면 즉시 시작
  ends_at timestamptz,          -- null이면 무기한
  is_active boolean not null default true
);

alter table public.popups enable row level security;
revoke all on public.popups from anon, authenticated;
grant select on public.popups to anon, authenticated;

create policy "active popups are public" on public.popups
  for select
  to anon, authenticated
  using (
    is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at > now())
  );

-- 운영 절차:
-- 1. Supabase Storage에 public 버킷 'popups'를 만든다.
-- 2. 대시보드에서 이미지를 업로드하고, 파일 경로(파일명)를 image_path에 넣는다.
-- 3. 새 공지를 시작할 때는 항상 새 행을 insert한다. 기존 행의 id를 재사용하거나 수정하지 않는다.
--    같은 id를 재사용하면 '다시 보지 않기'를 누른 사용자는 새 공지를 영원히 보지 못한다.
