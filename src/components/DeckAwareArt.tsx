"use client";

import { CardArt } from "@/components/CardArt";
import type { Card } from "@/data/cards";
import { useSelectedDeck } from "@/lib/store";

/** 서버 컴포넌트 페이지에서 쓰는, 선택된 덱을 따라가는 카드 아트. */
export function DeckAwareArt({
  card,
  sizes,
  priority = false,
  showText = false,
}: {
  card: Card;
  sizes: string;
  priority?: boolean;
  showText?: boolean;
}) {
  const { deckId } = useSelectedDeck();
  return (
    <CardArt
      card={card}
      deckId={deckId}
      sizes={sizes}
      priority={priority}
      showText={showText}
    />
  );
}
