import { describe, expect, it } from "vitest";
import { cards } from "@/data/cards";
import {
  catalogFilterOf,
  catalogCardUnlocked,
  catalogProgress,
  filterForCard,
  visibleCards,
} from "./catalog-filter";

describe("visibleCards", () => {
  it("major 필터는 메이저 22장", () => {
    expect(visibleCards(cards, "major")).toHaveLength(22);
  });

  it("수트 필터는 그 수트 14장", () => {
    expect(visibleCards(cards, "cups")).toHaveLength(14);
  });

  it("URL 필터는 허용 값만 받아들이고 카드 기본 필터를 찾는다", () => {
    expect(catalogFilterOf("pentacles")).toBe("pentacles");
    expect(catalogFilterOf("collected")).toBeNull();
    expect(catalogFilterOf(["cups"])).toBeNull();
    expect(filterForCard(cards.find((card) => card.slug === "king-of-pentacles")!)).toBe("pentacles");
  });
});

describe("프리미엄 도감 접근 정책", () => {
  const encountered = new Set(["the-fool"]);

  it("미구매자는 리딩에서 만난 카드만 열 수 있다", () => {
    expect(catalogCardUnlocked(false, encountered, "the-fool")).toBe(true);
    expect(catalogCardUnlocked(false, encountered, "the-world")).toBe(false);
    expect(catalogProgress(false, encountered, 78)).toBe(1);
  });

  it("구매자는 78장 전체를 열 수 있다", () => {
    expect(catalogCardUnlocked(true, encountered, "the-world")).toBe(true);
    expect(catalogProgress(true, encountered, 78)).toBe(78);
  });
});
