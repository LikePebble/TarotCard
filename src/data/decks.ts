import kpopMuseverse from "../../public/decks/k-pop-museverse/deck.json";
import wolhaBiwon from "../../public/decks/wolha-biwon/deck.json";
import type { Card } from "./cards";

/** 모든 덱의 아트는 프레임·카드명까지 구워진 완성본이다(앱은 오버레이하지 않는다). */

/** 덱 상품 정보. 문구·가격·이미지는 출시 전 교체 가능한 임시본이다. */
export type DeckInfo = {
  eyebrow?: string;
  headline?: string;
  description: string[];
  highlights?: string[];
  price?: number;
  /** public 기준 경로. 첫 장은 800×1360(10:17) 상품 이미지, 이후 장은 모달에서 세로 스크롤. */
  productImages?: string[];
};

export type Deck = {
  id: string;
  nameKo: string;
  active: boolean;
  /** 덱 고유 카드 뒷면 이미지. 없는 덱은 내장 CSS 뒷면으로 떨어진다. */
  cardBack?: string;
  info: DeckInfo;
};

const FALLBACK_INFO: DeckInfo = { description: [] };

export const decks: Deck[] = [
  {
    id: "classic",
    nameKo: "클래식 덱",
    active: true,
    info: {
      description: [
        "한 세기 넘게 타로의 표준이 되어 온 라이더-웨이트 도상을 담은 기본 덱입니다. 카드마다 장면이 이야기처럼 그려져 있어, 처음 만나는 분에게 가장 편안한 출발점이 됩니다.",
        "모든 리딩과 도감에서 언제나 무료로 쓸 수 있습니다.",
      ],
    },
  },
  {
    id: wolhaBiwon.id,
    nameKo: wolhaBiwon.nameKo,
    active: true,
    cardBack: `/decks/${wolhaBiwon.id}/card-back.webp`,
    info: (wolhaBiwon as { info?: DeckInfo }).info ?? FALLBACK_INFO,
  },
  {
    id: kpopMuseverse.id,
    nameKo: kpopMuseverse.nameKo,
    active: true,
    cardBack: `/decks/${kpopMuseverse.id}/card-back.webp`,
    info: (kpopMuseverse as { info?: DeckInfo }).info ?? FALLBACK_INFO,
  },
];

export const DEFAULT_DECK_ID = "classic";

export function deckById(id: string): Deck {
  return decks.find((deck) => deck.id === id && deck.active) ?? decks[0];
}

/**
 * 덱 목록을 기본 덱이 맨 앞에 오도록 정렬한다.
 * 평소 쓰는 덱을 매번 찾아 내려가지 않게 하려는 것이므로, 나머지는
 * 원래 순서를 흐트러뜨리지 않는다.
 */
export function decksByDefaultFirst(defaultDeckId: string): Deck[] {
  const active = decks.filter((deck) => deck.active);
  return [
    ...active.filter((deck) => deck.id === defaultDeckId),
    ...active.filter((deck) => deck.id !== defaultDeckId),
  ];
}

/** 덱별 카드 아트 경로. 클래식은 레거시 이미지 파일명을 그대로 쓴다. */
export function deckArtSrc(deckId: string, card: Card): string {
  return deckById(deckId).id === "classic"
    ? card.image
    : `/decks/${deckById(deckId).id}/art/${card.slug}.webp`;
}
