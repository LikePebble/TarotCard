"use client";

import { useCallback, useEffect, useState } from "react";
import { localDateOf } from "@/lib/period";
import { notifyLocal, subscribeLocal } from "@/lib/local-events";

/**
 * 방문 연속 기록.
 *
 * 78장 수집은 로그인 사용자 기준 평균 129일이 걸린다. 넉 달짜리 목표는 오늘
 * 하루의 동기가 되지 못하므로, **오늘 다시 온 사람에게만 생기는 것**을 하나
 * 만든다. 연속 일수는 그중 가장 값싸고 정직한 장치다 — 새 데이터를 만들지
 * 않고 "왔다"는 사실만 센다.
 *
 * 리딩 기록에서 파생하지 않고 따로 세는 이유: 티켓을 다 쓴 날에도 방문은
 * 방문이다. 뽑을 것이 없어서 그냥 들어와 본 날을 연속에서 끊으면, 정작
 * 돌아온 사람을 벌주는 셈이 된다.
 *
 * 같은 모듈이 재방문 계측(day_gap)도 겸한다. 재방문을 재는 일과 보여 주는
 * 일은 같은 사실을 쓰므로, 두 벌로 두면 반드시 어긋난다.
 */

export type VisitState = {
  /** 마지막으로 방문한 로컬 날짜(YYYY-MM-DD). 첫 방문이면 null. */
  lastVisit: string | null;
  /** 오늘까지 이어진 연속 방문 일수. */
  streak: number;
  /** 지금까지의 최장 연속 기록. */
  best: number;
};

export const EMPTY_VISIT: VisitState = { lastVisit: null, streak: 0, best: 0 };

export type VisitOutcome = {
  state: VisitState;
  /** 오늘 첫 방문인가. 같은 날 두 번째부터는 false. */
  isFirstToday: boolean;
  /** 마지막 방문에서 며칠 만인가. 첫 방문이면 null. */
  dayGap: number | null;
  /** 이 방문으로 연속이 끊겼나(하루를 건너뛰고 왔나). */
  streakBroken: boolean;
};

/** `YYYY-MM-DD` 두 개의 날짜 차(일). 로컬 날짜 문자열끼리만 비교한다. */
export function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86_400_000);
}

/**
 * 오늘 방문을 반영한 새 상태(순수).
 *
 * 같은 날 다시 부르면 상태를 그대로 돌려준다 — 하루에 여러 번 열어도 연속이
 * 늘지 않아야 한다. 미래 날짜가 저장돼 있으면(기기 시계를 되돌린 경우)
 * 연속을 1로 되돌린다. 늘려 주는 쪽으로 틀리면 기록이 거짓이 된다.
 */
export function withVisit(prev: VisitState, today: string): VisitOutcome {
  if (prev.lastVisit === null) {
    const state = { lastVisit: today, streak: 1, best: Math.max(1, prev.best) };
    return { state, isFirstToday: true, dayGap: null, streakBroken: false };
  }
  const gap = daysBetween(prev.lastVisit, today);
  if (gap === 0) {
    return { state: prev, isFirstToday: false, dayGap: 0, streakBroken: false };
  }
  const streak = gap === 1 ? prev.streak + 1 : 1;
  return {
    state: {
      lastVisit: today,
      streak,
      best: Math.max(prev.best, streak),
    },
    isFirstToday: true,
    dayGap: gap,
    streakBroken: gap !== 1,
  };
}

/** 연속이 오늘까지 살아 있는지. 어제까지만 왔으면 아직 살아 있다. */
export function streakAliveOn(state: VisitState, today: string): boolean {
  if (!state.lastVisit) return false;
  return daysBetween(state.lastVisit, today) <= 1;
}

/**
 * 연속 기록을 알리는 한 줄. 보여 줄 것이 없으면 null.
 *
 * 문구 규칙은 티켓과 같다 — 세는 일은 숫자에 맡기고 말은 받는 쪽으로 한다.
 * **끊긴 것을 나무라지 않는다.** 연속이 1로 돌아온 사람에게 "기록이
 * 끊겼습니다"라고 말하면, 돌아온 바로 그 행동을 벌주는 셈이 된다.
 *
 * 첫날에는 아예 말하지 않는다. 아직 이어 온 것이 없는데 "1일째"라고 세면
 * 숫자가 응원이 아니라 잔소리로 읽힌다.
 */
export type StreakNote = { text: string; isBest: boolean };

export function streakNoteOf(
  state: VisitState,
  today: string,
): StreakNote | null {
  if (!streakAliveOn(state, today)) return null;
  if (state.streak >= 2) {
    return {
      text: `${state.streak}일째 이어서 오고 계십니다`,
      // 최장과 나란한 순간에만 표시한다. 매일 "최장 기록"이라고 하면 말이 닳는다.
      isBest: state.streak >= 3 && state.streak === state.best,
    };
  }
  // 한 번이라도 이어 본 적이 있는 사람에게만 다시 시작을 알린다.
  if (state.best >= 2) return { text: "오늘부터 다시 이어 갑니다", isBest: false };
  return null;
}

/* ------------------------------------------------------------------ *
 * 저장 (부작용)
 * ------------------------------------------------------------------ */

const KEY = "arcana.visit.v1";

/** 임의 값을 안전한 VisitState로 정규화한다(순수). */
export function parseVisitState(raw: unknown): VisitState {
  if (!raw || typeof raw !== "object") return EMPTY_VISIT;
  const r = raw as Record<string, unknown>;
  const lastVisit =
    typeof r.lastVisit === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.lastVisit)
      ? r.lastVisit
      : null;
  const num = (v: unknown) =>
    typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
  if (!lastVisit) return EMPTY_VISIT;
  return { lastVisit, streak: num(r.streak), best: num(r.best) };
}

export function loadVisitState(): VisitState {
  if (typeof window === "undefined") return EMPTY_VISIT;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? parseVisitState(JSON.parse(raw)) : EMPTY_VISIT;
  } catch {
    return EMPTY_VISIT;
  }
}

function saveVisitState(state: VisitState): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // 저장이 막혀도 이번 방문의 표시는 정상이다. 다음 방문에 다시 센다.
    }
  }
  notifyLocal("visit");
}

/**
 * 오늘 방문을 기록한다. 같은 날 두 번째부터는 아무것도 쓰지 않는다.
 * 결과를 돌려주므로 호출부가 계측(dayGap)과 표시(streak)에 함께 쓸 수 있다.
 */
export function recordVisit(now: Date = new Date()): VisitOutcome {
  const outcome = withVisit(loadVisitState(), localDateOf(now));
  if (outcome.isFirstToday) saveVisitState(outcome.state);
  return outcome;
}

/** 이 기기의 방문 기록을 지운다(로그아웃). */
export function clearVisitState(): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      // 위와 같다.
    }
  }
  notifyLocal("visit");
}

/** Client 훅: 마운트 전에는 null(SSR 안전), 이후 이 기기의 방문 기록. */
export function useVisitStreak(): VisitState | null {
  const [state, setState] = useState<VisitState | null>(null);
  const refresh = useCallback(() => setState(loadVisitState()), []);
  useEffect(() => {
    refresh();
    return subscribeLocal("visit", refresh);
  }, [refresh]);
  return state;
}
