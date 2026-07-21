import type { ArcanaStore, CollectionEntry, ReadingRecord } from "@/lib/store";
import type { JournalStore } from "@/lib/journal";

/** 리딩에서 덱별 도감을 재계산한다(firstAt=최초 at, count=등장 수). */
export function recomputeCollection(
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

/** 두 스토어를 병합: 리딩 union(id 기준), 도감은 재계산으로 정합성 보장. */
export function mergeStores(a: ArcanaStore, b: ArcanaStore): ArcanaStore {
  const byId = new Map<string, ReadingRecord>();
  for (const r of [...a.readings, ...b.readings]) {
    if (!byId.has(r.id)) byId.set(r.id, r);
  }
  const readings = [...byId.values()];
  return { version: 2, collection: recomputeCollection(readings), readings };
}

/**
 * 일기 병합: 날짜별 last-write-wins(updatedAt 기준).
 * 동률이면 로컬을 택한다(로그인 이후 로컬이 권위).
 * updatedAt은 항상 ISO 문자열이라 사전식 비교 = 시간순 비교.
 */
export function mergeJournals(
  local: JournalStore,
  remote: JournalStore,
): JournalStore {
  const merged: JournalStore = { ...remote };
  for (const [date, entry] of Object.entries(local)) {
    const other = merged[date];
    if (!other || entry.updatedAt >= other.updatedAt) merged[date] = entry;
  }
  return merged;
}
