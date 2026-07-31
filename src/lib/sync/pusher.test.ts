import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// pusher는 모듈 수준 상태를 들고 있다. 테스트마다 resetModules + 동적 import로
// 새 인스턴스를 받아 순서 의존을 없앤다.
vi.mock("@/lib/store", () => ({
  loadStore: vi.fn(() => ({ version: 2, collection: {}, readings: [] })),
}));
vi.mock("@/lib/journal", () => ({
  loadJournal: vi.fn(() => ({})),
}));
vi.mock("@/lib/sync/remote", () => ({
  pullRemoteStore: vi.fn(async () => ({ outcome: "skipped" })),
  pushLocalStore: vi.fn(async () => "ok"),
}));
vi.mock("@/lib/sync/journal-remote", () => ({
  pullRemoteJournal: vi.fn(async () => ({ outcome: "skipped" })),
  pushLocalJournal: vi.fn(async () => "ok"),
}));
vi.mock("@/lib/sync/sync", () => ({
  reconcileStore: vi.fn(async () => "ok"),
  reconcileJournal: vi.fn(async () => ({ outcome: "ok", pullOk: true })),
}));
// 모킹하지 않으면 실모듈이 Supabase 미설정으로 조용히 no-op이 되어, 이 갈래를
// 통째로 지워도 테스트가 전부 통과한다.
vi.mock("@/lib/sync/entitlements-remote", () => ({
  pullRemoteEntitlements: vi.fn(async () => {}),
}));
// 같은 이유로 덱도 모킹한다. 실모듈은 store(localStorage)와 Supabase를 함께
// 만지므로 node 환경에서 조용히 no-op이 된다.
vi.mock("@/lib/sync/deck-remote", () => ({
  reconcileSelectedDeck: vi.fn(async () => "ok"),
  pushLocalDeck: vi.fn(async () => "ok"),
  forgetPushedDeck: vi.fn(),
}));
// 이 표식은 localStorage에 있고 테스트 환경은 node라 window가 없다.
// 모킹해서 "이미 병합한 기기"를 직접 만든다.
vi.mock("@/lib/sync/first-merge", () => ({
  hasMergedWith: vi.fn(() => false),
  rememberMergedWith: vi.fn(),
}));

async function load() {
  vi.resetModules();
  const store = await import("@/lib/store");
  const journal = await import("@/lib/journal");
  const remote = await import("@/lib/sync/remote");
  const journalRemote = await import("@/lib/sync/journal-remote");
  const sync = await import("@/lib/sync/sync");
  const entitlements = await import("@/lib/sync/entitlements-remote");
  const deck = await import("@/lib/sync/deck-remote");
  const status = await import("@/lib/sync/status");
  const firstMerge = await import("@/lib/sync/first-merge");
  const pusher = await import("@/lib/sync/pusher");

  // resetAllMocks가 구현까지 지우므로 기본 동작을 매번 다시 심는다.
  vi.mocked(store.loadStore).mockReturnValue({
    version: 2,
    collection: {},
    readings: [],
  });
  vi.mocked(journal.loadJournal).mockReturnValue({});
  vi.mocked(remote.pullRemoteStore).mockResolvedValue({ outcome: "skipped" });
  vi.mocked(remote.pushLocalStore).mockResolvedValue("ok");
  vi.mocked(journalRemote.pullRemoteJournal).mockResolvedValue({
    outcome: "skipped",
  });
  vi.mocked(journalRemote.pushLocalJournal).mockResolvedValue("ok");
  vi.mocked(sync.reconcileStore).mockResolvedValue("ok");
  vi.mocked(sync.reconcileJournal).mockResolvedValue({
    outcome: "ok",
    pullOk: true,
  });
  vi.mocked(entitlements.pullRemoteEntitlements).mockResolvedValue(undefined);
  vi.mocked(deck.reconcileSelectedDeck).mockResolvedValue("ok");
  vi.mocked(deck.pushLocalDeck).mockResolvedValue("ok");
  vi.mocked(firstMerge.hasMergedWith).mockReturnValue(false);

  return {
    store,
    journal,
    remote,
    journalRemote,
    sync,
    entitlements,
    deck,
    status,
    firstMerge,
    pusher,
  };
}

