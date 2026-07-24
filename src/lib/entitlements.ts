import { cards } from "@/data/cards";

/** 이 사용자가 가진 것. 클래식은 여기 안 넣는다(암묵 소유). */
export type Entitlements = { ownedDeckIds: string[]; adFree: boolean };

export const EMPTY_ENTITLEMENTS: Entitlements = {
  ownedDeckIds: [],
  adFree: false,
};

/** 78장 전체 슬러그. 소유 덱의 도감 완성도 기준. */
const ALL_SLUGS: ReadonlySet<string> = new Set(cards.map((c) => c.slug));

/** 클래식은 모두 소유. 프리미엄은 entitlements에 있을 때만. */
export function ownsDeck(deckId: string, ent: Entitlements): boolean {
  return deckId === "classic" || ent.ownedDeckIds.includes(deckId);
}

/** 도감 완성도 = 소유면 78, 아니면 0(부분 수집 없음). */
export function collectedCount(deckId: string, ent: Entitlements): number {
  return ownsDeck(deckId, ent) ? ALL_SLUGS.size : 0;
}

/** 소유 덱은 전체 슬러그, 미소유는 빈 집합. */
export function collectedSlugs(deckId: string, ent: Entitlements): Set<string> {
  return ownsDeck(deckId, ent) ? new Set(ALL_SLUGS) : new Set();
}
