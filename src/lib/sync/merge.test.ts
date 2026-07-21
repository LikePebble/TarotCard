import { describe, expect, it } from "vitest";
import type { ArcanaStore, ReadingRecord } from "@/lib/store";
import type { JournalStore } from "@/lib/journal";
import {
  mergeJournals,
  mergeStores,
  recomputeCollection,
} from "@/lib/sync/merge";

function rec(over: Partial<ReadingRecord>): ReadingRecord {
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

describe("recomputeCollection", () => {
  it("덱별로 등장 수와 최초 at을 집계한다", () => {
    const readings = [
      rec({ id: "a", at: "2026-07-19T05:00:00.000Z", cards: ["thefool"] }),
      rec({
        id: "b",
        at: "2026-07-20T05:00:00.000Z",
        cards: ["thefool", "themoon"],
      }),
      rec({
        id: "c",
        at: "2026-07-19T05:00:00.000Z",
        deckId: "wolha-biwon",
        cards: ["thefool"],
      }),
    ];
    const col = recomputeCollection(readings);
    expect(col.classic.thefool).toEqual({
      firstAt: "2026-07-19T05:00:00.000Z",
      count: 2,
    });
    expect(col.classic.themoon.count).toBe(1);
    expect(col["wolha-biwon"].thefool.count).toBe(1);
  });
});

describe("mergeStores", () => {
  it("리딩을 id로 합치고(중복 제거) 도감을 재계산한다", () => {
    const a: ArcanaStore = {
      version: 2,
      collection: {},
      readings: [rec({ id: "shared", cards: ["thefool"] })],
    };
    const b: ArcanaStore = {
      version: 2,
      collection: {},
      readings: [
        rec({ id: "shared", cards: ["thefool"] }), // 중복 → 1회만
        rec({ id: "extra", at: "2026-07-21T00:00:00.000Z", cards: ["themoon"] }),
      ],
    };
    const merged = mergeStores(a, b);
    expect(merged.readings).toHaveLength(2);
    expect(merged.collection.classic.thefool.count).toBe(1);
    expect(merged.collection.classic.themoon.count).toBe(1);
  });
});

describe("mergeJournals", () => {
  it("한쪽에만 있는 날짜는 그대로 채택한다", () => {
    const local: JournalStore = {
      "2026-07-20": { body: "로컬만", updatedAt: "2026-07-20T01:00:00.000Z" },
    };
    const remote: JournalStore = {
      "2026-07-21": { body: "서버만", updatedAt: "2026-07-21T01:00:00.000Z" },
    };
    const merged = mergeJournals(local, remote);
    expect(merged["2026-07-20"].body).toBe("로컬만");
    expect(merged["2026-07-21"].body).toBe("서버만");
  });

  it("양쪽에 있으면 updatedAt이 최신인 쪽을 택한다", () => {
    const local: JournalStore = {
      "2026-07-20": { body: "낡은 로컬", updatedAt: "2026-07-20T01:00:00.000Z" },
    };
    const remote: JournalStore = {
      "2026-07-20": { body: "최신 서버", updatedAt: "2026-07-20T09:00:00.000Z" },
    };
    expect(mergeJournals(local, remote)["2026-07-20"].body).toBe("최신 서버");
  });

  it("updatedAt이 같으면 로컬을 택한다", () => {
    const at = "2026-07-20T01:00:00.000Z";
    const local: JournalStore = { "2026-07-20": { body: "로컬", updatedAt: at } };
    const remote: JournalStore = { "2026-07-20": { body: "서버", updatedAt: at } };
    expect(mergeJournals(local, remote)["2026-07-20"].body).toBe("로컬");
  });

  it("빈 스토어끼리 병합하면 빈 스토어다", () => {
    expect(mergeJournals({}, {})).toEqual({});
  });

  it("입력을 변형하지 않는다(순수)", () => {
    const local: JournalStore = {
      "2026-07-20": { body: "로컬", updatedAt: "2026-07-20T01:00:00.000Z" },
    };
    const remote: JournalStore = {
      "2026-07-20": { body: "서버", updatedAt: "2026-07-20T09:00:00.000Z" },
    };
    mergeJournals(local, remote);
    expect(local["2026-07-20"].body).toBe("로컬");
    expect(remote["2026-07-20"].body).toBe("서버");
  });
});