/** 대기 중인 마이크로태스크를 모두 흘린다(디바운스 타이머는 건드리지 않는다). */
async function settle() {
  await vi.advanceTimersByTimeAsync(0);
  await vi.advanceTimersByTimeAsync(0);
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

type Loaded = Awaited<ReturnType<typeof load>>;

/** 로그인 병합까지 끝낸 상태로 만든다. */
async function loggedIn(userId = "u1"): Promise<Loaded> {
  const mods = await load();
  mods.pusher.setSyncUser(userId);
  await settle();
  return mods;
}

describe("pusher", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // 모킹된 모듈 인스턴스는 resetModules를 넘어 살아남는다. 호출 기록과
    // 테스트별 구현을 여기서 되돌려 순서 의존을 없앤다.
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("게스트면 예약도 push도 하지 않는다", async () => {
    const { pusher, remote, journalRemote } = await load();
    pusher.schedulePush();
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(remote.pushLocalStore).not.toHaveBeenCalled();
    expect(journalRemote.pushLocalJournal).not.toHaveBeenCalled();
  });

  it("연속 예약을 한 번의 push로 합친다", async () => {
    const { pusher, remote } = await loggedIn();
    pusher.schedulePush();
    pusher.schedulePush();
    pusher.schedulePush();
    await vi.advanceTimersByTimeAsync(2000);
    await settle();
    expect(remote.pushLocalStore).toHaveBeenCalledTimes(1);
  });

  it("push 중에 들어온 변경을 삼키지 않는다", async () => {
    const { pusher, remote } = await loggedIn();
    const gate = deferred<"ok">();
    vi.mocked(remote.pushLocalStore).mockReturnValueOnce(gate.promise);

    pusher.schedulePush();
    await vi.advanceTimersByTimeAsync(2000);
    expect(remote.pushLocalStore).toHaveBeenCalledTimes(1);

    // 진행 중인 push가 끝나기 전에 도착한 변경.
    pusher.schedulePush();
    await settle();
    expect(remote.pushLocalStore).toHaveBeenCalledTimes(1);

    gate.resolve("ok");
    await settle();
    await vi.advanceTimersByTimeAsync(2000);
    await settle();
    expect(remote.pushLocalStore).toHaveBeenCalledTimes(2);
  });

  it("push가 끝나지 않아도 flush는 타임아웃 안에 반환한다", async () => {
    const { pusher, remote } = await loggedIn();
    vi.mocked(remote.pushLocalStore).mockReturnValueOnce(
      new Promise(() => {}), // 영원히 안 끝나는 push
    );
    const flushed = pusher.flushPendingSync(50);
    await vi.advanceTimersByTimeAsync(50);
    await expect(flushed).resolves.toBeUndefined();
  });

  it("push 도중 로컬이 비워져도 처음 뜬 스냅샷을 올린다", async () => {
    const { pusher, remote, journalRemote, journal } = await loggedIn();
    const entries = { "2026-07-22": { body: "메모", updatedAt: "2026-07-22" } };
    vi.mocked(journal.loadJournal).mockReturnValue(entries);
    const gate = deferred<"ok">();
    vi.mocked(remote.pushLocalStore).mockReturnValueOnce(gate.promise);

    pusher.schedulePush();
    await vi.advanceTimersByTimeAsync(2000);
    // 로그아웃이 push 사이에 localStorage를 비운 상황.
    vi.mocked(journal.loadJournal).mockReturnValue({});
    gate.resolve("ok");
    await settle();

    expect(journalRemote.pushLocalJournal).toHaveBeenCalledWith(
      "u1",
      entries,
      { prune: true },
    );
  });

  it("push가 실패하면 상태가 error가 된다", async () => {
    const { pusher, remote, status } = await loggedIn();
    vi.mocked(remote.pushLocalStore).mockResolvedValueOnce("failed");
    pusher.schedulePush();
    await vi.advanceTimersByTimeAsync(2000);
    await settle();
    expect(status.getSyncStatus().state).toBe("error");
  });

  it("일기 push가 실패해도 상태가 error가 된다", async () => {
    const { pusher, journalRemote, status } = await loggedIn();
    vi.mocked(journalRemote.pushLocalJournal).mockResolvedValueOnce("failed");
    pusher.schedulePush();
    await vi.advanceTimersByTimeAsync(2000);
    await settle();
    expect(status.getSyncStatus().state).toBe("error");
  });

  it("둘 다 성공하면 상태가 ok가 된다", async () => {
    const { pusher, status } = await loggedIn();
    pusher.schedulePush();
    await vi.advanceTimersByTimeAsync(2000);
    await settle();
    expect(status.getSyncStatus().state).toBe("ok");
  });

  it("로그인 pull이 실패했으면 이후 push가 서버 행을 지우지 않는다", async () => {
    const mods = await load();
    vi.mocked(mods.sync.reconcileJournal).mockResolvedValue({
      outcome: "failed",
      pullOk: false,
    });
    mods.pusher.setSyncUser("u1");
    await settle();

    mods.pusher.schedulePush();
    await vi.advanceTimersByTimeAsync(2000);
    await settle();
    expect(mods.journalRemote.pushLocalJournal).toHaveBeenCalledWith(
      "u1",
      {},
      { prune: false },
    );
  });

  it("로그인 pull이 성공했으면 push가 서버 행을 정리한다", async () => {
    const { pusher, journalRemote } = await loggedIn();
    pusher.schedulePush();
    await vi.advanceTimersByTimeAsync(2000);
    await settle();
    expect(journalRemote.pushLocalJournal).toHaveBeenCalledWith(
      "u1",
      {},
      { prune: true },
    );
  });

  it("같은 id로는 한 번만 병합하고, 로그아웃 후 재로그인이면 다시 병합한다", async () => {
    const { pusher, sync } = await load();
    pusher.setSyncUser("u1");
    pusher.setSyncUser("u1");
    await settle();
    expect(sync.reconcileStore).toHaveBeenCalledTimes(1);

    pusher.setSyncUser(null);
    pusher.setSyncUser("u1");
    await settle();
    expect(sync.reconcileStore).toHaveBeenCalledTimes(2);
  });

  /*
   * Supabase는 한 번의 로그인에도 setSyncUser를 여러 번 부르게 만든다
   * (구독 즉시 INITIAL_SESSION, 뒤이어 세션 조회 응답, 이후 토큰 갱신).
   * 그 중복 통지가 진행 중인 병합을 스테일로 만들면 pull 결과가 통째로
   * 버려지고, mergedFor 때문에 재시도도 되지 않는다.
   */
  it("같은 사용자로 다시 알려와도 진행 중인 병합을 스테일로 만들지 않는다", async () => {
    const mods = await load();
    let staleSeen: boolean | null = null;
    vi.mocked(mods.sync.reconcileStore).mockImplementation(
      async (_userId, isStale) => {
        mods.pusher.setSyncUser("u1"); // 왕복 도중 도착한 중복 통지
        staleSeen = isStale?.() ?? null;
        return "ok";
      },
    );

    mods.pusher.setSyncUser("u1");
    await settle();

    expect(staleSeen).toBe(false);
    expect(mods.sync.reconcileStore).toHaveBeenCalledTimes(1);
    expect(mods.sync.reconcileJournal).toHaveBeenCalledTimes(1);
    expect(mods.status.getSyncStatus().state).toBe("ok");
  });

  it("다른 사용자로 갈아타면 진행 중인 병합을 스테일로 만든다", async () => {
    const mods = await load();
    let staleSeen: boolean | null = null;
    vi.mocked(mods.sync.reconcileStore).mockImplementationOnce(
      async (_userId, isStale) => {
        mods.pusher.setSyncUser("u2");
        staleSeen = isStale?.() ?? null;
        return "ok";
      },
    );

    mods.pusher.setSyncUser("u1");
    await settle();

    expect(staleSeen).toBe(true);
    // u1 병합은 중단됐고, 대신 u2 병합이 돈다.
    expect(mods.sync.reconcileJournal).toHaveBeenCalledWith(
      "u2",
      expect.any(Function),
      { conflict: "remote" },
    );
  });

  it("로그아웃하면 진행 중인 병합을 스테일로 만든다", async () => {
    const mods = await load();
    let staleSeen: boolean | null = null;
    vi.mocked(mods.sync.reconcileStore).mockImplementationOnce(
      async (_userId, isStale) => {
        mods.pusher.setSyncUser(null);
        staleSeen = isStale?.() ?? null;
        return "ok";
      },
    );

    mods.pusher.setSyncUser("u1");
    await settle();

    expect(staleSeen).toBe(true);
  });

  it("병합이 예외로 끝나면 다음 통지에서 다시 시도한다", async () => {
    const mods = await load();
    vi.mocked(mods.sync.reconcileStore).mockRejectedValueOnce(
      new Error("네트워크 끊김"),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    mods.pusher.setSyncUser("u1");
    await settle();
    expect(mods.status.getSyncStatus().state).toBe("error");

    mods.pusher.setSyncUser("u1");
    await settle();
    expect(mods.sync.reconcileStore).toHaveBeenCalledTimes(2);
    expect(mods.status.getSyncStatus().state).toBe("ok");
  });
});

describe("refreshFromRemote", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("게스트면 아무 일도 하지 않는다", async () => {
    const { pusher, sync } = await load();
    expect(pusher.refreshFromRemote({ force: true })).toBe(false);
    await settle();
    expect(sync.reconcileStore).not.toHaveBeenCalled();
  });

  it("서버를 다시 읽어 로컬과 맞춘다", async () => {
    const { pusher, sync } = await loggedIn();
    expect(sync.reconcileStore).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(30_000);
    expect(pusher.refreshFromRemote()).toBe(true);
    await settle();

    expect(sync.reconcileStore).toHaveBeenCalledTimes(2);
    expect(sync.reconcileJournal).toHaveBeenCalledTimes(2);
  });

  it("최소 간격 안에서는 건너뛴다", async () => {
    const { pusher, sync } = await loggedIn();
    await vi.advanceTimersByTimeAsync(1000);
    expect(pusher.refreshFromRemote()).toBe(false);
    await settle();
    expect(sync.reconcileStore).toHaveBeenCalledTimes(1);
  });

  it("force면 최소 간격을 무시한다(네트워크 복귀)", async () => {
    const { pusher, sync } = await loggedIn();
    await vi.advanceTimersByTimeAsync(1000);
    expect(pusher.refreshFromRemote({ force: true })).toBe(true);
    await settle();
    expect(sync.reconcileStore).toHaveBeenCalledTimes(2);
  });

  it("진행 중인 동기화가 있으면 건너뛴다", async () => {
    const { pusher, remote, sync } = await loggedIn();
    const gate = deferred<"ok">();
    vi.mocked(remote.pushLocalStore).mockReturnValueOnce(gate.promise);

    pusher.schedulePush();
    await vi.advanceTimersByTimeAsync(2000);
    expect(pusher.refreshFromRemote({ force: true })).toBe(false);
    expect(sync.reconcileStore).toHaveBeenCalledTimes(1);

    gate.resolve("ok");
    await settle();
  });

  /*
   * 로그인 순간에는 계정에 쌓인 기록이 이 기기의 게스트 기록보다 우선한다.
   * 이후 갱신에서까지 서버를 우선하면, 방금 이 기기에서 쓰고 아직 올라가지
   * 못한 글을 5분 주기 갱신이 서버의 옛 사본으로 되돌린다.
   */
  it("로그인 최초 병합은 일기 충돌에서 서버를 우선한다", async () => {
    const { sync } = await loggedIn();
    expect(sync.reconcileJournal).toHaveBeenCalledWith(
      "u1",
      expect.any(Function),
      { conflict: "remote" },
    );
  });

  it("이후 갱신은 최신 기록을 우선한다", async () => {
    const { pusher, sync } = await loggedIn();
    await vi.advanceTimersByTimeAsync(30_000);
    pusher.refreshFromRemote();
    await settle();

    expect(sync.reconcileJournal).toHaveBeenLastCalledWith(
      "u1",
      expect.any(Function),
      { conflict: "newer" },
    );
  });

  it("리딩·일기·엔타이틀먼트를 직렬이 아니라 함께 띄운다", async () => {
    const mods = await load();
    const order: string[] = [];
    vi.mocked(mods.sync.reconcileStore).mockImplementation(async () => {
      order.push("store");
      return "ok";
    });
    vi.mocked(mods.sync.reconcileJournal).mockImplementation(async () => {
      order.push("journal");
      return { outcome: "ok", pullOk: true };
    });
    vi.mocked(mods.entitlements.pullRemoteEntitlements).mockImplementation(
      async () => {
        order.push("entitlements");
      },
    );

    mods.pusher.setSyncUser("u1");
    // 첫 await 이전에 셋 다 시작돼 있어야 한다. 직렬이면 store 하나뿐이다.
    expect(order).toEqual(["store", "journal", "entitlements"]);
    await settle();
  });

  it("엔타이틀먼트를 이미 아는 userId로 pull한다", async () => {
    const { entitlements } = await loggedIn();
    // 이 단언이 없으면 이 갈래를 통째로 지워도 전체 테스트가 통과한다.
    expect(entitlements.pullRemoteEntitlements).toHaveBeenCalledWith(
      "u1",
      expect.any(Function),
    );
  });

  it("대기 중이던 push 예약을 흡수한다", async () => {
    const { pusher, remote, sync } = await loggedIn();
    await vi.advanceTimersByTimeAsync(30_000);

    pusher.schedulePush(); // 2초 뒤 발화 예정
    expect(pusher.refreshFromRemote()).toBe(true);
    await vi.advanceTimersByTimeAsync(2000);
    await settle();

    // 갱신이 로컬 스냅샷을 다시 읽어 올리므로 예약돼 있던 push는 중복이다.
    expect(sync.reconcileStore).toHaveBeenCalledTimes(2);
    expect(remote.pushLocalStore).not.toHaveBeenCalled();
  });
});

