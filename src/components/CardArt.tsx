import Image from "next/image";
import { romanNumeral, type Card } from "@/data/cards";
import { canvasModeOf, deckArtSrc, deckById } from "@/data/decks";
import { koCards } from "@/data/ko";

/**
 * 덱 인지 카드 아트. baked 카드는 아트 그대로, overlay 카드는 덱 공통
 * 프레임을 덧그린다. showText는 큰 화면(공개, 상세)에서만 켜서 카드명과
 * 로마 숫자를 오버레이한다 (frame-only 카드는 프레임 없이 텍스트만).
 * docs/deck-canvas-guide.md의 레이아웃 규칙을 따른다.
 */
export function CardArt({
  card,
  deckId,
  sizes,
  priority = false,
  showText = false,
  className = "",
}: {
  card: Card;
  deckId: string;
  sizes: string;
  priority?: boolean;
  showText?: boolean;
  className?: string;
}) {
  const deck = deckById(deckId);
  const mode = canvasModeOf(deck.id, card.slug);
  const nameKo = koCards[card.slug]?.nameKo ?? card.nameEn;
  const withFrame = mode === "overlay" && !!deck.frame;
  const withText = showText && mode !== "baked";

  return (
    <div
      className={`relative h-full w-full [container-type:inline-size] ${className}`}
    >
      <Image
        src={deckArtSrc(deck.id, card)}
        alt={`${nameKo} ${card.nameEn}`}
        fill
        sizes={sizes}
        className="object-cover"
        priority={priority}
      />
      {withFrame ? (
        <Image
          src={deck.frame!}
          alt=""
          aria-hidden
          fill
          sizes={sizes}
          className="pointer-events-none object-cover"
        />
      ) : null}
      {withText ? (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {card.arcana === "major" ? (
            <p className="absolute inset-x-0 top-[2.5%] text-center font-serif text-[clamp(11px,7cqw,20px)] font-semibold text-gold-soft [text-shadow:0_1px_10px_rgba(8,5,0,0.85)]">
              {romanNumeral(card.number)}
            </p>
          ) : null}
          <div className="absolute inset-x-0 bottom-[4%] text-center [text-shadow:0_1px_10px_rgba(8,5,0,0.85)]">
            <p className="font-serif text-[clamp(12px,9cqw,26px)] font-semibold leading-tight text-cream">
              {nameKo}
            </p>
            <p className="mt-0.5 text-[clamp(8px,5cqw,13px)] text-[#cfc7b8]">
              {card.nameEn}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
