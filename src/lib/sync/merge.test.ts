import { describe, expect, it } from "vitest";
import type { ArcanaStore, ReadingRecord } from "@/lib/store";
import type { JournalStore } from "@/lib/journal";
import {
  mergeJournals,
  mergeStores,
  recomputeEncounters,
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

describe("recomputeEncounters", () => {
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
    const col = recomputeEncounters(readings);
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
    const merged = mergeJournals(local, remote, "newer");
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
    expect(mergeJournals(local, remote, "newer")["2026-07-20"].body).toBe("최신 서버");
  });

  it("updatedAt이 같으면 로컬을 택한다", () => {
    const at = "2026-07-20T01:00:00.000Z";
    const local: JournalStore = { "2026-07-20": { body: "로컬", updatedAt: at } };
    const remote: JournalStore = { "2026-07-20": { body: "서버", updatedAt: at } };
    expect(mergeJournals(local, remote, "newer")["2026-07-20"].body).toBe("로컬");
  });

  /*
   * 로그인 최초 병합(S3a "remote")과 이후 갱신(S3a "newer")은 같은 날짜가
   * 양쪽에 있을 때만 갈린다. 갱신에서까지 서버를 우선하면, 방금 이 기기에서
   * 쓰고 아직 올라가지 못한 글을 주기 갱신이 서버의 옛 사본으로 되돌린다.
   */
  describe('policy "remote" (로그인 최초 병합)', () => {
    it("같은 날짜는 로컬이 더 최신이어도 서버를 택한다", () => {
      const local: JournalStore = {
        "2026-07-20": {
          body: "게스트로 쓴 글",
          updatedAt: "2026-07-20T09:00:00.000Z",
        },
      };
      const remote: JournalStore = {
        "2026-07-20": {
          body: "계정에 있던 글",
          updatedAt: "2026-07-20T01:00:00.000Z",
        },
      };
      expect(mergeJournals(local, remote, "remote")["2026-07-20"].body).toBe(
        "계정에 있던 글",
      );
    });

    it("서버에 없는 날짜의 게스트 기록은 그대로 올라간다", () => {
      const local: JournalStore = {
        "2026-07-19": {
          body: "게스트만 쓴 날",
          updatedAt: "2026-07-19T09:00:00.000Z",
        },
      };
      const remote: JournalStore = {
        "2026-07-20": {
          body: "계정에 있던 글",
          updatedAt: "2026-07-20T01:00:00.000Z",
        },
      };
      const merged = mergeJournals(local, remote, "remote");
      expect(merged["2026-07-19"].body).toBe("게스트만 쓴 날");
      expect(merged["2026-07-20"].body).toBe("계정에 있던 글");
    });
  });

  it('policy "newer"는 아직 못 올린 로컬 글을 서버 옛 사본으로 덮지 않는다', () => {
    const local: JournalStore = {
      "2026-07-20": { body: "방금 쓴 글", updatedAt: "2026-07-20T09:00:00.000Z" },
    };
    const remote: JournalStore = {
      "2026-07-20": {
        body: "서버의 옛 사본",
        updatedAt: "2026-07-20T01:00:00.000Z",
      },
    };
    expect(mergeJournals(local, remote, "newer")["2026-07-20"].body).toBe(
      "방금 쓴 글",
    );
  });

  /*
   * 이 서브시스템이 오래 갖고 있던 결함 — 개별 삭제가 기기 사이에서 부활하는
   * 것 — 을 닫는 자리다. 톰스톤이 없으면 "서버에 없음"과 "아직 안 올림"이
   * 구분되지 않아 병합이 지운 날을 그대로 되살린다.
   */
  describe("톰스톤(지운 날)", () => {
    const written = (at: string) => ({ body: "쓴 글", updatedAt: at });
    const deleted = (at: string) => ({ body: "", updatedAt: at });

    it("서버의 삭제가 더 최신이면 로컬의 글을 지운다", () => {
      const merged = mergeJournals(
        { "2026-07-20": written("2026-07-20T01:00:00.000Z") },
        { "2026-07-20": deleted("2026-07-20T09:00:00.000Z") },
        "newer",
      );
      expect(merged["2026-07-20"].body).toBe("");
    });

    it("로컬의 수정이 더 최신이면 삭제를 이긴다", () => {
      const merged = mergeJournals(
        { "2026-07-20": written("2026-07-20T09:00:00.000Z") },
        { "2026-07-20": deleted("2026-07-20T01:00:00.000Z") },
        "newer",
      );
      expect(merged["2026-07-20"].body).toBe("쓴 글");
    });

    it("로컬의 삭제가 더 최신이면 서버의 글을 지운다", () => {
      const merged = mergeJournals(
        { "2026-07-20": deleted("2026-07-20T09:00:00.000Z") },
        { "2026-07-20": written("2026-07-20T01:00:00.000Z") },
        "newer",
      );
      expect(merged["2026-07-20"].body).toBe("");
    });

    it("로그인 최초 병합에서는 계정의 삭제가 게스트의 글을 이긴다", () => {
      const merged = mergeJournals(
        { "2026-07-20": written("2026-07-20T09:00:00.000Z") },
        { "2026-07-20": deleted("2026-07-20T01:00:00.000Z") },
        "remote",
      );
      expect(merged["2026-07-20"].body).toBe("");
    });

    it("한쪽에만 있는 톰스톤도 그대로 채택한다(삭제가 전파되는 경로)", () => {
      const merged = mergeJournals(
        {},
        { "2026-07-20": deleted("2026-07-20T09:00:00.000Z") },
        "newer",
      );
      expect(merged["2026-07-20"].body).toBe("");
    });
  });

  it("빈 스토어끼리 병합하면 빈 스토어다", () => {
    expect(mergeJournals({}, {}, "newer")).toEqual({});
  });

  it("입력을 변형하지 않는다(순수)", () => {
    const local: JournalStore = {
      "2026-07-20": { body: "로컬", updatedAt: "2026-07-20T01:00:00.000Z" },
    };
    const remote: JournalStore = {
      "2026-07-20": { body: "서버", updatedAt: "2026-07-20T09:00:00.000Z" },
    };
    mergeJournals(local, remote, "newer");
    expect(local["2026-07-20"].body).toBe("로컬");
    expect(remote["2026-07-20"].body).toBe("서버");
  });
});
