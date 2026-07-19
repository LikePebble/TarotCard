import { describe, expect, it } from "vitest";
import { migrateStore, type ArcanaStore } from "@/lib/store";
import {
  slotState,
  type ArcanaStore as Store,
} from "@/lib/store";

function reading(over: Partial<import("@/lib/store").ReadingRecord>): import("@/lib/store").ReadingRecord {
  return {
    id: "r1",
    at: "2026-07-19T05:00:00.000Z",
    localDate: "2026-07-19",
    isoWeek: "2026-W29",
    spread: "one",
    typeId: "ONE_CARD",
    category: "love",
    deckId: "classic",
    cards: ["thefool"],
    orientations: ["upright"],
    ...over,
  };
}

describe("migrateStore", () => {
  it("v1 평면 collection을 classic 덱 아래로 승격한다", () => {
    const v1 = {
      version: 1,
      collection: { thefool: { firstAt: "2026-01-01T00:00:00.000Z", count: 2 } },
      readings: [
        { at: "2026-07-19T05:00:00.000Z", spread: "one", focus: "love", cards: ["thefool"] },
      ],
    };
    const s = migrateStore(v1);
    expect(s.version).toBe(2);
    expect(s.collection.classic.thefool.count).toBe(2);
    expect(s.readings[0].deckId).toBe("classic");
    expect(s.readings[0].typeId).toBe("ONE_CARD");
    expect(s.readings[0].category).toBe("love");
    expect(s.readings[0].localDate).toBe("2026-07-19");
    expect(s.readings[0].orientations).toEqual([]);
    expect(typeof s.readings[0].id).toBe("string");
  });

  it("v2는 그대로 통과시킨다", () => {
    const v2: ArcanaStore = {
      version: 2,
      collection: { classic: {} },
      readings: [],
    };
    expect(migrateStore(v2)).toEqual(v2);
  });

  it("알 수 없는 값은 빈 스토어로 만든다", () => {
    expect(migrateStore(null)).toEqual({ version: 2, collection: {}, readings: [] });
    expect(migrateStore({ version: 9 })).toEqual({ version: 2, collection: {}, readings: [] });
  });
});

describe("slotState — 오늘의 타로 (카테고리별 일 1회, 기본 1슬롯)", () => {
  const day = new Date(2026, 6, 19);

  it("기록 없으면 available", () => {
    const s: Store = { version: 2, collection: {}, readings: [] };
    expect(slotState(s, "one", "love", day)).toEqual({ state: "available" });
  });

  it("같은 카테고리를 오늘 뽑았으면 completed + readingId", () => {
    const s: Store = { version: 2, collection: {}, readings: [reading({ id: "R1" })] };
    expect(slotState(s, "one", "love", day)).toEqual({
      state: "completed",
      readingId: "R1",
    });
  });

  it("다른 카테고리인데 슬롯(1) 소진이면 exhausted", () => {
    const s: Store = { version: 2, collection: {}, readings: [reading({ category: "love" })] };
    expect(slotState(s, "one", "work", day)).toEqual({ state: "exhausted" });
  });

  it("maxDailySlots=3이면 다른 카테고리는 아직 available", () => {
    const s: Store = { version: 2, collection: {}, readings: [reading({ category: "love" })] };
    expect(slotState(s, "one", "work", day, 3)).toEqual({ state: "available" });
  });
});

describe("slotState — 과거·현재·미래 (주 1회, 카테고리 무관)", () => {
  const day = new Date(2026, 6, 19); // 2026-W29

  it("이번 주 PPF 기록 있으면 카테고리와 무관하게 completed", () => {
    const ppf = reading({ id: "W1", spread: "three", typeId: "THREE_CARD_PPF", category: "self" });
    const s: Store = { version: 2, collection: {}, readings: [ppf] };
    expect(slotState(s, "three", "love", day)).toEqual({
      state: "completed",
      readingId: "W1",
    });
  });

  it("이번 주 PPF 기록 없으면 available", () => {
    const lastWeek = reading({ spread: "three", typeId: "THREE_CARD_PPF", isoWeek: "2026-W28" });
    const s: Store = { version: 2, collection: {}, readings: [lastWeek] };
    expect(slotState(s, "three", "love", day)).toEqual({ state: "available" });
  });
});
