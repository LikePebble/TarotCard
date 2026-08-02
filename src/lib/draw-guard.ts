import { useCallback, useEffect, useState } from "react";
import { isoWeekOf, localDateOf } from "@/lib/period";
import { notifyLocal, subscribeLocal } from "@/lib/local-events";
import type { ReadingRecord } from "@/lib/store";

const DRAW_GUARD_KEY = "arcana.draw-guard.v1";

type DeviceDrawGuard = {
  version: 1;
  day: string;
  oneSlotsUsed: number;
  week: string;
  threeUsed: boolean;
};

export type RetainedDrawUsage = {
  oneSlotsUsed: number;
  threeUsed: boolean;
};

const EMPTY_RETAINED_USAGE: RetainedDrawUsage = {
  oneSlotsUsed: 0,
  threeUsed: false,
};

function emptyGuard(at: Date): DeviceDrawGuard {
  return {
    version: 1,
    day: localDateOf(at),
    oneSlotsUsed: 0,
    week: isoWeekOf(at),
    threeUsed: false,
  };
}

function readGuard(at: Date): DeviceDrawGuard {
  const empty = emptyGuard(at);
  if (typeof window === "undefined") return empty;
  try {
    const raw = JSON.parse(window.localStorage.getItem(DRAW_GUARD_KEY) ?? "null") as Partial<DeviceDrawGuard> | null;
    if (!raw || raw.version !== 1) return empty;
    return {
      version: 1,
      day: raw.day === empty.day ? raw.day : empty.day,
      oneSlotsUsed:
        raw.day === empty.day &&
        typeof raw.oneSlotsUsed === "number" &&
        Number.isInteger(raw.oneSlotsUsed)
          ? Math.max(0, raw.oneSlotsUsed)
          : 0,
      week: raw.week === empty.week ? raw.week : empty.week,
      threeUsed: raw.week === empty.week && raw.threeUsed === true,
    };
  } catch {
    return empty;
  }
}

/** 로그아웃으로 리딩 본문은 지워도, 오늘·이번 주 사용량은 기기에서 유지한다. */
export function retainedDrawUsageAt(at: Date): RetainedDrawUsage {
  const guard = readGuard(at);
  return { oneSlotsUsed: guard.oneSlotsUsed, threeUsed: guard.threeUsed };
}

/** SSR과 첫 클라이언트 렌더는 빈 값으로 맞추고, 마운트 뒤 기기 표식을 읽는다. */
export function useRetainedDrawUsage(
  at: Date,
  enabled: boolean,
): RetainedDrawUsage {
  const [usage, setUsage] = useState<RetainedDrawUsage>(EMPTY_RETAINED_USAGE);
  const refresh = useCallback(() => {
    setUsage(enabled ? retainedDrawUsageAt(at) : EMPTY_RETAINED_USAGE);
  }, [at, enabled]);

  useEffect(() => {
    refresh();
    return subscribeLocal("draw-guard", refresh);
  }, [refresh]);

  return usage;
}

/** 개발·출시 검증용 현재 주기 초기화에서만 기기 케이던스 표식을 함께 비운다. */
export function resetRetainedDrawUsage(at = new Date()): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAW_GUARD_KEY, JSON.stringify(emptyGuard(at)));
    notifyLocal("draw-guard");
  } catch {
    // 테스트 도구의 저장소 초기화 실패가 리딩 스토어 초기화를 막지는 않는다.
  }
}

/** 성공한 리딩을 즉시 카운터에 반영해, 여러 번의 로그인·로그아웃에도 누락하지 않는다. */
export function retainRecordedDrawUsage(
  spread: ReadingRecord["spread"],
  at: Date,
): void {
  if (typeof window === "undefined") return;
  const current = readGuard(at);
  const next: DeviceDrawGuard = {
    ...current,
    oneSlotsUsed:
      spread === "one" ? current.oneSlotsUsed + 1 : current.oneSlotsUsed,
    threeUsed: spread === "three" || current.threeUsed,
  };
  try {
    window.localStorage.setItem(DRAW_GUARD_KEY, JSON.stringify(next));
    notifyLocal("draw-guard");
  } catch {
    // 저장소가 막힌 환경에서는 리딩 자체를 중단하지 않는다.
  }
}

/**
 * 공개 기기에서 이전 계정의 카드·주제·결과를 남기지 않으면서, 로그아웃으로
 * 케이던스가 되돌아가는 우회를 막는다. 날짜와 슬롯 수·주간 사용 여부만 저장한다.
 */
export function retainDrawUsageOnSignOut(readings: ReadingRecord[], at = new Date()): void {
  if (typeof window === "undefined") return;
  const current = readGuard(at);
  const day = localDateOf(at);
  const week = isoWeekOf(at);
  const oneSlotsUsed = new Set(
    readings
      .filter((reading) => reading.spread === "one" && reading.localDate === day)
      .map((reading) => reading.category),
  ).size;
  const threeUsed = readings.some(
    (reading) => reading.spread === "three" && reading.isoWeek === week,
  );
  const next: DeviceDrawGuard = {
    version: 1,
    day,
    oneSlotsUsed: Math.max(current.oneSlotsUsed, oneSlotsUsed),
    week,
    threeUsed: current.threeUsed || threeUsed,
  };
  try {
    window.localStorage.setItem(DRAW_GUARD_KEY, JSON.stringify(next));
    notifyLocal("draw-guard");
  } catch {
    // 저장소가 막힌 환경에서는 기존 로그아웃 보안 경계를 유지한다.
  }
}
