import { describe, expect, it } from "vitest";
import { cards } from "./cards";
import {
  EN_UPRIGHT_FOCUS_IDS,
  EN_UPRIGHT_POSITION_IDS,
  enUprightFocus,
  enUprightFocusParagraphOf,
  enUprightPositions,
  enUprightPositionParagraphOf,
} from "./en-upright-reading";
import { enFocusParagraphOf, enPositionParagraphOf } from "./en-reading";

const SLUGS = cards.map((card) => card.slug);
const KOREAN = /[\u3131-\u318e\uac00-\ud7a3]/;
const DETERMINISTIC = /\b(will|shall|certainly|guaranteed|destined|inevitable)\b/i;

function wordNgrams(text: string, size: number): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9' ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  return new Set(
    words.slice(0, Math.max(0, words.length - size + 1)).map((_, index) =>
      words.slice(index, index + size).join(" "),
    ),
  );
}

function sharedNgrams(texts: string[], size: number): string[] {
  const [first, ...rest] = texts.map((text) => wordNgrams(text, size));
  return [...first].filter((value) => rest.every((set) => set.has(value)));
}

describe("English upright reading corpus", () => {
  it("covers 5 focuses × 78 cards with materialized context-specific prose", () => {
    const allParagraphs: string[] = [];
    for (const focus of EN_UPRIGHT_FOCUS_IDS) {
      expect(Object.keys(enUprightFocus[focus]).sort(), focus).toEqual([...SLUGS].sort());
      const paragraphs = SLUGS.map((slug) => enUprightFocus[focus][slug]);
      expect(new Set(paragraphs).size, `${focus}/unique`).toBe(SLUGS.length);
      for (const card of cards) {
        const text = enUprightFocusParagraphOf(focus, card.slug);
        expect(text?.trim(), `${focus}/${card.slug}`).toBeTruthy();
        expect(text, `${focus}/${card.slug}/card name`).toContain(card.nameEn);
        expect(KOREAN.test(text ?? ""), `${focus}/${card.slug}/Korean`).toBe(false);
        expect(DETERMINISTIC.test(text ?? ""), `${focus}/${card.slug}/certainty`).toBe(false);
        allParagraphs.push(text ?? "");
      }
    }
    expect(allParagraphs).toHaveLength(390);
    expect(new Set(allParagraphs).size).toBe(390);

    for (const card of cards) {
      const paragraphs = EN_UPRIGHT_FOCUS_IDS.map((focus) => enUprightFocus[focus][card.slug]);
      expect(new Set(paragraphs).size, `${card.slug}/five distinct focuses`).toBe(5);
      expect(sharedNgrams(paragraphs, 5), `${card.slug}/shared five-word material`).toEqual([]);
    }
  });

  it("covers 3 positions × 78 cards with separately authored temporal meaning", () => {
    expect(Object.keys(enUprightPositions).sort()).toEqual([...SLUGS].sort());
    const allParagraphs: string[] = [];
    for (const card of cards) {
      const entry = enUprightPositions[card.slug];
      expect(Object.keys(entry).sort(), card.slug).toEqual([...EN_UPRIGHT_POSITION_IDS].sort());
      const paragraphs = EN_UPRIGHT_POSITION_IDS.map((position) => entry[position]);
      expect(new Set(paragraphs).size, `${card.slug}/unique positions`).toBe(3);
      for (const position of EN_UPRIGHT_POSITION_IDS) {
        const text = enUprightPositionParagraphOf(position, card.slug);
        expect(text?.trim(), `${card.slug}/${position}`).toBeTruthy();
        expect(text, `${card.slug}/${position}/card name`).toContain(card.nameEn);
        expect(KOREAN.test(text ?? ""), `${card.slug}/${position}/Korean`).toBe(false);
        expect(DETERMINISTIC.test(text ?? ""), `${card.slug}/${position}/certainty`).toBe(false);
        allParagraphs.push(text ?? "");
      }
      expect(sharedNgrams(paragraphs, 5), `${card.slug}/shared position material`).toEqual([]);
    }
    expect(allParagraphs).toHaveLength(234);
    expect(new Set(allParagraphs).size).toBe(234);
  });

  it("returns null for unknown focuses and slugs", () => {
    expect(enUprightFocusParagraphOf("day", "the-fool")).toBeNull();
    expect(enUprightFocusParagraphOf("love", "missing-card")).toBeNull();
    expect(enUprightPositionParagraphOf("present", "missing-card")).toBeNull();
  });

  it("is used by the public English reading helpers for upright cards", () => {
    for (const card of cards) {
      for (const focus of EN_UPRIGHT_FOCUS_IDS) {
        expect(enFocusParagraphOf(focus, card.slug)).toBe(
          enUprightFocus[focus][card.slug],
        );
      }
      for (const position of EN_UPRIGHT_POSITION_IDS) {
        expect(enPositionParagraphOf(position, card.slug)).toBe(
          enUprightPositions[card.slug][position],
        );
      }
    }
    expect(enFocusParagraphOf("day", "the-fool")).toBeNull();
  });
});
