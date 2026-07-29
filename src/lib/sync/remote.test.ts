import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ArcanaStore, ReadingRecord } from "@/lib/store";

const mocks = vi.hoisted(() => ({ getBrowserSupabase: vi.fn() }));

vi.mock("@/lib/supabase/client", () => ({
  getBrowserSupabase: mocks.getBrowserSupabase,
}));

import { pullRemoteStore, pushLocalStore } from "@/lib/sync/remote";
import { forgetServerKnowledge } from "@/lib/sync/server-knowledge";

function reading(id: string): ReadingRecord {
  return {
    id,
    at: "2026-07-28T01:00:00.000Z",
    localDate: "2026-07-28",
    isoWeek: "2026-W31",
    spread: "one",
    typeId: "ONE_CARD",
    category: "day",
    deckId: "classic",
    cards: ["the-fool"],
    orientations: ["upright"],
  };
}

function storeOf(ids: string[]): ArcanaStore {
  return { version: 2, collection: {}, readings: ids.map(reading) };
}

/** upsert에 실제로 실린 행과, 서버가 돌려줄 pull 결과를 통제하는 가짜 클라이언트. */
function fakeSupabase(serverRows: string[] = []) {
  const upsert = vi.fn(
    async (): Promise<{ error: { message: string } | null }> => ({
      error: null,
    }),
  );
  return {
    upsert,
    client: {
      from: () => ({
        select: () => ({
          eq: async () => ({
            data: serverRows.map((id) => ({
              id,
              created_at: "2026-07-28T01:00:00.000Z",
              local_date: "2026-07-28",
              iso_week: "2026-W31",
              spread: "one",
              type_id: "ONE_CARD",
              category: "day",
              deck_id: "classic",
              cards: ["the-fool"],
              orientations: ["upright"],
            })),
            error: null,
          }),
        }),
        upsert,
      }),
    },
  };
}

/** upsert에 실린 리딩 id들. */
function pushedIds(upsert: ReturnType<typeof vi.fn>, call = 0): string[] {
  return (upsert.mock.calls[call][0] as { id: string }[]).map((r) => r.id);
}

describe("pushLocalStore", () => {
  beforeEach(() => {
    forgetServerKnowledge();
    mocks.getBrowserSupabase.mockReset();
  });

  it("서버에 무엇이 있는지 모르면 전부 올린다", async () => {
    const { client, upsert } = fakeSupabase();
    mocks.getBrowserSupabase.mockReturnValue(client);

    await expect(pushLocalStore("u1", storeOf(["r1", "r2"]))).resolves.toBe("ok");
    expect(pushedIds(upsert)).toEqual(["r1", "r2"]);
  });

  /*
   * 종전에는 카드 한 장을 뽑을 때마다 지난 이력 전체를 다시 올렸다.
   * 리딩은 한 번 기록되면 바뀌지 않으므로 이미 올라간 행을 다시 밀 이유가 없다.
   */
  it("pull로 서버 상태를 알고 나면 새 리딩만 올린다", async () => {
    const { client, upsert } = fakeSupabase(["r1", "r2"]);
    mocks.getBrowserSupabase.mockReturnValue(client);

    await pullRemoteStore("u1");
    await pushLocalStore("u1", storeOf(["r1", "r2", "r3"]));

    expect(pushedIds(upsert)).toEqual(["r3"]);
  });

  it("올릴 것이 없으면 왕복 자체를 건너뛴다", async () => {
    const { client, upsert } = fakeSupabase(["r1", "r2"]);
    mocks.getBrowserSupabase.mockReturnValue(client);

    await pullRemoteStore("u1");
    await expect(pushLocalStore("u1", storeOf(["r1", "r2"]))).resolves.toBe(
      "skipped",
    );
    expect(upsert).not.toHaveBeenCalled();
  });

  it("push가 성공하면 그다음 push는 그것을 이미 올린 것으로 안다", async () => {
    const { client, upsert } = fakeSupabase();
    mocks.getBrowserSupabase.mockReturnValue(client);

    await pushLocalStore("u1", storeOf(["r1"]));
    await pushLocalStore("u1", storeOf(["r1", "r2"]));

    expect(pushedIds(upsert, 0)).toEqual(["r1"]);
    expect(pushedIds(upsert, 1)).toEqual(["r2"]);
  });

  it("push가 실패하면 앎을 갱신하지 않아 다음에 다시 시도한다", async () => {
    const upsert = vi
      .fn()
      .mockResolvedValueOnce({ error: { message: "네트워크 끊김" } })
      .mockResolvedValueOnce({ error: null });
    mocks.getBrowserSupabase.mockReturnValue({ from: () => ({ upsert }) });
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(pushLocalStore("u1", storeOf(["r1"]))).resolves.toBe("failed");
    await expect(pushLocalStore("u1", storeOf(["r1"]))).resolves.toBe("ok");
    expect(pushedIds(upsert, 1)).toEqual(["r1"]);
  });

  it("다른 계정의 앎을 자기 것으로 쓰지 않는다", async () => {
    const { client, upsert } = fakeSupabase(["r1"]);
    mocks.getBrowserSupabase.mockReturnValue(client);

    await pullRemoteStore("u1");
    await pushLocalStore("u2", storeOf(["r1"]));

    expect(pushedIds(upsert)).toEqual(["r1"]); // u1의 앎으로 건너뛰면 안 된다
  });

  it("빈 스토어는 종전대로 skipped", async () => {
    mocks.getBrowserSupabase.mockReturnValue(fakeSupabase().client);
    await expect(pushLocalStore("u1", storeOf([]))).resolves.toBe("skipped");
  });
});
