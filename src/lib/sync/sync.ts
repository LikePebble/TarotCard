import { loadStore, setLocalStore, type ArcanaStore } from "@/lib/store";
import { loadJournal, setLocalJournal, type JournalStore } from "@/lib/journal";
import {
  mergeJournals,
  mergeStores,
  type JournalConflictPolicy,
} from "@/lib/sync/merge";
import { pullRemoteStore, pushLocalStore } from "@/lib/sync/remote";
import {
  pullRemoteJournal,
  pushLocalJournal,
} from "@/lib/sync/journal-remote";
import type { SyncOutcome } from "@/lib/sync/outcome";

/**
 * 병합이 로컬에 새 리딩을 더했는지. mergeStores는 로컬을 포함하는 union이라
 * 개수가 같으면 서버가 보탠 것이 없다는 뜻이다(도감은 리딩에서 파생된다).
 *
 * 변화가 없을 때 쓰지 않는 이유: setLocalStore는 local-events를 울리고 그
 * 알림이 다시 push를 예약한다. 그대로 두면 주기 갱신마다 헛 push가 붙는다.
 */
function storeChanged(local: ArcanaStore, merged: ArcanaStore): boolean {
  return merged.readings.length !== local.readings.length;
}

/** 일기 병합 결과가 로컬과 다른지. 위와 같은 이유로 확인한다. */
function journalChanged(local: JournalStore, merged: JournalStore): boolean {
  const dates = Object.keys(merged);
  if (dates.length !== Object.keys(local).length) return true;
  return dates.some((d) => {
    const before = local[d];
    return (
      !before ||
      before.body !== merged[d].body ||
      before.updatedAt !== merged[d].updatedAt
    );
  });
}

/**
 * 서버 리딩을 로컬과 맞춘다.
 * 서버 pull → 로컬과 병합(리딩 union·도감 재계산) → 병합본을 로컬·서버에 반영.
 * 미설정이면 pull이 skipped라 로컬을 그대로 두고 끝난다(안전한 no-op).
 *
 * 로그인 직후의 게스트→계정 병합과 이후의 주기 갱신이 이 함수를 함께 쓴다.
 *
 * isStale은 왕복 사이에 세션이 바뀌었는지 알려준다. 로그아웃 뒤에 뒤늦게
 * 끝난 병합이 지워진 로컬을 되살리면 안 되므로, 로컬 쓰기 전에 확인한다.
 */
export async function reconcileStore(
  userId: string,
  isStale: () => boolean = () => false,
): Promise<SyncOutcome> {
  const pulled = await pullRemoteStore(userId);
  if (isStale()) return "skipped";
  const local = loadStore(); // 네트워크 왕복 후 최신 로컬을 읽는다(왕복 중 기록 유실 방지).
  const merged = pulled.outcome === "ok" ? mergeStores(local, pulled.data) : local;
  if (storeChanged(local, merged) && !setLocalStore(merged)) return "failed";
  const pushed = await pushLocalStore(userId, merged);
  return pulled.outcome === "failed" ? "failed" : pushed;
}

/** 일기 병합 결과. pullOk는 이후 세션에서 prune을 허용할지 결정한다. */
export type JournalReconcileResult = { outcome: SyncOutcome; pullOk: boolean };

/**
 * 서버 일기를 로컬과 맞춘다.
 * pull이 성공했을 때만 병합본이 서버의 상위집합임을 보장할 수 있고,
 * 그때만 push가 서버 행을 지운다. pull이 실패하면 올리기만 한다.
 *
 * conflict는 같은 날짜가 양쪽에 있을 때의 규칙이다. 로그인 최초 병합은
 * `"remote"`(서버 우선), 이후 갱신은 `"newer"`(LWW) — 이유는 merge.ts의
 * JournalConflictPolicy 주석에 있다.
 */
export async function reconcileJournal(
  userId: string,
  isStale: () => boolean,
  options: { conflict: JournalConflictPolicy },
): Promise<JournalReconcileResult> {
  const pulled = await pullRemoteJournal(userId);
  if (isStale()) return { outcome: "skipped", pullOk: false };
  const local = loadJournal();
  const pullOk = pulled.outcome === "ok";
  // pull이 실패했으면 서버에 무엇이 있는지 모른다 → 올리기만 하고 지우지는 않는다.
  const merged = pullOk
    ? mergeJournals(local, pulled.data, options.conflict)
    : local;
  if (journalChanged(local, merged)) setLocalJournal(merged);
  const pushed = await pushLocalJournal(userId, merged, { prune: pullOk });
  return { outcome: pulled.outcome === "failed" ? "failed" : pushed, pullOk };
}
