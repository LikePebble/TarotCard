import { cardBySlug } from "../cards";
import { loreCups } from "./cups";
import { loreCupsEn } from "./en-cups";
import { loreMajorEn } from "./en-major";
import { lorePentaclesEn } from "./en-pentacles";
import { loreSwordsEn } from "./en-swords";
import { loreWandsEn } from "./en-wands";
import { loreMajor } from "./major";
import { lorePentacles } from "./pentacles";
import { loreSwords } from "./swords";
import { loreWands } from "./wands";
import type { CardLore, LoreSymbol } from "./types";
import type { Locale } from "@/lib/locale";

export type { CardLore, LoreSymbol } from "./types";

export const loreBySlug: Record<string, CardLore> = {
  ...loreMajor,
  ...loreWands,
  ...loreCups,
  ...loreSwords,
  ...lorePentacles,
};

export const loreEnBySlug: Record<string, CardLore> = {
  ...loreMajorEn,
  ...loreWandsEn,
  ...loreCupsEn,
  ...loreSwordsEn,
  ...lorePentaclesEn,
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

const NUMBER_MEANING_EN: Record<number, string> = {
  1: "Beginnings",
  2: "Balance · Choice",
  3: "Growth · Connection",
  4: "Stability · Structure",
  5: "Conflict · Change",
  6: "Harmony · Recovery",
  7: "Reflection · Trial",
  8: "Mastery · Movement",
  9: "Fulfillment · Maturity",
  10: "Completion · Transition",
};

export type CardLoreView = {
  symbols: LoreSymbol[];
  story: string;
  correspondence: { label: string; value: string }[];
};

/** 상세 화면이 쓰는 단일 진입점. lore 데이터 + 규칙 산출값(원소·수비학)을 합친다. */
export function cardLore(slug: string, locale: Locale = "ko"): CardLoreView | null {
  const lore = locale === "en" ? loreEnBySlug[slug] : loreBySlug[slug];
  const card = cardBySlug.get(slug);
  if (!lore || !card) return null;

  if (locale === "en") {
    const correspondence: { label: string; value: string }[] = [];
    if (card.suit) {
      const elements = { wands: "Fire", cups: "Water", swords: "Air", pentacles: "Earth" };
      correspondence.push({ label: "Element", value: elements[card.suit] });
      const numerology = NUMBER_MEANING_EN[card.number];
      if (numerology) correspondence.push({ label: "Number", value: numerology });
    }
    if (lore.astrology) {
      correspondence.push({ label: "Astrology", value: lore.astrology });
    }
    return { symbols: lore.symbols, story: lore.story, correspondence };
  }

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
