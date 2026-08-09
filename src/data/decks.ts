import chuchuTarot from "../../public/decks/chuchu-tarot-v1/deck.json";
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
  /** public 기준 경로. 모달에서 순서대로 세로 스크롤한다. */
  productImages?: string[];
  /** 상품 이미지 비율. 없으면 기존 덱 규격인 10:17을 쓴다. */
  productImageAspectRatio?: string;
};

export type Deck = {
  id: string;
  nameKo: string;
  nameEn?: string;
  active: boolean;
  /** 덱 고유 카드 뒷면 이미지. 없는 덱은 내장 CSS 뒷면으로 떨어진다. */
  cardBack?: string;
  info: DeckInfo;
  infoEn?: DeckInfo;
};

export function deckName(deck: Deck, locale: "ko" | "en"): string {
  return locale === "en" ? deck.nameEn ?? deck.nameKo : deck.nameKo;
}

export function deckInfo(deck: Deck, locale: "ko" | "en"): DeckInfo {
  return locale === "en" ? deck.infoEn ?? deck.info : deck.info;
}

const FALLBACK_INFO: DeckInfo = { description: [] };

export const decks: Deck[] = [
  {
    id: "classic",
    nameKo: "클래식 덱",
    nameEn: "Classic deck",
    active: true,
    info: {
      description: [
        "한 세기 넘게 타로의 표준이 되어 온 라이더-웨이트 도상을 담은 기본 덱입니다. 카드마다 장면이 이야기처럼 그려져 있어, 처음 만나는 분에게 가장 편안한 출발점이 됩니다.",
        "모든 리딩과 도감에서 언제나 무료로 쓸 수 있습니다.",
      ],
    },
    infoEn: {
      description: [
        "This foundational deck uses the Rider–Waite images that have shaped modern tarot for more than a century. Its narrative scenes make a welcoming place to begin.",
        "It is always available at no cost for readings and your collection.",
      ],
    },
  },
  {
    id: chuchuTarot.id,
    nameKo: chuchuTarot.nameKo,
    nameEn: "Chuchu's Day",
    active: true,
    cardBack: `/decks/${chuchuTarot.id}/card-back.webp`,
    info: (chuchuTarot as { info?: DeckInfo }).info ?? FALLBACK_INFO,
    infoEn: {
      eyebrow: "A DAY WITH CHUCHU TAROT",
      headline: "Create a fateful little scene\nwith lovable Chuchu today.",
      description: [
        "From small adventures above the clouds to warm promises under the night sky, Chuchu's Day retells all 78 Rider–Waite symbols with a gentle storybook sensibility.",
        "The traditional upright and reversed meanings remain intact, while soft color, expressive faces, and tiny details make every card feel close at hand.",
      ],
      highlights: [
        "78 storybook scenes in Chuchu's own world",
        "Immersive art that keeps traditional upright and reversed meanings",
        "Full card art and your personal collection available immediately",
      ],
    },
  },
  {
    id: wolhaBiwon.id,
    nameKo: wolhaBiwon.nameKo,
    nameEn: "Moonlit Secret Garden",
    active: true,
    cardBack: `/decks/${wolhaBiwon.id}/card-back.webp`,
    info: (wolhaBiwon as { info?: DeckInfo }).info ?? FALLBACK_INFO,
    infoEn: {
      eyebrow: "KOREAN MOON GARDEN TAROT",
      headline: "Under moonlight,\nyour heart comes into focus.",
      description: [
        "A black bamboo grove, a hidden garden, and connections blooming in moonlight become 78 scenes. Familiar tarot symbols unfold as quiet Eastern fantasy.",
        "Traditional meanings stay in place while gazes, seasonal texture, and shifting moonlight give the emotional current a clear, intuitive shape.",
      ],
      highlights: [
        "A complete 78-card deck reimagined as Korean moonlit fantasy",
        "Immersive art that respects traditional upright and reversed readings",
        "Full card art and collection access from the moment you receive it",
      ],
    },
  },
  {
    id: kpopMuseverse.id,
    nameKo: kpopMuseverse.nameKo,
    nameEn: "K-POP Museverse",
    active: true,
    cardBack: `/decks/${kpopMuseverse.id}/card-back.webp`,
    info: (kpopMuseverse as { info?: DeckInfo }).info ?? FALLBACK_INFO,
    infoEn: {
      eyebrow: "K-POP MUSEVERSE TAROT",
      headline: "Let today become\nyour brightest stage.",
      description: [
        "From pre-debut anticipation to choices on stage and what lingers after an encore, this deck reimagines K-pop's moments of growth and connection through 78 tarot scenes.",
        "Traditional meanings are preserved, with lighting, costume, performance, and relationships helping each scene's feeling and message come through naturally.",
      ],
      highlights: [
        "78 cinematic cards from debut through encore",
        "Tarot symbolism expanded through vibrant muses and stagecraft",
        "Full card art and collection access from the moment you receive it",
      ],
    },
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
