import { describe, expect, it } from "vitest";
import { migrateStore, type ArcanaStore } from "@/lib/store";

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
