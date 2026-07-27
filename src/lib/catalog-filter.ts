import type { Card } from "@/data/cards";

export const CATALOG_FILTERS = [
  "major",
  "cups",
  "wands",
  "swords",
  "pentacles",
] as const;

export type CatalogFilter = (typeof CATALOG_FILTERS)[number];

export function catalogFilterOf(
  value: string | string[] | null | undefined,
): CatalogFilter | null {
  return typeof value === "string" && CATALOG_FILTERS.includes(value as CatalogFilter)
    ? (value as CatalogFilter)
    : null;
}

export function filterForCard(card: Card): CatalogFilter {
  return card.arcana === "major" ? "major" : (card.suit as CatalogFilter);
}

/** 구매자는 전체를, 미구매자는 리딩에서 만난 카드만 도감에서 열 수 있다. */
export function catalogCardUnlocked(
  owned: boolean,
  encountered: ReadonlySet<string>,
  slug: string,
): boolean {
  return owned || encountered.has(slug);
}

export function catalogProgress(
  owned: boolean,
  encountered: ReadonlySet<string>,
  total: number,
): number {
  return owned ? total : Math.min(encountered.size, total);
}

/** 아르카나/수트 단위로 카드 흐름을 만든다. */
export function visibleCards(
  all: Card[],
  filter: CatalogFilter,
): Card[] {
  return filter === "major"
    ? all.filter((card) => card.arcana === "major")
    : all.filter((card) => card.suit === filter);
}
