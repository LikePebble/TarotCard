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

import { newReadingRecord, withReadingRecorded, collectedCount } from "@/lib/store";

describe("newReadingRecord", () => {
  it("at·spread로 파생 필드를 채운다", () => {
    const rec = newReadingRecord({
      id: "R1",
      at: new Date(2026, 6, 19, 14, 0, 0),
      spread: "three",
      category: "love",
      deckId: "wolha-biwon",
      cards: ["thefool", "themoon", "thestar"],
      orientations: ["upright", "reversed", "upright"],
    });
    expect(rec.localDate).toBe("2026-07-19");
    expect(rec.isoWeek).toBe("2026-W29");
    expect(rec.typeId).toBe("THREE_CARD_PPF");
    expect(rec.deckId).toBe("wolha-biwon");
    expect(rec.cards).toHaveLength(3);
  });
});

describe("withReadingRecorded", () => {
  it("해당 덱의 도감만 채우고 리딩을 append한다", () => {
    const store = { version: 2 as const, collection: {}, readings: [] };
    const rec = newReadingRecord({
      id: "R1",
      at: new Date(2026, 6, 19),
      spread: "one",
      category: "day",
      deckId: "wolha-biwon",
      cards: ["thefool"],
      orientations: ["upright"],
    });
    const next = withReadingRecorded(store, rec);
    expect(collectedCount(next, "wolha-biwon")).toBe(1);
    expect(collectedCount(next, "classic")).toBe(0);
    expect(next.readings).toHaveLength(1);
    expect(next.collection["wolha-biwon"].thefool.count).toBe(1);
  });

  it("같은 카드를 다시 만나면 count만 증가하고 firstAt은 유지한다", () => {
    let store: ArcanaStore = { version: 2, collection: {}, readings: [] };
    const base = {
      id: "R1",
      at: new Date(2026, 6, 19),
      spread: "one" as const,
      category: "day",
      deckId: "classic",
      cards: ["thefool"],
      orientations: ["upright" as const],
    };
    store = withReadingRecorded(store, newReadingRecord(base));
    const firstAt = store.collection.classic.thefool.firstAt;
    store = withReadingRecorded(store, newReadingRecord({ ...base, id: "R2" }));
    expect(store.collection.classic.thefool.count).toBe(2);
    expect(store.collection.classic.thefool.firstAt).toBe(firstAt);
  });
});
