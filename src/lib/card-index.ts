import { cards, romanNumeral, type Card } from "@/data/cards";
import { koCards } from "@/data/ko";

/**
 * 카드 목록 색인의 순수 로직.
 *
 * 왜 이 화면이 필요한가: 사이트 어디에도 카드 상세로 가는 링크가 없었다. 도감은
 * **아직 만나지 않은 카드를 링크로 만들지 않는다** — 뒤집힌 카드를 눌러 해석이
 * 다 보이면 수집이라는 행위가 의미를 잃기 때문이고, 그 판단은 옳다. 다만 그
 * 결과로 78쪽이 전부 고아 페이지가 되어, 구글이 sitemap으로 URL만 알고 크롤링은
 * 하지 않는 상태가 됐다(87쪽 중 54쪽 미색인, 그중 53쪽이 "발견됨 – 크롤링되지 않음").
 *
 * 이 색인은 도감과 다른 화면이다. 도감은 **내가 무엇을 모았는지**를 보여 주고,
 * 여기는 **카드가 무슨 뜻인지 찾아보는 곳**이다. 카드 상세는 원래부터 누구에게나
 * 열려 있고 sitemap에도 올라가 있으므로 이 목록이 새로 여는 것은 없다. 없던 것은
 * 사람과 크롤러가 걸어갈 길뿐이다.
 */

export type CardGroup = {
  /** 앵커와 key로 쓰는 식별자. */
  id: "major" | "wands" | "cups" | "swords" | "pentacles";
  title: string;
  /** 그 무리가 무엇을 다루는지 한 줄. 목록만 있는 얇은 페이지가 되지 않게 한다. */
  blurb: string;
  cards: Card[];
};

const SUIT_ORDER = ["wands", "cups", "swords", "pentacles"] as const;

const SUIT_META: Record<
  (typeof SUIT_ORDER)[number],
  { title: string; blurb: string }
> = {
  wands: {
    title: "완드 (Wands)",
    blurb:
      "불의 원소. 의지와 열정, 무언가를 시작하고 밀고 나가는 힘을 다룹니다. 일과 계획, 하고 싶은 마음이 여기에 실립니다.",
  },
  cups: {
    title: "컵 (Cups)",
    blurb:
      "물의 원소. 감정과 관계, 마음이 흐르는 방향을 다룹니다. 사랑과 우정, 위로와 상실이 여기에 담깁니다.",
  },
  swords: {
    title: "소드 (Swords)",
    blurb:
      "공기의 원소. 생각과 말, 판단과 갈등을 다룹니다. 날카로운 만큼 베이기도 쉬운 자리입니다.",
  },
  pentacles: {
    title: "펜타클 (Pentacles)",
    blurb:
      "흙의 원소. 몸과 돈, 눈에 보이고 손에 잡히는 것을 다룹니다. 일상과 건강, 쌓아 온 것이 여기에 있습니다.",
  },
};

/** 카드 목록을 메이저 → 완드 → 컵 → 소드 → 펜타클 순으로 묶는다. */
export function cardGroups(): CardGroup[] {
  const major = cards
    .filter((c) => c.arcana === "major")
    .sort((a, b) => a.number - b.number);
  const groups: CardGroup[] = [
    {
      id: "major",
      title: "메이저 아르카나 (Major Arcana)",
      blurb:
        "22장. 삶의 큰 흐름과 전환을 다룹니다. 리딩에서 나오면 그날의 중심 이야기가 되는 경우가 많습니다.",
      cards: major,
    },
  ];
  for (const suit of SUIT_ORDER) {
    groups.push({
      id: suit,
      ...SUIT_META[suit],
      cards: cards
        .filter((c) => c.suit === suit)
        .sort((a, b) => a.number - b.number),
    });
  }
  return groups;
}

/** 목록에 적을 카드 한 줄. 한글명이 없으면 영문명으로 물러선다. */
export function cardIndexLabel(card: Card): { ko: string; en: string; ordinal: string } {
  return {
    ko: koCards[card.slug]?.nameKo ?? card.nameEn,
    en: card.nameEn,
    ordinal:
      card.arcana === "major" ? romanNumeral(card.number) : String(card.number),
  };
}

/**
 * 같은 무리에서 앞뒤 카드. 카드 상세끼리 서로 링크해 크롤 깊이를 줄인다.
 *
 * 도감의 `CollectedCardNav`와 다르다. 그쪽은 **수집한 카드 사이에서만** 움직여
 * 게임을 지키고, 이쪽은 수집과 무관하게 항상 같은 이웃을 가리키는 정적 링크라
 * 서버에서 렌더된다 — 크롤러가 볼 수 있어야 하는 것이 바로 이 링크다.
 */
export function suitNeighbors(slug: string): { prev: Card | null; next: Card | null } {
  const group = cardGroups().find((g) => g.cards.some((c) => c.slug === slug));
  if (!group) return { prev: null, next: null };
  const i = group.cards.findIndex((c) => c.slug === slug);
  return {
    prev: i > 0 ? group.cards[i - 1] : null,
    next: i < group.cards.length - 1 ? group.cards[i + 1] : null,
  };
}
