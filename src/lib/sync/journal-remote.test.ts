import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JournalStore } from "@/lib/journal";

const mocks = vi.hoisted(() => ({ getBrowserSupabase: vi.fn() }));

vi.mock("@/lib/supabase/client", () => ({
  getBrowserSupabase: mocks.getBrowserSupabase,
}));

import {
  journalPruneFilter,
  pullRemoteJournal,
  pushLocalJournal,
} from "@/lib/sync/journal-remote";
import { forgetServerKnowledge } from "@/lib/sync/server-knowledge";

describe("journalPruneFilter", () => {
  it("PostgREST in-리스트 형식으로 조립한다", () => {
    expect(journalPruneFilter(["2026-07-21", "2026-07-22"])).toBe(
      '("2026-07-21","2026-07-22")',
    );
  });

  it("한 개짜리도 괄호와 따옴표를 유지한다", () => {
    expect(journalPruneFilter(["2026-01-01"])).toBe('("2026-01-01")');
  });
});

const entry = (body: string, updatedAt: string) => ({ body, updatedAt });

/**
 * 삭제 질의는 `.eq()` 뒤에 `.in()`(짚어서 지우기) 또는 `.not()`(전부 나열)이
 * 붙는다. 어느 쪽이 어떤 인자로 불렸는지 기록해 두고 확인한다.
 */
type QueryResult = { error: { message: string } | null };

function fakeSupabase(serverRows: Record<string, string> = {}) {
  const ok = async (): Promise<QueryResult> => ({ error: null });
  const upsert = vi.fn(ok);
  const inFilter = vi.fn(ok);
  const notFilter = vi.fn(ok);
  const client = {
    from: () => ({
      select: () => ({
        eq: async () => ({
          data: Object.entries(serverRows).map(([entry_date, updated_at]) => ({
            entry_date,
            body: `서버 ${entry_date}`,
            updated_at,
          })),
          error: null,
        }),
      }),
      upsert,
      delete: () => ({ eq: () => ({ in: inFilter, not: notFilter }) }),
    }),
  };
  return { client, upsert, inFilter, notFilter };
}

/** upsert에 실린 날짜들. */
function pushedDates(upsert: ReturnType<typeof vi.fn>, call = 0): string[] {
  return (upsert.mock.calls[call][0] as { entry_date: string }[]).map(
    (r) => r.entry_date,
  );
}

