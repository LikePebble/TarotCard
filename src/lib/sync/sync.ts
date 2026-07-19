import { loadStore, setLocalStore } from "@/lib/store";
import { mergeStores } from "@/lib/sync/merge";
import { pullRemoteStore, pushLocalStore } from "@/lib/sync/remote";

/**
 * 로그인 시 게스트→계정 병합.
 * 서버 pull → 로컬과 병합(리딩 union·도감 재계산) → 병합본을 로컬·서버에 반영.
 * 미설정이면 pull이 null이라 로컬을 그대로 두고 끝난다(안전한 no-op).
 */
export async function syncOnLogin(userId: string): Promise<void> {
  const local = loadStore();
  const remote = await pullRemoteStore(userId);
  const merged = remote ? mergeStores(local, remote) : local;
  setLocalStore(merged);
  await pushLocalStore(userId, merged);
}
