"use client";

import { CardArt } from "@/components/CardArt";
import type { Card } from "@/data/cards";
import { useSelectedDeck, type Orientation } from "@/lib/store";

/**
 * 서버 컴포넌트 페이지에서 쓰는, 선택된 덱을 따라가는 카드 아트.
 * deckOverride를 주면 전역 선택 대신 그 덱으로 고정한다(리딩 결과 → 상세처럼,
 * 특정 덱 문맥을 이어받아야 할 때). override가 있으면 flash 게이트도 불필요.
 */
export function DeckAwareArt({
  card,
  sizes,
  priority = false,
  deckOverride,
  orientation,
}: {
  card: Card;
  sizes: string;
  priority?: boolean;
  deckOverride?: string;
  orientation?: Orientation;
}) {
  const { deckId, ready } = useSelectedDeck();
  const resolvedDeck = deckOverride ?? deckId;
  // 선택된 덱을 읽기 전에는 잘못된 덱(기본 classic) 아트가 잠깐 보이지 않도록
  // 부모와 같은 어두운 배경의 자리표시자만 채운다(레이아웃 시프트 없음).
  // override가 있으면 이미 확정된 덱이라 게이트가 필요 없다.
  if (!deckOverride && !ready) return <div className="h-full w-full bg-ink-2" />;
  return (
    <CardArt
      card={card}
      deckId={resolvedDeck}
      sizes={sizes}
      priority={priority}
      orientation={orientation}
    />
  );
}