describe("pushLocalJournal", () => {
  beforeEach(() => {
    forgetServerKnowledge();
    mocks.getBrowserSupabase.mockReset();
  });

  const local: JournalStore = {
    "2026-07-27": entry("어제", "2026-07-27T01:00:00.000Z"),
    "2026-07-28": entry("오늘", "2026-07-28T01:00:00.000Z"),
  };

  it("서버 상태를 모르면 전부 올리고 전부 나열해 지운다", async () => {
    const { client, upsert, inFilter, notFilter } = fakeSupabase();
    mocks.getBrowserSupabase.mockReturnValue(client);

    await expect(
      pushLocalJournal("u1", local, { prune: true }),
    ).resolves.toBe("ok");

    expect(pushedDates(upsert)).toEqual(["2026-07-27", "2026-07-28"]);
    expect(notFilter).toHaveBeenCalledTimes(1);
    expect(inFilter).not.toHaveBeenCalled();
  });

  /*
   * 종전에는 일기 한 줄을 고칠 때마다 전체를 다시 올리고, 모든 날짜를 나열한
   * 삭제 요청을 함께 보냈다. 그 URL은 몇 년치가 쌓이면 상한을 넘길 수 있었다.
   */
  it("pull 뒤에는 달라진 날짜만 올린다", async () => {
    const { client, upsert } = fakeSupabase({
      "2026-07-27": "2026-07-27T01:00:00.000Z",
      "2026-07-28": "2026-07-28T01:00:00.000Z",
    });
    mocks.getBrowserSupabase.mockReturnValue(client);

    await pullRemoteJournal("u1");
    await pushLocalJournal(
      "u1",
      { ...local, "2026-07-28": entry("고친 오늘", "2026-07-28T09:00:00.000Z") },
      { prune: true },
    );

    expect(pushedDates(upsert)).toEqual(["2026-07-28"]);
  });

  it("바뀐 것도 지울 것도 없으면 왕복을 통째로 건너뛴다", async () => {
    const { client, upsert, inFilter, notFilter } = fakeSupabase({
      "2026-07-27": "2026-07-27T01:00:00.000Z",
      "2026-07-28": "2026-07-28T01:00:00.000Z",
    });
    mocks.getBrowserSupabase.mockReturnValue(client);

    await pullRemoteJournal("u1");
    await expect(
      pushLocalJournal("u1", local, { prune: true }),
    ).resolves.toBe("ok");

    expect(upsert).not.toHaveBeenCalled();
    expect(inFilter).not.toHaveBeenCalled();
    expect(notFilter).not.toHaveBeenCalled();
  });

  it("지울 날짜를 알면 그 날짜만 짚어 지운다", async () => {
    const { client, inFilter, notFilter } = fakeSupabase({
      "2026-07-26": "2026-07-26T01:00:00.000Z",
      "2026-07-27": "2026-07-27T01:00:00.000Z",
      "2026-07-28": "2026-07-28T01:00:00.000Z",
    });
    mocks.getBrowserSupabase.mockReturnValue(client);

    await pullRemoteJournal("u1");
    await pushLocalJournal("u1", local, { prune: true }); // 07-26을 지웠다

    expect(inFilter).toHaveBeenCalledWith("entry_date", ["2026-07-26"]);
    expect(notFilter).not.toHaveBeenCalled();
  });

  it("prune이 false면 지우지 않고, 서버에 남은 날짜도 계속 기억한다", async () => {
    const { client, inFilter, notFilter, upsert } = fakeSupabase({
      "2026-07-26": "2026-07-26T01:00:00.000Z",
    });
    mocks.getBrowserSupabase.mockReturnValue(client);

    await pullRemoteJournal("u1");
    await pushLocalJournal("u1", local, { prune: false });
    expect(inFilter).not.toHaveBeenCalled();
    expect(notFilter).not.toHaveBeenCalled();

    // 다음에 prune이 허용되면 그때 07-26을 짚어 지울 수 있어야 한다.
    upsert.mockClear();
    await pushLocalJournal("u1", local, { prune: true });
    expect(upsert).not.toHaveBeenCalled(); // 본문은 이미 올라가 있다
    expect(inFilter).toHaveBeenCalledWith("entry_date", ["2026-07-26"]);
  });

  it("정리가 실패하면 지우려던 날짜를 계속 기억해 다시 시도한다", async () => {
    const { client, inFilter } = fakeSupabase({
      "2026-07-26": "2026-07-26T01:00:00.000Z",
    });
    mocks.getBrowserSupabase.mockReturnValue(client);
    inFilter.mockResolvedValueOnce({ error: { message: "끊김" } });
    vi.spyOn(console, "error").mockImplementation(() => {});

    await pullRemoteJournal("u1");
    await expect(
      pushLocalJournal("u1", local, { prune: true }),
    ).resolves.toBe("failed");

    await pushLocalJournal("u1", local, { prune: true });
    expect(inFilter).toHaveBeenLastCalledWith("entry_date", ["2026-07-26"]);
  });

  it("upsert가 실패하면 삭제도 하지 않고 앎도 갱신하지 않는다", async () => {
    const { client, upsert, inFilter, notFilter } = fakeSupabase();
    mocks.getBrowserSupabase.mockReturnValue(client);
    upsert.mockResolvedValueOnce({ error: { message: "끊김" } });
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      pushLocalJournal("u1", local, { prune: true }),
    ).resolves.toBe("failed");
    expect(inFilter).not.toHaveBeenCalled();
    expect(notFilter).not.toHaveBeenCalled();

    await pushLocalJournal("u1", local, { prune: true });
    expect(pushedDates(upsert, 1)).toEqual(["2026-07-27", "2026-07-28"]);
  });

  it("로컬이 비어 있으면 아무것도 하지 않는다(파손된 저장소 보호)", async () => {
    const { client, upsert, inFilter, notFilter } = fakeSupabase();
    mocks.getBrowserSupabase.mockReturnValue(client);

    await expect(pushLocalJournal("u1", {}, { prune: true })).resolves.toBe(
      "skipped",
    );
    expect(upsert).not.toHaveBeenCalled();
    expect(inFilter).not.toHaveBeenCalled();
    expect(notFilter).not.toHaveBeenCalled();
  });
});
