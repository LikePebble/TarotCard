import { cards } from "@/data/cards";
import { decks } from "@/data/decks";
import { readingTypeOf, type ReadingTypeId, type SpreadType } from "@/data/reading-types";
import type { Orientation, ReadingRecord } from "@/lib/store";

const CARD_SLUGS = new Set(cards.map((card) => card.slug));
const DECK_IDS = new Set(decks.filter((deck) => deck.active).map((deck) => deck.id));
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const WEEK_RE = /^\d{4}-W\d{2}$/;

function nonEmptyString(value: unknown, max = 200): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= max;
}

function orientation(value: unknown): value is Orientation {
  return value === "upright" || value === "reversed";
}

/** localStorage·Supabase처럼 신뢰 경계 밖에서 들어온 리딩을 도메인 값으로 좁힌다. */
export function parseReadingRecord(
  raw: unknown,
  options: { requireKnownAssets?: boolean } = {},
): ReadingRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const spread: SpreadType | null =
    r.spread === "one" || r.spread === "three" ? r.spread : null;
  if (!spread) return null;
  const expected = readingTypeOf(spread);
  if (r.typeId !== expected.id) return null;
  if (!nonEmptyString(r.id) || !nonEmptyString(r.category, 80)) return null;
  if (!nonEmptyString(r.at) || !Number.isFinite(Date.parse(r.at))) return null;
  if (typeof r.localDate !== "string" || !DATE_RE.test(r.localDate)) return null;
  if (typeof r.isoWeek !== "string" || !WEEK_RE.test(r.isoWeek)) return null;
  if (!nonEmptyString(r.deckId, 80)) return null;
  if (!Array.isArray(r.cards) || r.cards.length !== expected.count) return null;
  if (!r.cards.every((slug) => nonEmptyString(slug, 80))) return null;
  if (new Set(r.cards).size !== r.cards.length) return null;
  if (!Array.isArray(r.orientations)) return null;
  // 방향 도입 전 기록은 빈 배열이다. 그 외에는 카드 수와 정확히 맞아야 한다.
  if (r.orientations.length !== 0 && r.orientations.length !== expected.count) {
    return null;
  }
  if (!r.orientations.every(orientation)) return null;
  if (
    options.requireKnownAssets &&
    (!DECK_IDS.has(r.deckId) || !r.cards.every((slug) => CARD_SLUGS.has(slug)))
  ) {
    return null;
  }

  return {
    id: r.id,
    at: r.at,
    localDate: r.localDate,
    isoWeek: r.isoWeek,
    spread,
    typeId: r.typeId as ReadingTypeId,
    category: r.category,
    deckId: r.deckId,
    cards: r.cards as string[],
    orientations: r.orientations as Orientation[],
  };
}
