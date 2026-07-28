import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  flushPendingSync: vi.fn(),
  clearLocalStore: vi.fn(),
  clearLocalJournal: vi.fn(),
  clearLocalEntitlements: vi.fn(),
  resetSyncStatus: vi.fn(),
  authSignOut: vi.fn(),
  getSession: vi.fn(),
  getUser: vi.fn(),
  onAuthStateChange: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  isSupabaseConfigured: true,
  getBrowserSupabase: () => ({
    auth: {
      signOut: mocks.authSignOut,
      getSession: mocks.getSession,
      getUser: mocks.getUser,
      onAuthStateChange: mocks.onAuthStateChange,
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

/**
 * 세션 스토어는 모듈 상태를 들고 있다. 테스트마다 resetModules + 동적 import로
 * 새 인스턴스를 받아 순서 의존을 없앤다(pusher.test.ts와 같은 방식).
 */
async function loadSessionStore(initialUser: { id: string } | null = null) {
  vi.resetModules();
  const emitter: { fire?: (event: string, session: unknown) => void } = {};
  mocks.getSession.mockResolvedValue({
    data: { session: initialUser ? { user: initialUser } : null },
  });
  mocks.onAuthStateChange.mockImplementation(
    (cb: (event: string, session: unknown) => void) => {
      emitter.fire = cb;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    },
  );

  const mod = await import("@/lib/auth/session");
  mod.startAuth();
  await Promise.resolve(); // getSession 응답을 흘린다
  await Promise.resolve();

  return {
    mod,
    /** Supabase가 세션 이벤트를 쏜 것처럼 만든다. */
    emit(user: { id: string } | null) {
      emitter.fire?.("SIGNED_IN", user ? { user } : null);
    },
  };
}

describe("세션 스토어", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("훅이 몇 개든 Auth 구독은 한 번만 시작한다", async () => {
    const { mod } = await loadSessionStore();
    mod.startAuth();
    mod.startAuth();
    expect(mocks.onAuthStateChange).toHaveBeenCalledTimes(1);
    expect(mocks.getSession).toHaveBeenCalledTimes(1);
  });

  /*
   * getUser()는 매번 Auth 서버를 왕복한다. 이 훅은 한 화면에서 여러 컴포넌트가
   * 쓰므로 그 왕복이 화면 수만큼 늘어난다. 로컬 저장소를 읽는 getSession()으로
   * 충분한 이유는 session.ts의 주석에 있다.
   */
  it("세션 조회에 getUser 왕복을 쓰지 않는다", async () => {
    const { emit } = await loadSessionStore({ id: "u1" });
    emit({ id: "u1" });
    expect(mocks.getUser).not.toHaveBeenCalled();
  });

  /*
   * Supabase는 구독 즉시 INITIAL_SESSION을 쏘고 토큰 갱신·다른 탭의 로그인마다
   * 이벤트를 또 보낸다. 그때마다 새 user 객체를 흘려보내면 `[user]`에 걸린
   * effect가 전부 다시 도는데, SyncBridge에서는 그것이 setSyncUser 재호출이
   * 되어 진행 중인 서버 병합을 스테일로 만든다.
   */
  it("같은 사용자를 다시 알려와도 이전 객체를 그대로 둔다", async () => {
    const { mod, emit } = await loadSessionStore();
    emit({ id: "u1" });
    const first = mod.getAuthSnapshot().user;
    expect(first?.id).toBe("u1");

    emit({ id: "u1" }); // 같은 사용자, 다른 객체
    expect(mod.getAuthSnapshot().user).toBe(first);
  });

  it("달라진 것이 없으면 구독자에게 알리지 않는다", async () => {
    const { mod, emit } = await loadSessionStore();
    emit({ id: "u1" });

    const seen = vi.fn();
    const off = mod.subscribeAuth(seen);
    emit({ id: "u1" });
    emit({ id: "u1" });
    expect(seen).not.toHaveBeenCalled();

    emit({ id: "u2" });
    expect(seen).toHaveBeenCalledTimes(1);
    off();
  });

  it("사용자가 바뀌면 새 사용자로 바꾼다", async () => {
    const { mod, emit } = await loadSessionStore();
    emit({ id: "u1" });
    emit({ id: "u2" });
    expect(mod.getAuthSnapshot().user?.id).toBe("u2");
  });

  it("로그아웃 이벤트면 게스트로 돌아간다", async () => {
    const { mod, emit } = await loadSessionStore();
    emit({ id: "u1" });
    emit(null);
    expect(mod.getAuthSnapshot().user).toBeNull();
  });

  it("저장된 세션이 있으면 조회만으로 확정한다", async () => {
    const { mod } = await loadSessionStore({ id: "u1" });
    expect(mod.getAuthSnapshot()).toEqual({
      user: { id: "u1" },
      loading: false,
    });
  });

  it("세션이 없으면 게스트로 확정한다", async () => {
    const { mod } = await loadSessionStore(null);
    expect(mod.getAuthSnapshot()).toEqual({ user: null, loading: false });
  });
});

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
