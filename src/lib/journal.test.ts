import { describe, expect, it, vi } from "vitest";
import { setEntry, withEntry, type JournalStore } from "@/lib/journal";
import { subscribeLocal } from "@/lib/local-events";

describe("withEntry", () => {
  it("본문을 그날 항목으로 저장한다", () => {
    const next = withEntry({}, "2026-07-19", "오늘의 메모", "2026-07-19T14:00:00.000Z");
    expect(next["2026-07-19"]).toEqual({
      body: "오늘의 메모",
      updatedAt: "2026-07-19T14:00:00.000Z",
    });
  });

  it("빈 본문은 그날 항목을 삭제한다", () => {
    const store: JournalStore = {
      "2026-07-19": { body: "지울 메모", updatedAt: "2026-07-19T00:00:00.000Z" },
    };
    const next = withEntry(store, "2026-07-19", "   ", "2026-07-20T00:00:00.000Z");
    expect(next["2026-07-19"]).toBeUndefined();
  });

  it("입력 스토어를 변형하지 않는다(순수)", () => {
    const store: JournalStore = {};
    withEntry(store, "2026-07-19", "메모", "2026-07-19T00:00:00.000Z");
    expect(store["2026-07-19"]).toBeUndefined();
  });
});

describe("setEntry", () => {
  it("journal 채널로 변경을 알린다", () => {
    const fn = vi.fn();
    const off = subscribeLocal("journal", fn);
    setEntry("2026-07-22", "메모");
    off();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("store 채널은 건드리지 않는다", () => {
    const fn = vi.fn();
    const off = subscribeLocal("store", fn);
    setEntry("2026-07-22", "메모");
    off();
    expect(fn).not.toHaveBeenCalled();
  });
});
