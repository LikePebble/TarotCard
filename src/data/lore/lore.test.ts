import { describe, expect, it } from "vitest";
import { cards } from "../cards";
import { cardLore, loreBySlug } from "./index";

describe("cardLore", () => {
  it("lore가 없는 slug에 null을 돌려준다", () => {
    expect(cardLore("the-fool")).toBeNull(); // Task 2가 데이터를 채우면 이 단언을 교체한다(Task 2 Step 1 참조)
    expect(cardLore("no-such-card")).toBeNull();
  });
});
// 규칙 매핑(원소·수비학·데칸 행 조립)의 실질 검증은 데이터가 생기는
// Task 2(메이저: 점성술 행만)와 Task 3(마이너: 3행 전부)의 테스트가 맡는다.

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
