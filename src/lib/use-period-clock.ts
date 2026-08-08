"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** 다음 로컬 자정까지 남은 밀리초. DST가 있는 환경도 Date 생성에 맡긴다. */
export function msUntilNextLocalDay(now: Date): number {
  const next = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0,
  );
  return Math.max(1, next.getTime() - now.getTime());
}

/** 자정·탭 복귀에 현재 시각을 갱신해 일/주 케이던스를 열린 화면에도 반영한다. */
export function usePeriodClock(): Date {
  const [now, setNow] = useState(() => new Date());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(() => setNow(new Date()), []);

  useEffect(() => {
    const schedule = () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      const current = new Date();
      timerRef.current = setTimeout(() => {
        refresh();
        schedule();
      }, msUntilNextLocalDay(current) + 50);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        refresh();
        schedule();
      }
    };

    schedule();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  return now;
}
