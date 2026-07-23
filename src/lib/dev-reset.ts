"use client";

import { readingTypeOf } from "@/data/reading-types";
import { isoWeekOf, localDateOf } from "@/lib/period";
import {
  loadStore,
  setLocalStore,
  type ArcanaStore,
  type ReadingRecord,
} from "@/lib/store";
import { recomputeCollection } from "@/lib/sync/merge";

/** 개발 빌드에서만 테스트용 도구를 노출한다(배포본에는 나오지 않는다). */
export const isDevTools = process.env.NODE_ENV !== "production";

/**
 * 이 리딩이 지금 새 리딩을 막고 있는가(현재 주기에 속하는가).
 * 케이던스가 유형마다 달라 날짜만으로는 판단할 수 없다 — 오늘의 카드는 일,
 * 과거·현재·미래는 주 단위다. 유형의 케이던스로 현재 주기를 판정한다.
 */
function gatesDraw(reading: ReadingRecord, now: Date): boolean {
  const type = readingTypeOf(reading.spread);
  return type.cadenceUnit === "week"
    ? reading.isoWeek === isoWeekOf(now)
    : reading.localDate === localDateOf(now);
}

/**
 * 지금 잠금을 거는 리딩을 모두 지운다(테스트용).
 *
 * 케이던스 게이팅 때문에 UI를 다시 보려면 매번 localStorage를 손봐야 했다.
 * 오늘의 카드(일)와 과거·현재·미래(주)는 주기가 달라, 오늘 것만 지우면 이번
 * 주 다른 날에 뽑은 3장 리딩은 계속 잠긴 채 남았다. 유형별 현재 주기를 지워
 * 두 리딩을 모두 다시 연다. 도감은 리딩에서 파생되므로 남은 리딩으로
 * 재계산해 이중 집계나 유령 카드가 남지 않게 한다.
 */
export function resetCurrentReadings(): ArcanaStore {
  const now = new Date();
  const store = loadStore();
  const readings = store.readings.filter((r) => !gatesDraw(r, now));
  const next: ArcanaStore = {
    version: 2,
    collection: recomputeCollection(readings),
    readings,
  };
  setLocalStore(next); // 저장이 곧 알림이라 열려 있는 화면이 함께 갱신된다.
  return next;
}

/** 지금 잠금을 거는 리딩 수. 버튼을 보여줄지, 몇 건인지 표시하는 데 쓴다. */
export function gatingReadingCount(store: ArcanaStore | null): number {
  if (!store) return 0;
  const now = new Date();
  return store.readings.filter((r) => gatesDraw(r, now)).length;
}
