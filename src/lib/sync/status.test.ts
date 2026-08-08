import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  accountDataReady,
  getSyncStatus,
  resetSyncStatus,
  setInitialSyncState,
  setSyncState,
  subscribeSyncStatus,
} from "@/lib/sync/status";

describe("sync status", () => {
  beforeEach(() => {
    resetSyncStatus();
  });

  it("상태를 기록하고 돌려준다", () => {
    setSyncState("syncing");
    expect(getSyncStatus().state).toBe("syncing");
  });

  it("ok이면 lastSyncedAt을 채운다", () => {
    expect(getSyncStatus().lastSyncedAt).toBeNull();
    setSyncState("ok");
    expect(getSyncStatus().lastSyncedAt).not.toBeNull();
  });

  it("error는 lastSyncedAt을 지우지 않는다", () => {
    setSyncState("ok");
    const at = getSyncStatus().lastSyncedAt;
    setSyncState("error");
    expect(getSyncStatus().lastSyncedAt).toBe(at);
    expect(getSyncStatus().state).toBe("error");
  });

  it("reset은 상태와 마지막 동기화 시각을 모두 지운다", () => {
    setSyncState("ok");
    expect(getSyncStatus().lastSyncedAt).not.toBeNull();
    const fn = vi.fn();
    const off = subscribeSyncStatus(fn);
    resetSyncStatus();
    off();
    expect(getSyncStatus()).toEqual({
      state: "idle",
      initialSync: "idle",
      lastSyncedAt: null,
    });
    expect(fn).toHaveBeenCalled();
  });

  it("구독자에게 상태 변화를 알린다", () => {
    const fn = vi.fn();
    const off = subscribeSyncStatus(fn);
    setSyncState("syncing");
    off();
    expect(fn).toHaveBeenCalled();
  });

  it("최초 병합 준비 상태는 일반 push 상태와 독립적이다", () => {
    setInitialSyncState("syncing");
    setSyncState("ok");
    expect(getSyncStatus().initialSync).toBe("syncing");
    setInitialSyncState("ready");
    expect(getSyncStatus().initialSync).toBe("ready");
  });

  it("로그인 계정만 최초 병합 완료를 기다린다", () => {
    expect(
      accountDataReady({
        authLoading: false,
        signedIn: false,
        devSession: false,
        initialSync: "idle",
      }),
    ).toBe(true);
    expect(
      accountDataReady({
        authLoading: false,
        signedIn: true,
        devSession: false,
        initialSync: "syncing",
      }),
    ).toBe(false);
    expect(
      accountDataReady({
        authLoading: false,
        signedIn: true,
        devSession: false,
        initialSync: "ready",
      }),
    ).toBe(true);
  });
});