/*
 * S3a의 "최초"는 이 기기가 이 계정과 처음 만나는 것이지 페이지를 새로 여는
 * 것이 아니다. 이 구분이 없으면 세션 복원마다 서버 우선 병합이 돌아, 저장
 * 버튼을 누르고 2초 안에 탭을 닫은 사용자의 글이 서버 옛 사본으로 덮인다.
 */
describe("로그인 최초 병합의 판정", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("처음 만나는 계정이면 서버 우선으로 병합한다", async () => {
    const { sync, firstMerge } = await loggedIn();
    expect(firstMerge.hasMergedWith).toHaveBeenCalledWith("u1");
    expect(sync.reconcileJournal).toHaveBeenCalledWith(
      "u1",
      expect.any(Function),
      { conflict: "remote" },
    );
  });

  it("이미 병합한 기기의 재로드는 서버 우선이 아니다", async () => {
    const mods = await load();
    vi.mocked(mods.firstMerge.hasMergedWith).mockReturnValue(true);

    mods.pusher.setSyncUser("u1");
    await settle();

    expect(mods.sync.reconcileJournal).toHaveBeenCalledWith(
      "u1",
      expect.any(Function),
      { conflict: "newer" },
    );
  });

  it("서버 일기를 실제로 본 뒤에만 병합 완료를 남긴다", async () => {
    const { firstMerge } = await loggedIn();
    expect(firstMerge.rememberMergedWith).toHaveBeenCalledWith("u1");
  });

  it("일기 pull이 실패했으면 병합 완료를 남기지 않는다", async () => {
    const mods = await load();
    vi.mocked(mods.sync.reconcileJournal).mockResolvedValue({
      outcome: "failed",
      pullOk: false,
    });

    mods.pusher.setSyncUser("u1");
    await settle();

    expect(mods.firstMerge.rememberMergedWith).not.toHaveBeenCalled();
  });

  it("갱신은 병합 완료를 남기지 않는다", async () => {
    const { pusher, firstMerge } = await loggedIn();
    vi.mocked(firstMerge.rememberMergedWith).mockClear();

    await vi.advanceTimersByTimeAsync(30_000);
    pusher.refreshFromRemote();
    await settle();

    expect(firstMerge.rememberMergedWith).not.toHaveBeenCalled();
  });
});

