import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getBrowserSupabase: vi.fn(),
  getStoredDeckId: vi.fn(() => "classic"),
  setSelectedDeckId: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  getBrowserSupabase: mocks.getBrowserSupabase,
}));

// store는 localStorage를 만지고 테스트 환경은 node라 window가 없다.
// 저장값과 저장 호출을 여기서 직접 만든다.
vi.mock("@/lib/store", () => ({
  getStoredDeckId: mocks.getStoredDeckId,
  setSelectedDeckId: mocks.setSelectedDeckId,
}));

/** "이미 올렸다"는 메모가 모듈 수준에 있다. 테스트마다 새 인스턴스를 받는다. */
async function load() {
  vi.resetModules();
  return import("@/lib/sync/deck-remote");
}

function supabaseWith({
  profile = { data: { selected_deck_id: "classic" }, error: null },
  updateError = null,
}: {
  profile?: { data: unknown; error: unknown };
  updateError?: unknown;
} = {}) {
  const update = vi.fn(() => ({
    eq: () => Promise.resolve({ error: updateError }),
  }));
  const client = {
    from: vi.fn(() => ({
      select: () => ({
        eq: () => ({ single: () => Promise.resolve(profile) }),
      }),
      update,
    })),
  };
  mocks.getBrowserSupabase.mockReturnValue(client);
  return { client, update };
}

