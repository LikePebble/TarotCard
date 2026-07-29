import { getBrowserSupabase } from "@/lib/supabase/client";
import { setLocalEntitlements } from "@/lib/entitlements";

/** 서버의 엔타이틀먼트 + profiles.ad_free를 로컬 캐시에 반영한다(서버 권위, pull만).
 *  미설정·실패면 로컬을 그대로 둔다. isStale은 왕복 사이 세션이 바뀌었는지
 *  — 로그아웃 뒤 늦게 끝난 pull이 지워진 캐시를 되살리지 않게 한다(store/journal과 동일).
 *
 *  userId는 호출자가 넘긴다. 예전에는 여기서 `auth.getUser()`로 다시 물었는데,
 *  그것만으로 Auth 서버 왕복이 한 번 더 붙었다. 호출자는 이미 누구인지 안다. */
export async function pullRemoteEntitlements(
  userId: string,
  isStale: () => boolean = () => false,
): Promise<void> {
  const supabase = getBrowserSupabase();
  if (!supabase) return;

  const [ent, prof] = await Promise.all([
    supabase.from("entitlements").select("deck_id").eq("user_id", userId),
    supabase.from("profiles").select("ad_free").eq("id", userId).single(),
  ]);
  if (ent.error || prof.error || isStale()) return; // 실패·스테일이면 로컬 유지
  const ownedDeckIds = (ent.data ?? []).map((r) => r.deck_id as string);
  const adFree = prof.data?.ad_free === true;
  setLocalEntitlements({ ownedDeckIds, adFree });
}
