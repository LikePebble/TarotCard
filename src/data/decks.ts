import wolhaBiwon from "../../public/decks/wolha-biwon/deck.json";
import type { Card } from "./cards";

/** 모든 덱의 아트는 프레임·카드명까지 구워진 완성본이다(앱은 오버레이하지 않는다). */
export type Deck = {
  id: string;
  nameKo: string;
  active: boolean;
  price?: number;
};

export const decks: Deck[] = [
  {
    id: "classic",
    nameKo: "클래식 덱",
    active: true,
  },
  {
    id: wolhaBiwon.id,
    nameKo: wolhaBiwon.nameKo,
    active: true,
  },
];

export const DEFAULT_DECK_ID = "classic";

export function deckById(id: string): Deck {
  return decks.find((deck) => deck.id === id && deck.active) ?? decks[0];
}

/** 덱별 카드 아트 경로. 클래식은 레거시 이미지 파일명을 그대로 쓴다. */
export function deckArtSrc(deckId: string, card: Card): string {
  return deckById(deckId).id === "classic"
    ? card.image
    : `/decks/${deckById(deckId).id}/art/${card.slug}.webp`;
}
