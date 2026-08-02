import { afterEach, describe, expect, it, vi } from "vitest";
import {
  resetRetainedDrawUsage,
  retainRecordedDrawUsage,
  retainDrawUsageOnSignOut,
  retainedDrawUsageAt,
} from "@/lib/draw-guard";
import type { ReadingRecord } from "@/lib/store";

const day = new Date(2026, 7, 2, 12);

function reading(overrides: Partial<ReadingRecord>): ReadingRecord {
  return {
    id: "r1",
    at: day.toISOString(),
    localDate: "2026-08-02",
    isoWeek: "2026-W31",
    spread: "one",
    typeId: "ONE_CARD",
    category: "love",
    deckId: "classic",
    cards: ["thefool"],
    orientations: ["upright"],
    ...overrides,
  };
}

function installStorage() {
  const values = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("로그아웃 드로우 보호", () => {
  it("카드·주제 없이 오늘의 서로 다른 슬롯 수와 이번 주 3카드 사용만 보존한다", () => {
    installStorage();
    retainDrawUsageOnSignOut([
      reading({ category: "love" }),
      reading({ id: "r2", category: "love" }),
      reading({
        id: "r3",
        spread: "three",
        typeId: "THREE_CARD_PPF",
        category: "self",
      }),
    ], day);

    expect(retainedDrawUsageAt(day)).toEqual({ oneSlotsUsed: 1, threeUsed: true });
  });

  it("같은 주의 다른 날에는 3카드만, 다음 주에는 어느 표식도 남지 않는다", () => {
    installStorage();
    retainDrawUsageOnSignOut([
      reading({ spread: "three", typeId: "THREE_CARD_PPF" }),
    ], day);

    expect(retainedDrawUsageAt(new Date(2026, 6, 31, 12))).toEqual({
      oneSlotsUsed: 0,
      threeUsed: true,
    });
    expect(retainedDrawUsageAt(new Date(2026, 7, 10, 12))).toEqual({
      oneSlotsUsed: 0,
      threeUsed: false,
    });
  });

  it("로그아웃 뒤 새로 뽑은 사용량을 다음 로그아웃에서도 누락하지 않는다", () => {
    installStorage();
    retainDrawUsageOnSignOut([reading({ category: "love" })], day);

    retainRecordedDrawUsage("one", day);
    retainDrawUsageOnSignOut([reading({ category: "work" })], day);

    expect(retainedDrawUsageAt(day)).toEqual({
      oneSlotsUsed: 2,
      threeUsed: false,
    });
  });

  it("개발용 현재 주기 초기화는 당일·당주 잠금을 함께 비운다", () => {
    installStorage();
    retainRecordedDrawUsage("one", day);
    retainRecordedDrawUsage("three", day);

    resetRetainedDrawUsage(day);

    expect(retainedDrawUsageAt(day)).toEqual({
      oneSlotsUsed: 0,
      threeUsed: false,
    });
  });
});
