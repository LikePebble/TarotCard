import { cardBySlug } from "../cards";
import { loreCups } from "./cups";
import { loreMajor } from "./major";
import { lorePentacles } from "./pentacles";
import { loreSwords } from "./swords";
import { loreWands } from "./wands";
import type { CardLore, LoreSymbol } from "./types";

export type { CardLore, LoreSymbol } from "./types";

export const loreBySlug: Record<string, CardLore> = {
  ...loreMajor,
  ...loreWands,
  ...loreCups,
  ...loreSwords,
  ...lorePentacles,
};

const SUIT_ELEMENT = {
  wands: "불",
  cups: "물",
  swords: "공기",
  pentacles: "흙",
} as const;

/** 마이너 1~10의 수비학. 코트(11~14)와 메이저에는 표시하지 않는다. */
const NUMBER_MEANING: Record<number, string> = {
  1: "시작",
  2: "균형 · 선택",
  3: "확장 · 어울림",
  4: "안정 · 구조",
  5: "갈등 · 변화",
  6: "조화 · 회복",
  7: "성찰 · 시험",
  8: "숙련 · 움직임",
  9: "결실 · 성숙",
  10: "완성 · 전환",
};

export type CardLoreView = {
  symbols: LoreSymbol[];
  story: string;
  correspondence: { label: string; value: string }[];
};

/** 상세 화면이 쓰는 단일 진입점. lore 데이터 + 규칙 산출값(원소·수비학)을 합친다. */
export function cardLore(slug: string): CardLoreView | null {
  const lore = loreBySlug[slug];
  const card = cardBySlug.get(slug);
  if (!lore || !card) return null;

  const correspondence: { label: string; value: string }[] = [];
  if (card.suit) {
    correspondence.push({ label: "원소", value: SUIT_ELEMENT[card.suit] });
    const numerology = NUMBER_MEANING[card.number];
    if (numerology) correspondence.push({ label: "수비학", value: numerology });
  }
  if (lore.astrology) {
    correspondence.push({ label: "점성술", value: lore.astrology });
  }

  return { symbols: lore.symbols, story: lore.story, correspondence };
}
