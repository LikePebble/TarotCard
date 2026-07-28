import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ArcanaStore, ReadingRecord } from "@/lib/store";
import type { JournalStore } from "@/lib/journal";

vi.mock("@/lib/store", () => ({
  loadStore: vi.fn(),
  setLocalStore: vi.fn(),
}));
vi.mock("@/lib/journal", () => ({
  loadJournal: vi.fn(),
  setLocalJournal: vi.fn(),
}));
vi.mock("@/lib/sync/remote", () => ({
  pullRemoteStore: vi.fn(),
  pushLocalStore: vi.fn(async () => "ok"),
}));
vi.mock("@/lib/sync/journal-remote", () => ({
  pullRemoteJournal: vi.fn(),
  pushLocalJournal: vi.fn(async () => "ok"),
}));

import { loadJournal, setLocalJournal } from "@/lib/journal";
import { loadStore, setLocalStore } from "@/lib/store";
import { pullRemoteJournal } from "@/lib/sync/journal-remote";
import { pullRemoteStore } from "@/lib/sync/remote";
import { reconcileJournal, reconcileStore } from "@/lib/sync/sync";

function reading(id: string, at: string): ReadingRecord {
  return {
    id,
    at,
    localDate: at.slice(0, 10),
    isoWeek: "2026-W30",
    spread: "one",
    typeId: "ONE_CARD",
    category: "day",
    deckId: "classic",
    cards: ["the-fool"],
    orientations: ["upright"],
  };
}

function storeOf(readings: ReadingRecord[]): ArcanaStore {
  const collection: ArcanaStore["collection"] = {};
  for (const r of readings) {
    const deck = (collection[r.deckId] ??= {});
    for (const slug of r.cards) deck[slug] = { firstAt: r.at, count: 1 };
  }
  return { version: 2, collection, readings };
}

/*
 * 로컬 쓰기는 local-events를 울리고 그 알림이 push를 예약한다. 주기 갱신은
 * 대개 아무것도 바꾸지 않으므로, 무조건 쓰면 갱신마다 헛 push가 한 번씩
 * 따라붙는다. "바뀐 게 있을 때만 쓴다"가 그 고리를 끊는다.
 */
describe("reconcileStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("서버가 보탠 리딩이 없으면 로컬을 다시 쓰지 않는다", async () => {
    const local = storeOf([reading("r1", "2026-07-28T01:00:00.000Z")]);
    vi.mocked(loadStore).mockReturnValue(local);
    vi.mocked(pullRemoteStore).mockResolvedValue({
      outcome: "ok",
      data: storeOf([reading("r1", "2026-07-28T01:00:00.000Z")]),
    });

    await expect(reconcileStore("u1")).resolves.toBe("ok");
    expect(setLocalStore).not.toHaveBeenCalled();
  });

  it("서버에 새 리딩이 있으면 로컬에 반영한다", async () => {
    vi.mocked(loadStore).mockReturnValue(
      storeOf([reading("r1", "2026-07-28T01:00:00.000Z")]),
    );
    vi.mocked(pullRemoteStore).mockResolvedValue({
      outcome: "ok",
      data: storeOf([reading("r2", "2026-07-27T01:00:00.000Z")]),
    });

    await reconcileStore("u1");
    expect(setLocalStore).toHaveBeenCalledTimes(1);
    const written = vi.mocked(setLocalStore).mock.calls[0][0];
    expect(written.readings.map((r) => r.id).sort()).toEqual(["r1", "r2"]);
  });

  it("pull이 실패하면 로컬을 건드리지 않고 올리기만 한다", async () => {
    vi.mocked(loadStore).mockReturnValue(
      storeOf([reading("r1", "2026-07-28T01:00:00.000Z")]),
    );
    vi.mocked(pullRemoteStore).mockResolvedValue({ outcome: "failed" });

    await expect(reconcileStore("u1")).resolves.toBe("failed");
    expect(setLocalStore).not.toHaveBeenCalled();
  });

  it("스테일이면 pull 결과를 버리고 아무것도 쓰지 않는다", async () => {
    vi.mocked(loadStore).mockReturnValue(storeOf([]));
    vi.mocked(pullRemoteStore).mockResolvedValue({
      outcome: "ok",
      data: storeOf([reading("r9", "2026-07-28T01:00:00.000Z")]),
    });

    await expect(reconcileStore("u1", () => true)).resolves.toBe("skipped");
    expect(setLocalStore).not.toHaveBeenCalled();
  });
});

