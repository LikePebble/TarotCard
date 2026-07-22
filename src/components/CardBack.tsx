import Image from "next/image";
import { deckById } from "@/data/decks";

/**
 * 카드 뒷면. 덱이 자기 뒷면 아트를 가지면 그 이미지를, 없으면(클래식) 내장
 * CSS 뒷면을 쓴다. cardback 클래스는 두 경우 모두 유지한다 — draw-fan의
 * hover/focus 테두리 전환이 이 클래스를 잡고 있다.
 */
export function CardBack({
  deckId,
  className = "",
  sizes = "120px",
}: {
  deckId?: string;
  className?: string;
  sizes?: string;
}) {
  const deck = deckById(deckId ?? "");

  return (
    <div
      aria-hidden
      className={`cardback ${deck.cardBack ? "cardback--art" : ""} ${className}`}
    >
      {deck.cardBack ? (
        <Image
          src={deck.cardBack}
          alt=""
          fill
          sizes={sizes}
          className="rounded-[11px] object-cover"
        />
      ) : null}
    </div>
  );
}
