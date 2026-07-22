"use client";

import { localDateOf } from "@/lib/period";
import { loadStore, setLocalStore, type ArcanaStore } from "@/lib/store";
import { recomputeCollection } from "@/lib/sync/merge";

/** 개발 빌드에서만 테스트용 도구를 노출한다(배포본에는 나오지 않는다). */
export const isDevTools = process.env.NODE_ENV !== "production";

/**
 * 오늘 뽑은 리딩을 지운다(테스트용).
 *
 * 케이던스 게이팅 때문에 하루에 한 번밖에 못 뽑아서, UI를 보려면 매번
 * localStorage를 손봐야 했다. 도감은 리딩에서 파생되므로 남은 리딩으로
 * 재계산해 이중 집계나 유령 카드가 남지 않게 한다.
 *
 * 주 케이던스(과거·현재·미래)도 오늘 뽑은 것이면 함께 지워져 다시 열린다.
 */
export function resetTodayReadings(): ArcanaStore {
  const today = localDateOf(new Date());
  const store = loadStore();
  const readings = store.readings.filter((r) => r.localDate !== today);
  const next: ArcanaStore = {
    version: 2,
    collection: recomputeCollection(readings),
    readings,
  };
  setLocalStore(next); // 저장이 곧 알림이라 열려 있는 화면이 함께 갱신된다.
  return next;
}

/** 오늘 뽑은 리딩 수. 버튼을 보여줄지, 몇 건인지 표시하는 데 쓴다. */
export function todayReadingCount(store: ArcanaStore | null): number {
  if (!store) return 0;
  const today = localDateOf(new Date());
  return store.readings.filter((r) => r.localDate === today).length;
}
