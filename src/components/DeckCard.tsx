import Image from "next/image";
import type { Deck } from "@/data/decks";

/**
 * 덱 한 장의 표시. 링크도 버튼도 아니다 — 이동이냐 선택이냐는 쓰는 쪽이
 * 감싸서 정한다(컬렉션은 이동, MY는 선택).
 *
 * 루트부터 전부 span인 이유는 <button> 안에 들어가기 때문이다. button의
 * 내용 모델은 phrasing content라 div를 넣으면 유효하지 않은 마크업이 된다.
 */
export function DeckCard({
  deck,
  collected,
  isDefault,
  hasUnread,
}: {
  deck: Deck;
  collected: number;
  isDefault: boolean;
  hasUnread: boolean;
}) {
  const percent = (collected / 78) * 100;

  return (
    <span className="flex items-center gap-4">
      <span className="relative block aspect-[2/3.4] w-[64px] flex-none overflow-hidden rounded-lg bg-ink-2 lg:w-[76px]">
        {deck.cardBack ? (
          <Image
            src={deck.cardBack}
            alt=""
            aria-hidden
            fill
            sizes="76px"
            className="object-cover"
          />
        ) : (
          <span aria-hidden className="cardback absolute inset-0" />
        )}
      </span>
      <span className="block min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-display text-[17px] font-semibold lg:text-[19px]">
            {deck.nameKo}
          </span>
          {hasUnread ? (
            <span
              className="relative -top-1 size-1.5 rounded-full bg-notice"
              aria-label="새 카드 수집됨"
            />
          ) : null}
          {isDefault ? (
            <span className="flex-none rounded-full border border-line-gold px-2 py-0.5 text-[11px] text-gold-soft">
              기본
            </span>
          ) : null}
        </span>
        <span className="mt-1 block text-[13px] text-muted lg:text-[14px]">
          {collected} <span className="text-[12px]">/ 78</span>
        </span>
        <span className="mt-2 block h-0.5 bg-line">
          <span
            className="block h-full bg-gold transition-[width] duration-500"
            style={{ width: `${percent}%` }}
          />
        </span>
      </span>
    </span>
  );
}
