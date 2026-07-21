import { loadStore, setLocalStore } from "@/lib/store";
import { loadJournal, setLocalJournal } from "@/lib/journal";
import { mergeJournals, mergeStores } from "@/lib/sync/merge";
import { pullRemoteStore, pushLocalStore } from "@/lib/sync/remote";
import {
  pullRemoteJournal,
  pushLocalJournal,
} from "@/lib/sync/journal-remote";

/**
 * 로그인 시 게스트→계정 병합.
 * 서버 pull → 로컬과 병합(리딩 union·도감 재계산) → 병합본을 로컬·서버에 반영.
 * 미설정이면 pull이 null이라 로컬을 그대로 두고 끝난다(안전한 no-op).
 */
export async function syncOnLogin(userId: string): Promise<void> {
  const remote = await pullRemoteStore(userId);
  const local = loadStore(); // 네트워크 왕복 후 최신 로컬을 읽는다(왕복 중 기록 유실 방지).
  const merged = remote ? mergeStores(local, remote) : local;
  setLocalStore(merged);
  await pushLocalStore(userId, merged);
}

/**
 * 로그인 시 일기 병합. 날짜별 last-write-wins.
 * 병합본은 서버의 상위집합이므로, 이때의 push는 서버 행을 지우지 않는다.
 */
export async function syncJournalOnLogin(userId: string): Promise<void> {
  const remote = await pullRemoteJournal(userId);
  const local = loadJournal();
  const merged = remote ? mergeJournals(local, remote) : local;
  setLocalJournal(merged);
  await pushLocalJournal(userId, merged);
}
