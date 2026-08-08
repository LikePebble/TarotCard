import { describe, expect, it } from "vitest";
import { cards } from "@/data/cards";
import { cardGroups, cardIndexLabel, suitNeighbors } from "@/lib/card-index";

describe("cardGroups", () => {
  it("다섯 무리로 나눈다", () => {
    expect(cardGroups().map((g) => g.id)).toEqual([
      "major",
      "wands",
      "cups",
      "swords",
      "pentacles",
    ]);
  });

  /*
   * 이 색인이 존재하는 이유가 78쪽 전부에 링크를 주는 것이다. 한 장이라도
   * 빠지면 그 카드는 다시 고아 페이지가 되고, 그 사실은 눈으로 보이지 않는다.
   */
  it("78장을 한 장도 빠뜨리지 않는다", () => {
    const listed = cardGroups().flatMap((g) => g.cards.map((c) => c.slug));
    expect(listed).toHaveLength(cards.length);
    expect(new Set(listed).size).toBe(cards.length);
    expect([...listed].sort()).toEqual([...cards.map((c) => c.slug)].sort());
  });

  it("메이저는 22장, 각 수트는 14장이다", () => {
    const [major, ...suits] = cardGroups();
    expect(major.cards).toHaveLength(22);
    for (const s of suits) expect(s.cards).toHaveLength(14);
  });

  it("무리 안에서 번호순으로 정렬한다", () => {
    for (const g of cardGroups()) {
      const nums = g.cards.map((c) => c.number);
      expect(nums).toEqual([...nums].sort((a, b) => a - b));
    }
  });

  // 목록만 있는 얇은 페이지는 색인되지 않는다. 무리마다 설명이 있어야 한다.
  it("무리마다 제목과 설명을 갖는다", () => {
    for (const g of cardGroups()) {
      expect(g.title.length).toBeGreaterThan(0);
      expect(g.blurb.length).toBeGreaterThan(30);
    }
  });
});

describe("cardIndexLabel", () => {
  it("메이저는 로마 숫자를 쓴다", () => {
    const fool = cards.find((c) => c.slug === "the-fool")!;
    expect(cardIndexLabel(fool).ordinal).toBe("0");
    const magician = cards.find((c) => c.slug === "the-magician")!;
    expect(cardIndexLabel(magician).ordinal).toBe("I");
  });

  it("마이너는 아라비아 숫자를 쓴다", () => {
    const card = cards.find((c) => c.suit === "cups" && c.number === 8)!;
    expect(cardIndexLabel(card).ordinal).toBe("8");
  });

  it("78장 모두 한글 이름을 갖는다", () => {
    const missing = cards.filter((c) => cardIndexLabel(c).ko === c.nameEn);
    expect(missing.map((c) => c.slug)).toEqual([]);
  });
});

describe("suitNeighbors", () => {
  it("무리의 처음과 끝에서는 한쪽이 없다", () => {
    expect(suitNeighbors("the-fool").prev).toBeNull();
    const last = cardGroups()[0].cards.at(-1)!;
    expect(suitNeighbors(last.slug).next).toBeNull();
  });

  it("같은 무리 안에서만 이어진다", () => {
    const cups = cardGroups().find((g) => g.id === "cups")!;
    const mid = cups.cards[5];
    const { prev, next } = suitNeighbors(mid.slug);
    expect(prev?.suit).toBe("cups");
    expect(next?.suit).toBe("cups");
  });

  /*
   * 앞뒤 링크가 모든 카드를 이어야 크롤러가 목록을 거치지 않고도 옆 카드로
   * 갈 수 있다. 한 장이라도 양쪽이 다 비면 거기서 경로가 끊긴다.
   */
  it("모든 카드가 적어도 한쪽 이웃을 갖는다", () => {
    for (const card of cards) {
      const { prev, next } = suitNeighbors(card.slug);
      expect(prev ?? next, `${card.slug}에 이웃이 없다`).not.toBeNull();
    }
  });

  it("없는 슬러그는 조용히 빈 이웃을 준다", () => {
    expect(suitNeighbors("없는-카드")).toEqual({ prev: null, next: null });
  });
});
