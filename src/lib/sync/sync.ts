import { loadStore, setLocalStore } from "@/lib/store";
import { loadJournal, setLocalJournal } from "@/lib/journal";
import { mergeJournals, mergeStores } from "@/lib/sync/merge";
import { pullRemoteStore, pushLocalStore } from "@/lib/sync/remote";
import {
  pullRemoteJournal,
  pushLocalJournal,
} from "@/lib/sync/journal-remote";
import type { SyncOutcome } from "@/lib/sync/outcome";

/**
 * 로그인 시 게스트→계정 병합.
 * 서버 pull → 로컬과 병합(리딩 union·도감 재계산) → 병합본을 로컬·서버에 반영.
 * 미설정이면 pull이 skipped라 로컬을 그대로 두고 끝난다(안전한 no-op).
 *
 * isStale은 왕복 사이에 세션이 바뀌었는지 알려준다. 로그아웃 뒤에 뒤늦게
 * 끝난 병합이 지워진 로컬을 되살리면 안 되므로, 로컬 쓰기 전에 확인한다.
 */
export async function syncOnLogin(
  userId: string,
  isStale: () => boolean = () => false,
): Promise<SyncOutcome> {
  const pulled = await pullRemoteStore(userId);
  if (isStale()) return "skipped";
  const local = loadStore(); // 네트워크 왕복 후 최신 로컬을 읽는다(왕복 중 기록 유실 방지).
  const merged = pulled.outcome === "ok" ? mergeStores(local, pulled.data) : local;
  setLocalStore(merged);
  const pushed = await pushLocalStore(userId, merged);
  return pulled.outcome === "failed" ? "failed" : pushed;
}

/** 로그인 일기 병합 결과. pullOk는 이후 세션에서 prune을 허용할지 결정한다. */
export type JournalLoginResult = { outcome: SyncOutcome; pullOk: boolean };

/**
 * 로그인 시 일기 병합. 날짜별 last-write-wins.
 * pull이 성공했을 때만 병합본이 서버의 상위집합임을 보장할 수 있고,
 * 그때만 push가 서버 행을 지운다. pull이 실패하면 올리기만 한다.
 */
export async function syncJournalOnLogin(
  userId: string,
  isStale: () => boolean = () => false,
): Promise<JournalLoginResult> {
  const pulled = await pullRemoteJournal(userId);
  if (isStale()) return { outcome: "skipped", pullOk: false };
  const local = loadJournal();
  const pullOk = pulled.outcome === "ok";
  // pull이 실패했으면 서버에 무엇이 있는지 모른다 → 올리기만 하고 지우지는 않는다.
  const merged = pullOk ? mergeJournals(local, pulled.data) : local;
  setLocalJournal(merged);
  const pushed = await pushLocalJournal(userId, merged, { prune: pullOk });
  return { outcome: pulled.outcome === "failed" ? "failed" : pushed, pullOk };
}
