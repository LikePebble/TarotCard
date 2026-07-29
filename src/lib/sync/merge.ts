import type { ArcanaStore, CollectionEntry, ReadingRecord } from "@/lib/store";
import type { JournalStore } from "@/lib/journal";

/** 리딩에서 덱별 만남 기록을 재계산한다(firstAt=최초 at, count=등장 수). */
export function recomputeEncounters(
  readings: ReadingRecord[],
): ArcanaStore["collection"] {
  const byAt = [...readings].sort((x, y) => x.at.localeCompare(y.at));
  const collection: ArcanaStore["collection"] = {};
  for (const r of byAt) {
    const deck = (collection[r.deckId] ??= {} as Record<string, CollectionEntry>);
    for (const slug of r.cards) {
      const entry = deck[slug];
      deck[slug] = entry
        ? { firstAt: entry.firstAt, count: entry.count + 1 }
        : { firstAt: r.at, count: 1 };
    }
  }
  return collection;
}

/** 두 스토어를 병합: 리딩 union(id 기준), 만남 기록은 재계산으로 정합성 보장. */
export function mergeStores(a: ArcanaStore, b: ArcanaStore): ArcanaStore {
  const byId = new Map<string, ReadingRecord>();
  for (const r of [...a.readings, ...b.readings]) {
    if (!byId.has(r.id)) byId.set(r.id, r);
  }
  const readings = [...byId.values()];
  return { version: 2, collection: recomputeEncounters(readings), readings };
}

/**
 * 같은 날짜가 양쪽에 있을 때 무엇을 남길지 (S3a).
 *
 * - `"remote"` — 서버를 남긴다. **로그인 최초 병합**에서 쓴다. 계정에 쌓인
 *   기록이 이 기기에 우연히 남아 있던 게스트 기록보다 사용자가 기대하는
 *   "내 일기"에 가깝다.
 * - `"newer"` — `updatedAt`이 최신인 쪽. 동률이면 로컬. **로그인 이후 갱신**에서
 *   쓴다. 여기서까지 서버를 우선하면, 방금 이 기기에서 쓰고 아직 올라가지
 *   못한 글을 주기 갱신이 서버의 옛 사본으로 되돌린다.
 */
export type JournalConflictPolicy = "remote" | "newer";

/**
 * 일기 병합. 한쪽에만 있는 날짜는 그대로 채택하고, 양쪽에 있는 날짜만
 * policy로 가른다.
 *
 * policy는 선택 인자가 아니다. prune(S4a)과 같은 이유다 — 기본값을 두면
 * 호출부가 빠뜨렸을 때 조용히 다른 규칙으로 병합되고, 그 차이가 사용자 글의
 * 유실로 나타난다. updatedAt은 항상 ISO 문자열이라 사전식 비교 = 시간순 비교.
 */
export function mergeJournals(
  local: JournalStore,
  remote: JournalStore,
  policy: JournalConflictPolicy,
): JournalStore {
  const merged: JournalStore = { ...remote };
  for (const [date, entry] of Object.entries(local)) {
    const other = merged[date];
    if (!other) {
      merged[date] = entry;
      continue;
    }
    if (policy === "newer" && entry.updatedAt >= other.updatedAt) {
      merged[date] = entry;
    }
  }
  return merged;
}
