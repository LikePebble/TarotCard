"use client";

import { useEffect, useState } from "react";

export type SyncState = "idle" | "syncing" | "ok" | "error";
export type InitialSyncState = "idle" | "syncing" | "ready";

export type SyncStatus = {
  state: SyncState;
  /** 로그인 직후 서버 기록·권한을 한 번 확인했는지. 일반 push 상태와 분리한다. */
  initialSync: InitialSyncState;
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

let status: SyncStatus = {
  state: "idle",
  initialSync: "idle",
  lastSyncedAt: readLastAt(),
};
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
    status = { state, initialSync: status.initialSync, lastSyncedAt: null };
  } else if (state === "ok") {
    const at = new Date().toISOString();
    status = { state, initialSync: status.initialSync, lastSyncedAt: at };
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(LAST_AT_KEY, at);
      } catch {
        // 표시용 값일 뿐이라 실패해도 무시한다.
      }
    }
  } else {
    status = { state, initialSync: status.initialSync, lastSyncedAt: status.lastSyncedAt };
  }
  notify();
}

/** 로그인 최초 병합 준비 상태. 이후의 주기 push/refresh와 섞지 않는다. */
export function setInitialSyncState(initialSync: InitialSyncState): void {
  status = { ...status, initialSync };
  notify();
}

/** 리딩처럼 서버 기록·권한에 기대는 화면이 잠정 상태를 노출하지 않게 하는 순수 판정. */
export function accountDataReady(options: {
  authLoading: boolean;
  signedIn: boolean;
  devSession: boolean;
  initialSync: InitialSyncState;
}): boolean {
  if (options.authLoading) return false;
  if (!options.signedIn || options.devSession) return true;
  return options.initialSync === "ready";
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
  status = { state: "idle", initialSync: "idle", lastSyncedAt: null };
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
    initialSync: "idle",
    lastSyncedAt: null,
  });
  useEffect(() => {
    setValue(getSyncStatus());
    return subscribeSyncStatus(() => setValue(getSyncStatus()));
  }, []);
  return value;
}
