import { describe, expect, it } from "vitest";
import { cards } from "../cards";
import { cardLore, loreBySlug } from "./index";
import { loreCups } from "./cups";
import { loreMajor } from "./major";
import { loreWands } from "./wands";

describe("cardLore", () => {
  it("lore가 없는 slug에 null을 돌려준다", () => {
    expect(cardLore("no-such-card")).toBeNull();
  });
});
// 규칙 매핑(원소·수비학·데칸 행 조립)의 실질 검증은 데이터가 생기는
// Task 2(메이저: 점성술 행만)와 Task 3(마이너: 3행 전부)의 테스트가 맡는다.

describe("메이저 아르카나 lore", () => {
  it("22장 전수 존재", () => {
    const majorSlugs = cards.filter((c) => c.arcana === "major").map((c) => c.slug);
    for (const slug of majorSlugs) {
      expect(loreMajor[slug], `${slug} 누락`).toBeDefined();
    }
    expect(Object.keys(loreMajor)).toHaveLength(22);
  });
  it("메이저는 전 카드 astrology를 가진다", () => {
    for (const [slug, lore] of Object.entries(loreMajor)) {
      expect(lore.astrology, `${slug} astrology 누락`).toBeDefined();
    }
  });
  it("메이저 대응은 점성술 행만 갖는다(원소·수비학 행 없음)", () => {
    const view = cardLore("the-fool");
    expect(view).not.toBeNull();
    expect(view!.correspondence).toEqual([
      { label: "점성술", value: "천왕성 · 공기" },
    ]);
  });
});

describe("완드 lore", () => {
  it("14장 전수 존재", () => {
    const wandSlugs = cards.filter((c) => c.suit === "wands").map((c) => c.slug);
    for (const slug of wandSlugs) {
      expect(loreWands[slug], `${slug} 누락`).toBeDefined();
    }
    expect(Object.keys(loreWands)).toHaveLength(14);
  });
  it("마이너 숫자 카드 대응은 원소·수비학·점성술 3행", () => {
    const view = cardLore("two-of-wands");
    expect(view).not.toBeNull();
    expect(view!.correspondence).toEqual([
      { label: "원소", value: "불" },
      { label: "수비학", value: "균형 · 선택" },
      { label: "점성술", value: "화성 · 양자리" },
    ]);
  });
  it("에이스는 점성술 행이 없다", () => {
    const view = cardLore("ace-of-wands");
    expect(view).not.toBeNull();
    expect(view!.correspondence).toEqual([
      { label: "원소", value: "불" },
      { label: "수비학", value: "시작" },
    ]);
  });
});

describe("컵 lore", () => {
  it("14장 전수 존재", () => {
    const cupSlugs = cards.filter((c) => c.suit === "cups").map((c) => c.slug);
    for (const slug of cupSlugs) {
      expect(loreCups[slug], `${slug} 누락`).toBeDefined();
    }
    expect(Object.keys(loreCups)).toHaveLength(14);
  });
});

describe("lore 형식", () => {
  it("등록된 모든 lore가 형식을 지킨다", () => {
    for (const [slug, lore] of Object.entries(loreBySlug)) {
      expect(lore.symbols.length, `${slug} symbols 수`).toBeGreaterThanOrEqual(3);
      expect(lore.symbols.length, `${slug} symbols 수`).toBeLessThanOrEqual(5);
      for (const s of lore.symbols) {
        expect(s.name.trim(), `${slug} symbol name`).not.toBe("");
        expect(s.meaning.trim(), `${slug} symbol meaning`).not.toBe("");
      }
      const paragraphs = lore.story.split("\n\n");
      expect(paragraphs.length, `${slug} story 문단 수`).toBeGreaterThanOrEqual(1);
      expect(paragraphs.length, `${slug} story 문단 수`).toBeLessThanOrEqual(2);
      expect(lore.story.trim(), `${slug} story`).not.toBe("");
      if (lore.astrology !== undefined) {
        expect(lore.astrology.trim(), `${slug} astrology`).not.toBe("");
      }
      expect(cards.some((c) => c.slug === slug), `${slug}는 실제 카드`).toBe(true);
    }
  });
});
