import { describe, expect, it } from "vitest";
import { cards } from "./cards";
import {
  enReversedFocus,
  enReversedFocusParagraphOf,
  enReversedPositionParagraphOf,
  enReversedPositions,
} from "./en-reversed-reading";
import { enFocusParagraphOf, enPositionParagraphOf } from "./en-reading";
import { reversedCards } from "./reversed";

const FOCUS_IDS = ["love", "work", "self", "health", "money"] as const;
const POSITION_IDS = ["past", "present", "future"] as const;
const SLUGS = cards.map((card) => card.slug);

function longestSharedWordRun(left: string, right: string): number {
  const a = left.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? [];
  const b = right.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? [];
  let longest = 0;
  const previous = new Array(b.length + 1).fill(0);

  for (const word of a) {
    const current = new Array(b.length + 1).fill(0);
    for (let index = 0; index < b.length; index += 1) {
      if (word === b[index]) {
        current[index + 1] = previous[index] + 1;
        longest = Math.max(longest, current[index + 1]);
      }
    }
    previous.splice(0, previous.length, ...current);
  }

  return longest;
}

describe("English reversed reading corpus", () => {
  it("covers 5 focuses for all 78 cards with card-specific text", () => {
    expect(Object.keys(enReversedFocus)).toEqual(FOCUS_IDS);

    for (const focus of FOCUS_IDS) {
      expect(Object.keys(enReversedFocus[focus])).toEqual(SLUGS);
      const values = SLUGS.map((slug) => enReversedFocus[focus][slug]);
      expect(new Set(values).size, `${focus} duplicate entries`).toBe(78);

      for (const card of cards) {
        const text = enReversedFocus[focus][card.slug];
        expect(text.trim(), `${focus}/${card.slug}`).toBeTruthy();
        expect(text, `${focus}/${card.slug} card name`).toContain(card.nameEn);
        expect(text, `${focus}/${card.slug} Korean leak`).not.toMatch(/[가-힣]/);
      }
    }
  });

  it("covers past, present, and future for all 78 cards", () => {
    expect(Object.keys(enReversedPositions)).toEqual(SLUGS);

    for (const card of cards) {
      const block = enReversedPositions[card.slug];
      expect(Object.keys(block), card.slug).toEqual(POSITION_IDS);

      for (const position of POSITION_IDS) {
        const text = block[position];
        expect(text.trim(), `${card.slug}/${position}`).toBeTruthy();
        expect(text, `${card.slug}/${position} card name`).toContain(card.nameEn);
        expect(text, `${card.slug}/${position} Korean leak`).not.toMatch(/[가-힣]/);
      }
    }
  });

  it("materializes 624 globally unique contextual paragraphs", () => {
    const values = [
      ...FOCUS_IDS.flatMap((focus) => SLUGS.map((slug) => enReversedFocus[focus][slug])),
      ...SLUGS.flatMap((slug) =>
        POSITION_IDS.map((position) => enReversedPositions[slug][position]),
      ),
    ];

    expect(values).toHaveLength(78 * 8);
    expect(new Set(values).size).toBe(78 * 8);
  });

  it("does not reuse a card-level prose seed across contexts", () => {
    for (const card of cards) {
      const cardLabel = new RegExp(`${card.nameEn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} reversed`, "gi");
      const variants = [
        ...FOCUS_IDS.map((focus) => enReversedFocus[focus][card.slug]),
        ...POSITION_IDS.map((position) => enReversedPositions[card.slug][position]),
      ].map((text) => text.replace(cardLabel, "CARD"));

      expect(new Set(variants).size, `${card.slug} distinct contexts`).toBe(8);
      for (let left = 0; left < variants.length; left += 1) {
        for (let right = left + 1; right < variants.length; right += 1) {
          expect(
            longestSharedWordRun(variants[left], variants[right]),
            `${card.slug} contexts ${left}/${right} share a prose fragment`,
          ).toBeLessThanOrEqual(5);
        }
      }
    }
  });

  it("keeps future language conditional and avoids hard prediction", () => {
    for (const slug of SLUGS) {
      const text = enReversedPositions[slug].future;
      expect(text, slug).toMatch(/\b(may|might|could|if)\b/i);
      expect(text, slug).not.toMatch(/\b(will|certainly|guaranteed|destined|inevitable)\b/i);
    }
  });

  it("does not repeat a full canonical reversed sentence", () => {
    for (const slug of SLUGS) {
      const canonicalSentences = (reversedCards[slug]?.en ?? "")
        .split(/[.!?]\s+/)
        .map((sentence) => sentence.trim())
        .filter((sentence) => sentence.length >= 30);
      const variants = [
        ...FOCUS_IDS.map((focus) => enReversedFocus[focus][slug]),
        ...POSITION_IDS.map((position) => enReversedPositions[slug][position]),
      ];

      for (const variant of variants) {
        for (const sentence of canonicalSentences) {
          expect(variant.includes(sentence), `${slug} canonical sentence reuse`).toBe(false);
        }
      }
    }
  });

  it("returns null outside the authored matrix", () => {
    expect(enReversedFocusParagraphOf("day", "the-fool")).toBeNull();
    expect(enReversedFocusParagraphOf("love", "missing-card")).toBeNull();
    expect(enReversedPositionParagraphOf("past", "missing-card")).toBeNull();
  });

  it("is selected by the public English reading helpers", () => {
    expect(enFocusParagraphOf("love", "the-fool", true)).toBe(
      enReversedFocus.love["the-fool"],
    );
    expect(enPositionParagraphOf("future", "the-world", true)).toBe(
      enReversedPositions["the-world"].future,
    );
  });
});
