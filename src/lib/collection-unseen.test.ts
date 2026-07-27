import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  markCollectionCardSeen,
  markNewCollectionCards,
  pruneUnreadCollection,
  unreadCollectionSlugs,
} from "@/lib/collection-unseen";

function localStorageMock() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("collection unread markers", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { localStorage: localStorageMock() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("새로 수집한 카드만 표시하고 상세를 열면 그 카드만 읽음 처리한다", () => {
    markNewCollectionCards("classic", ["the-fool", "the-moon"]);
    expect(unreadCollectionSlugs("classic")).toEqual(
      new Set(["the-fool", "the-moon"]),
    );

    markCollectionCardSeen("classic", "the-fool");
    expect(unreadCollectionSlugs("classic")).toEqual(new Set(["the-moon"]));
  });

  it("리딩이 지워진 카드의 표시도 함께 정리한다", () => {
    markNewCollectionCards("classic", ["the-fool", "the-moon"]);
    pruneUnreadCollection({
      version: 2,
      collection: { classic: { "the-fool": { firstAt: "now", count: 1 } } },
      readings: [],
    });
    expect(unreadCollectionSlugs("classic")).toEqual(new Set(["the-fool"]));
  });
});
