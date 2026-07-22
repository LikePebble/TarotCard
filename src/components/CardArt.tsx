import Image from "next/image";
import type { Card } from "@/data/cards";
import { deckArtSrc, deckById } from "@/data/decks";
import { koCards } from "@/data/ko";
import type { Orientation } from "@/lib/store";

/**
 * 덱 인지 카드 아트. 모든 덱의 아트가 프레임·카드명까지 구워진(baked) 이미지라
 * 여기서는 덱에 맞는 아트를 그대로 채워 넣기만 한다.
 * 역방향이면 아트를 180도 돌린다 — 별도 역방향 이미지는 없다.
 */
export function CardArt({
  card,
  deckId,
  sizes,
  priority = false,
  className = "",
  orientation = "upright",
}: {
  card: Card;
  deckId: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  orientation?: Orientation;
}) {
  const deck = deckById(deckId);
  const nameKo = koCards[card.slug]?.nameKo ?? card.nameEn;

  return (
    <div className={`relative h-full w-full ${className}`}>
      <Image
        src={deckArtSrc(deck.id, card)}
        alt={`${nameKo} ${card.nameEn}`}
        fill
        sizes={sizes}
        className={
          orientation === "reversed" ? "rotate-180 object-cover" : "object-cover"
        }
        priority={priority}
      />
    </div>
  );
}
