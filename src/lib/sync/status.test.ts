import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getSyncStatus,
  setSyncState,
  subscribeSyncStatus,
} from "@/lib/sync/status";

describe("sync status", () => {
  beforeEach(() => {
    setSyncState("idle");
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

  it("구독자에게 상태 변화를 알린다", () => {
    const fn = vi.fn();
    const off = subscribeSyncStatus(fn);
    setSyncState("syncing");
    off();
    expect(fn).toHaveBeenCalled();
  });
});
