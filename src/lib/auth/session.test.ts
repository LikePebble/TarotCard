import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  flushPendingSync: vi.fn(),
  clearLocalStore: vi.fn(),
  clearLocalJournal: vi.fn(),
  clearLocalEntitlements: vi.fn(),
  resetSyncStatus: vi.fn(),
  authSignOut: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  isSupabaseConfigured: true,
  getBrowserSupabase: () => ({
    auth: {
      signOut: mocks.authSignOut,
    },
  }),
}));

vi.mock("@/lib/sync/pusher", () => ({
  flushPendingSync: mocks.flushPendingSync,
}));

vi.mock("@/lib/store", () => ({
  clearLocalStore: mocks.clearLocalStore,
}));

vi.mock("@/lib/journal", () => ({
  clearLocalJournal: mocks.clearLocalJournal,
}));

vi.mock("@/lib/entitlements", () => ({
  clearLocalEntitlements: mocks.clearLocalEntitlements,
}));

vi.mock("@/lib/sync/status", () => ({
  resetSyncStatus: mocks.resetSyncStatus,
}));

import { signOutAndClear } from "@/lib/auth/session";

describe("signOutAndClear", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.flushPendingSync.mockResolvedValue(undefined);
    mocks.authSignOut.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("로그아웃이 성공한 뒤에만 이 기기의 계정 데이터를 지운다", async () => {
    await expect(signOutAndClear()).resolves.toBe(true);

    expect(mocks.authSignOut).toHaveBeenCalledOnce();
    expect(mocks.clearLocalStore).toHaveBeenCalledOnce();
    expect(mocks.clearLocalJournal).toHaveBeenCalledOnce();
    expect(mocks.clearLocalEntitlements).toHaveBeenCalledOnce();
    expect(mocks.resetSyncStatus).toHaveBeenCalledOnce();
  });

  it("로그아웃이 실패하면 로컬 기록을 유지하고 실패를 반환한다", async () => {
    mocks.authSignOut.mockResolvedValue({
      error: new Error("network unavailable"),
    });

    await expect(signOutAndClear()).resolves.toBe(false);

    expect(errorSpy).toHaveBeenCalledOnce();
    expect(mocks.clearLocalStore).not.toHaveBeenCalled();
    expect(mocks.clearLocalJournal).not.toHaveBeenCalled();
    expect(mocks.clearLocalEntitlements).not.toHaveBeenCalled();
    expect(mocks.resetSyncStatus).not.toHaveBeenCalled();
  });

  it("동기화 flush가 실패해도 로그아웃과 로컬 정리를 계속한다", async () => {
    mocks.flushPendingSync.mockRejectedValue(new Error("offline"));

    await expect(signOutAndClear()).resolves.toBe(true);

    expect(errorSpy).toHaveBeenCalledOnce();
    expect(mocks.authSignOut).toHaveBeenCalledOnce();
    expect(mocks.clearLocalStore).toHaveBeenCalledOnce();
  });
});
