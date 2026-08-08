-- collection은 초기 스키마에 남아 있는 레거시 캐시다.
-- 현재 도감 만남 기록은 readings에서 파생하므로 신규 클라이언트 쓰기를 막는다.
-- 기존 행은 삭제하지 않아 롤백·운영 확인이 가능하게 유지한다.

revoke insert, update, delete on public.collection from authenticated;

drop policy if exists "own collection" on public.collection;
create policy "own collection select" on public.collection
  for select
  to authenticated
  using ((select auth.uid()) = user_id);
