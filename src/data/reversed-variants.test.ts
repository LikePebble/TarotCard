import { describe, expect, it } from "vitest";
import { cards } from "./cards";
import { reversedCards } from "./reversed";
import { reversedFocus } from "./reversed-focus";
import { reversedPositions } from "./reversed-positions";

const THEMES = ["love", "work", "self", "health", "money"] as const;
const SLUGS = cards.map((c) => c.slug);

describe("역방향 변형", () => {
  it("테마 5×78 전수, 비어 있지 않음", () => {
    for (const theme of THEMES) {
      const block = reversedFocus[theme];
      expect(block, theme).toBeDefined();
      for (const slug of SLUGS) {
        expect(block![slug]?.trim(), `${theme}/${slug}`).toBeTruthy();
      }
    }
  });
  it("포지션 78×3 전수, 비어 있지 않음", () => {
    for (const slug of SLUGS) {
      const p = reversedPositions[slug];
      expect(p, slug).toBeDefined();
      expect(p.past.trim(), `${slug} past`).toBeTruthy();
      expect(p.present.trim(), `${slug} present`).toBeTruthy();
      expect(p.future.trim(), `${slug} future`).toBeTruthy();
    }
  });
  it("변형은 정본 문장을 통째로 재사용하지 않는다", () => {
    // 정본 각 문장(15자 이상)이 변형에 그대로 들어가면 재저작 실패의 신호다.
    for (const slug of SLUGS) {
      const canonical = reversedCards[slug]?.ko ?? "";
      const sentences = canonical
        .split(/[.!?。]\s*/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 15);
      for (const theme of THEMES) {
        const text = reversedFocus[theme]?.[slug] ?? "";
        for (const sen of sentences) {
          expect(text.includes(sen), `${theme}/${slug} 정본 문장 재사용`).toBe(false);
        }
      }
    }
  });
});
