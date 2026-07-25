import { describe, expect, it } from "vitest";
import { cards } from "./cards";
import { koPositions } from "./ko-positions";
import { reversedPositions } from "./reversed-positions";

const SLUGS = cards.map((c) => c.slug);
const KEYS = ["past", "present", "future"] as const;

function sentenceCount(text: string): number {
  return (text.match(/[.!?](\s|$)/g) ?? []).length;
}

/** 가독성 규칙(문장 40자 내외)의 상한. 검수에서 길이 무검증이 지적돼 추가했다. */
const MAX_SENTENCE_CHARS = 45;

function longestSentence(text: string): number {
  return Math.max(
    ...text.split(/(?<=[.!?])\s+/).map((s) => s.trim().length),
  );
}

describe.each([
  ["정방향", koPositions],
  ["역방향", reversedPositions],
] as const)("%s 포지션 문단", (_label, table) => {
  it("78×3 전수, 각 2~4문장", () => {
    for (const slug of SLUGS) {
      const entry = table[slug];
      expect(entry, slug).toBeDefined();
      for (const key of KEYS) {
        const text = entry[key];
        expect(text?.trim(), `${slug}/${key}`).toBeTruthy();
        const n = sentenceCount(text);
        expect(n, `${slug}/${key} 문장 수 ${n}`).toBeGreaterThanOrEqual(2);
        expect(n, `${slug}/${key} 문장 수 ${n}`).toBeLessThanOrEqual(4);
        const longest = longestSentence(text);
        expect(
          longest,
          `${slug}/${key} 최장 문장 ${longest}자`,
        ).toBeLessThanOrEqual(MAX_SENTENCE_CHARS);
      }
    }
  });
});
