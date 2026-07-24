import { describe, expect, it } from "vitest";
import { cards } from "@/data/cards";
import { visibleCards } from "./catalog-filter";

describe("visibleCards", () => {
  it("collected 필터는 만난 slug만 남긴다", () => {
    const collected = new Set(["the-fool", "ace-of-cups"]);
    const out = visibleCards(cards, "collected", collected);
    expect(out.map((c) => c.slug).sort()).toEqual(["ace-of-cups", "the-fool"]);
  });
  it("collected 필터에 만난 카드가 없으면 빈 배열", () => {
    expect(visibleCards(cards, "collected", new Set())).toEqual([]);
  });
  it("major 필터는 메이저 22장", () => {
    expect(visibleCards(cards, "major", new Set())).toHaveLength(22);
  });
  it("수트 필터는 그 수트 14장", () => {
    expect(visibleCards(cards, "cups", new Set())).toHaveLength(14);
  });
});
