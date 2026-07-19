import wolhaBiwon from "../../public/decks/wolha-biwon/deck.json";
import type { Card } from "./cards";

export type CanvasMode = "baked" | "overlay" | "frame-only";

export type Deck = {
  id: string;
  nameKo: string;
  active: boolean;
  price?: number;
  /** 카드별 캔버스 모드. docs/deck-canvas-guide.md 참조. */
  canvasDefault: CanvasMode;
  canvasOverrides: Record<string, CanvasMode>;
  /** overlay 카드가 있는 덱의 공통 프레임 경로. */
  frame?: string;
};

export const decks: Deck[] = [
  {
    id: "classic",
    nameKo: "클래식 덱",
    active: true,
    // 캔버스가 아트에 포함된 스캔본. 오버레이 없음.
    canvasDefault: "baked",
    canvasOverrides: {},
  },
  {
    id: wolhaBiwon.id,
    nameKo: wolhaBiwon.nameKo,
    active: true,
    canvasDefault: wolhaBiwon.canvasDefault as CanvasMode,
    canvasOverrides: wolhaBiwon.canvasOverrides as Record<string, CanvasMode>,
    frame: `/decks/${wolhaBiwon.id}/frame.png`,
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

export function canvasModeOf(deckId: string, slug: string): CanvasMode {
  const deck = deckById(deckId);
  return deck.canvasOverrides[slug] ?? deck.canvasDefault;
}