/*
 * 선택한 기본 덱은 타임스탬프 없는 스칼라라 LWW로 물러설 수 없다. 그래서
 * 서버를 당겨오는 것은 최초 병합 한 번뿐이고, 이후에는 올리기만 한다.
 */
describe("덱 선택 동기화", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("로그인 최초 병합에서 서버의 선택을 당겨온다", async () => {
    const { deck } = await loggedIn();
    expect(deck.reconcileSelectedDeck).toHaveBeenCalledWith(
      "u1",
      expect.any(Function),
    );
  });

  it("주기 갱신에서는 당겨오지 않는다", async () => {
    const mods = await load();
    vi.mocked(mods.firstMerge.hasMergedWith).mockReturnValue(true);

    mods.pusher.setSyncUser("u1");
    await settle();

    expect(mods.sync.reconcileStore).toHaveBeenCalledTimes(1); // 병합 자체는 돌았다
    expect(mods.deck.reconcileSelectedDeck).not.toHaveBeenCalled();
  });

  it("push 때 로컬 선택을 함께 올린다", async () => {
    const { pusher, deck } = await loggedIn();
    pusher.schedulePush();
    await vi.advanceTimersByTimeAsync(2000);
    await settle();
    expect(deck.pushLocalDeck).toHaveBeenCalledWith("u1");
  });

  /*
   * 동기화 배지가 답하는 질문은 "내 기록이 서버에 있는가"다. 덱은 선호값이라
   * 그 답을 바꾸지 않는다 — 실패는 로그로 남고 다음 push가 다시 시도한다.
   */
  it("덱 push가 실패해도 동기화 상태를 error로 만들지 않는다", async () => {
    const { pusher, deck, status } = await loggedIn();
    vi.mocked(deck.pushLocalDeck).mockResolvedValueOnce("failed");
    pusher.schedulePush();
    await vi.advanceTimersByTimeAsync(2000);
    await settle();
    expect(status.getSyncStatus().state).toBe("ok");
  });

  it("로그아웃하면 올린 값에 대한 앎을 버린다", async () => {
    const { pusher, deck } = await loggedIn();
    pusher.setSyncUser(null);
    expect(deck.forgetPushedDeck).toHaveBeenCalled();
  });
});