describe("reconcileJournal", () => {
  const entry = (body: string, updatedAt: string) => ({ body, updatedAt });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("서버와 로컬이 같으면 로컬을 다시 쓰지 않는다", async () => {
    const same: JournalStore = {
      "2026-07-28": entry("오늘의 메모", "2026-07-28T02:00:00.000Z"),
    };
    vi.mocked(loadJournal).mockReturnValue({ ...same });
    vi.mocked(pullRemoteJournal).mockResolvedValue({
      outcome: "ok",
      data: { ...same },
    });

    await reconcileJournal("u1");
    expect(setLocalJournal).not.toHaveBeenCalled();
  });

  it("서버 일기가 더 최신이면 로컬에 반영한다", async () => {
    vi.mocked(loadJournal).mockReturnValue({
      "2026-07-28": entry("옛 메모", "2026-07-28T02:00:00.000Z"),
    });
    vi.mocked(pullRemoteJournal).mockResolvedValue({
      outcome: "ok",
      data: {
        "2026-07-28": entry("다른 기기에서 고친 메모", "2026-07-28T09:00:00.000Z"),
      },
    });

    await reconcileJournal("u1");
    expect(setLocalJournal).toHaveBeenCalledWith({
      "2026-07-28": entry("다른 기기에서 고친 메모", "2026-07-28T09:00:00.000Z"),
    });
  });

  it("서버에만 있는 날짜가 있으면 로컬에 반영한다", async () => {
    vi.mocked(loadJournal).mockReturnValue({});
    vi.mocked(pullRemoteJournal).mockResolvedValue({
      outcome: "ok",
      data: { "2026-07-27": entry("어제 메모", "2026-07-27T09:00:00.000Z") },
    });

    await reconcileJournal("u1");
    expect(setLocalJournal).toHaveBeenCalledTimes(1);
  });

  it("로그인 최초 병합은 같은 날짜에서 서버를 택한다", async () => {
    vi.mocked(loadJournal).mockReturnValue({
      "2026-07-28": entry("게스트로 쓴 글", "2026-07-28T09:00:00.000Z"),
    });
    vi.mocked(pullRemoteJournal).mockResolvedValue({
      outcome: "ok",
      data: {
        "2026-07-28": entry("계정에 있던 글", "2026-07-28T01:00:00.000Z"),
      },
    });

    await reconcileJournal("u1", () => false, { conflict: "remote" });
    expect(setLocalJournal).toHaveBeenCalledWith({
      "2026-07-28": entry("계정에 있던 글", "2026-07-28T01:00:00.000Z"),
    });
  });

  it("갱신은 아직 올라가지 못한 로컬 글을 서버 옛 사본으로 덮지 않는다", async () => {
    vi.mocked(loadJournal).mockReturnValue({
      "2026-07-28": entry("방금 쓴 글", "2026-07-28T09:00:00.000Z"),
    });
    vi.mocked(pullRemoteJournal).mockResolvedValue({
      outcome: "ok",
      data: { "2026-07-28": entry("서버의 옛 사본", "2026-07-28T01:00:00.000Z") },
    });

    await reconcileJournal("u1", () => false, { conflict: "newer" });
    expect(setLocalJournal).not.toHaveBeenCalled(); // 로컬이 이겨 바뀐 게 없다
  });

  it("pull이 실패하면 prune 없이 올리기만 한다", async () => {
    vi.mocked(loadJournal).mockReturnValue({
      "2026-07-28": entry("메모", "2026-07-28T02:00:00.000Z"),
    });
    vi.mocked(pullRemoteJournal).mockResolvedValue({ outcome: "failed" });

    const result = await reconcileJournal("u1");
    expect(result.pullOk).toBe(false);
    expect(setLocalJournal).not.toHaveBeenCalled();
  });
});
