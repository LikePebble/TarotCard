import type { Card } from "@/data/cards";

/** 도감 그리드 필터. collected는 만남 기록이 있는 slug 집합이다. */
export function visibleCards(
  all: Card[],
  filter: string,
  collected: ReadonlySet<string>,
): Card[] {
  if (filter === "collected") return all.filter((c) => collected.has(c.slug));
  if (filter === "major") return all.filter((c) => c.arcana === "major");
  return all.filter((c) => c.suit === filter);
}