/*
 * 로그아웃은 "flush → 비움 → signOut → setSyncUser(null)"의 네 단계다.
 * 그 틈에서 새 왕복이 시작되거나, 알면서 빠뜨린 변경이 생기거나, 뒤늦게
 * 끝난 작업이 이전 계정의 흔적을 남기면 안 된다.
 */
describe("flushPendingSync", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("반환 뒤에는 새 갱신도 push도 시작되지 않는다", async () => {
    const { pusher, sync, remote } = await loggedIn();
    vi.mocked(sync.reconcileStore).mockClear();

    await pusher.flushPendingSync(); // 마지막 push는 여기서 나간다
    vi.mocked(remote.pushLocalStore).mockClear();

    // signOut 왕복 중에 인터벌 틱·focus가 발화하는 상황.
    expect(pusher.refreshFromRemote({ force: true })).toBe(false);
    pusher.schedulePush();
    await vi.advanceTimersByTimeAsync(10_000);
    await settle();

    expect(sync.reconcileStore).not.toHaveBeenCalled();
    expect(remote.pushLocalStore).not.toHaveBeenCalled();
  });

  it("진행 중이던 작업 도중에 들어온 변경을 마저 올린다", async () => {
    const { pusher, remote } = await loggedIn();
    const gate = deferred<"ok">();
    vi.mocked(remote.pushLocalStore).mockReturnValueOnce(gate.promise);

    pusher.schedulePush();
    await vi.advanceTimersByTimeAsync(2000); // push 진행 중
    pusher.schedulePush(); // 그 스냅샷에 없는 저장 → dirty

    const flushed = pusher.flushPendingSync(3000);
    gate.resolve("ok");
    await settle();
    await flushed;

    // 첫 push + dirty를 마저 올린 push.
    expect(remote.pushLocalStore).toHaveBeenCalledTimes(2);
  });

  it("타임아웃을 넘긴 push가 이전 계정의 동기화 시각을 되살리지 않는다", async () => {
    const { pusher, remote, status } = await loggedIn();
    const gate = deferred<"ok">();
    vi.mocked(remote.pushLocalStore).mockReturnValueOnce(gate.promise);

    pusher.schedulePush();
    await vi.advanceTimersByTimeAsync(2000);

    const flushed = pusher.flushPendingSync(50);
    await vi.advanceTimersByTimeAsync(50);
    await flushed;

    pusher.setSyncUser(null);
    status.resetSyncStatus(); // 로그아웃이 마지막 동기화 시각을 지운다
    gate.resolve("ok"); // 매달렸던 push가 뒤늦게 끝난다
    await settle();

    expect(status.getSyncStatus().lastSyncedAt).toBeNull();
  });

  it("게스트면 아무 일도 하지 않는다", async () => {
    const { pusher, remote } = await load();
    await pusher.flushPendingSync();
    expect(remote.pushLocalStore).not.toHaveBeenCalled();
  });
});