/** 결과 대신 예외를 던지는 클라이언트(네트워크 계층에서 올라오는 경우). */
function supabaseThrowing() {
  const update = vi.fn(() => ({
    eq: () => Promise.reject(new Error("network down")),
  }));
  mocks.getBrowserSupabase.mockReturnValue({
    from: vi.fn(() => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.reject(new Error("network down")),
        }),
      }),
      update,
    })),
  });
  return { update };
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getStoredDeckId.mockReturnValue("classic");
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("reconcileSelectedDeck", () => {
  it("미설정(게스트)이면 로컬을 건드리지 않고 건너뛴다", async () => {
    mocks.getBrowserSupabase.mockReturnValue(null);
    const { reconcileSelectedDeck } = await load();

    await expect(reconcileSelectedDeck("u1")).resolves.toBe("skipped");
    expect(mocks.setSelectedDeckId).not.toHaveBeenCalled();
  });

  /* 네트워크가 한 번 끊긴 것이 사용자의 선택을 되돌리면 안 된다. */
  it("pull이 실패하면 로컬을 그대로 두고 실패를 알린다", async () => {
    const { update } = supabaseWith({
      profile: { data: null, error: { message: "boom" } },
    });
    const { reconcileSelectedDeck } = await load();

    await expect(reconcileSelectedDeck("u1")).resolves.toBe("failed");
    expect(mocks.setSelectedDeckId).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("서버가 비-기본값이면 그것을 로컬에 반영하고 올리지 않는다", async () => {
    mocks.getStoredDeckId.mockReturnValue("classic");
    const { update } = supabaseWith({
      profile: { data: { selected_deck_id: "wolha-biwon" }, error: null },
    });
    const { reconcileSelectedDeck } = await load();

    await expect(reconcileSelectedDeck("u1")).resolves.toBe("ok");
    expect(mocks.setSelectedDeckId).toHaveBeenCalledWith("wolha-biwon");
    expect(update).not.toHaveBeenCalled(); // 서버가 이미 그 값이다
  });

  it("서버가 기본값이면 게스트 선택을 유지하고 계정에 올린다", async () => {
    mocks.getStoredDeckId.mockReturnValue("wolha-biwon");
    const { update } = supabaseWith({
      profile: { data: { selected_deck_id: "classic" }, error: null },
    });
    const { reconcileSelectedDeck } = await load();

    await expect(reconcileSelectedDeck("u1")).resolves.toBe("ok");
    expect(mocks.setSelectedDeckId).not.toHaveBeenCalled(); // 이미 그 값이다
    expect(update).toHaveBeenCalledWith({ selected_deck_id: "wolha-biwon" });
  });

  it("왕복 중 세션이 바뀌면 로컬도 서버도 건드리지 않는다", async () => {
    mocks.getStoredDeckId.mockReturnValue("classic");
    const { update } = supabaseWith({
      profile: { data: { selected_deck_id: "wolha-biwon" }, error: null },
    });
    const { reconcileSelectedDeck } = await load();

    await expect(reconcileSelectedDeck("u1", () => true)).resolves.toBe(
      "skipped",
    );
    expect(mocks.setSelectedDeckId).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  /*
   * 이 호출은 pusher의 Promise.all 안에 있다. 예외가 새어 나가면 선호값 하나가
   * 이미 성공한 리딩·일기 병합까지 "중단됨"으로 되돌린다.
   */
  it("클라이언트가 예외를 던져도 삼켜서 실패로 접는다", async () => {
    supabaseThrowing();
    const { reconcileSelectedDeck } = await load();

    await expect(reconcileSelectedDeck("u1")).resolves.toBe("failed");
    expect(mocks.setSelectedDeckId).not.toHaveBeenCalled();
  });

  it("서버 값이 문자열이 아니면 기본값으로 읽는다", async () => {
    mocks.getStoredDeckId.mockReturnValue("wolha-biwon");
    const { update } = supabaseWith({
      profile: { data: { selected_deck_id: null }, error: null },
    });
    const { reconcileSelectedDeck } = await load();

    await expect(reconcileSelectedDeck("u1")).resolves.toBe("ok");
    // 기본값 = 의견 없음 → 로컬 유지, 그리고 계정에 남긴다.
    expect(mocks.setSelectedDeckId).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith({ selected_deck_id: "wolha-biwon" });
  });
});

describe("pushLocalDeck", () => {
  it("미설정이면 서버를 부르지 않는다", async () => {
    mocks.getBrowserSupabase.mockReturnValue(null);
    const { pushLocalDeck } = await load();

    await expect(pushLocalDeck("u1")).resolves.toBe("skipped");
  });

  it("같은 값을 다시 올리지 않는다", async () => {
    mocks.getStoredDeckId.mockReturnValue("wolha-biwon");
    const { update } = supabaseWith();
    const { pushLocalDeck } = await load();

    await expect(pushLocalDeck("u1")).resolves.toBe("ok");
    await expect(pushLocalDeck("u1")).resolves.toBe("skipped");
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("값이 바뀌면 다시 올린다", async () => {
    mocks.getStoredDeckId.mockReturnValue("wolha-biwon");
    const { update } = supabaseWith();
    const { pushLocalDeck } = await load();

    await pushLocalDeck("u1");
    mocks.getStoredDeckId.mockReturnValue("k-pop-museverse");
    await expect(pushLocalDeck("u1")).resolves.toBe("ok");
    expect(update).toHaveBeenNthCalledWith(2, {
      selected_deck_id: "k-pop-museverse",
    });
  });

  /* 실패했는데 "올렸다"고 기억하면 그 선택은 영영 올라가지 못한다. */
  it("실패한 push는 기억하지 않아 다음에 다시 시도한다", async () => {
    mocks.getStoredDeckId.mockReturnValue("wolha-biwon");
    const { update } = supabaseWith({ updateError: { message: "boom" } });
    const { pushLocalDeck } = await load();

    await expect(pushLocalDeck("u1")).resolves.toBe("failed");
    await expect(pushLocalDeck("u1")).resolves.toBe("failed");
    expect(update).toHaveBeenCalledTimes(2);
  });

  /*
   * pushNow는 store·journal push가 끝난 뒤에 이것을 부른다. 예외가 새어 나가면
   * pushNow의 catch가 이미 성공한 백업을 "error"로 표시한다.
   */
  it("push가 예외를 던져도 삼키고, 올렸다고 기억하지 않는다", async () => {
    mocks.getStoredDeckId.mockReturnValue("wolha-biwon");
    const { update } = supabaseThrowing();
    const { pushLocalDeck } = await load();

    await expect(pushLocalDeck("u1")).resolves.toBe("failed");
    await expect(pushLocalDeck("u1")).resolves.toBe("failed");
    expect(update).toHaveBeenCalledTimes(2); // 메모가 남지 않아 다시 시도한다
  });

  it("로그아웃으로 앎을 버리면 다시 올린다", async () => {
    mocks.getStoredDeckId.mockReturnValue("wolha-biwon");
    const { update } = supabaseWith();
    const { pushLocalDeck, forgetPushedDeck } = await load();

    await pushLocalDeck("u1");
    forgetPushedDeck();
    await expect(pushLocalDeck("u1")).resolves.toBe("ok");
    expect(update).toHaveBeenCalledTimes(2);
  });

  it("다른 계정 앞으로는 다시 올린다", async () => {
    mocks.getStoredDeckId.mockReturnValue("wolha-biwon");
    const { update } = supabaseWith();
    const { pushLocalDeck } = await load();

    await pushLocalDeck("u1");
    await expect(pushLocalDeck("u2")).resolves.toBe("ok");
    expect(update).toHaveBeenCalledTimes(2);
  });

  it("병합에서 올린 값은 뒤이은 push가 반복하지 않는다", async () => {
    mocks.getStoredDeckId.mockReturnValue("wolha-biwon");
    const { update } = supabaseWith({
      profile: { data: { selected_deck_id: "classic" }, error: null },
    });
    const { reconcileSelectedDeck, pushLocalDeck } = await load();

    await reconcileSelectedDeck("u1");
    await expect(pushLocalDeck("u1")).resolves.toBe("skipped");
    expect(update).toHaveBeenCalledTimes(1);
  });
});
