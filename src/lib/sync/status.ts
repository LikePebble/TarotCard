"use client";

import { useEffect, useState } from "react";

export type SyncState = "idle" | "syncing" | "ok" | "error";

export type SyncStatus = {
  state: SyncState;
  /** 마지막으로 push가 성공한 시각(ISO). 한 번도 없었으면 null. */
  lastSyncedAt: string | null;
};

const LAST_AT_KEY = "arcana.sync.lastAt";

function readLastAt(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LAST_AT_KEY);
  } catch {
    return null;
  }
}

let status: SyncStatus = { state: "idle", lastSyncedAt: readLastAt() };
const subscribers = new Set<() => void>();

export function getSyncStatus(): SyncStatus {
  return status;
}

export function subscribeSyncStatus(fn: () => void): () => void {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

/** 상태를 바꾸고 구독자에게 알린다. "ok"이면 lastSyncedAt을 지금으로. "idle"은 리셋. */
export function setSyncState(state: SyncState): void {
  if (state === "idle") {
    status = { state, lastSyncedAt: null };
  } else if (state === "ok") {
    const at = new Date().toISOString();
    status = { state, lastSyncedAt: at };
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(LAST_AT_KEY, at);
      } catch {
        // 표시용 값일 뿐이라 실패해도 무시한다.
      }
    }
  } else {
    status = { state, lastSyncedAt: status.lastSyncedAt };
  }
  notify();
}

function notify() {
  for (const fn of [...subscribers]) {
    try {
      fn();
    } catch (e) {
      console.error("[sync-status] 구독자 오류:", e);
    }
  }
}

/**
 * 상태와 저장된 마지막 동기화 시각을 모두 지운다(로그아웃).
 * 남겨두면 이 기기의 다음 계정이 이전 사용자의 "마지막 동기화"를 보게 된다.
 */
export function resetSyncStatus(): void {
  status = { state: "idle", lastSyncedAt: null };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(LAST_AT_KEY);
    } catch {
      // 표시용 값일 뿐이라 실패해도 무시한다.
    }
  }
  notify();
}

/** Client hook: 현재 동기화 상태. */
export function useSyncStatus(): SyncStatus {
  const [value, setValue] = useState<SyncStatus>({
    state: "idle",
    lastSyncedAt: null,
  });
  useEffect(() => {
    setValue(getSyncStatus());
    return subscribeSyncStatus(() => setValue(getSyncStatus()));
  }, []);
  return value;
}
