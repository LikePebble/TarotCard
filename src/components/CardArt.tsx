import Image from "next/image";
import { romanNumeral, type Card } from "@/data/cards";
import { canvasModeOf, deckArtSrc, deckById } from "@/data/decks";
import { koCards } from "@/data/ko";

// canvas.tokens.json(기준 1200x2040)의 safeZones/서체를 DOM 비율로 옮긴 값.
// 텍스트는 safe zone 박스 안에 중앙 정렬한다(레이아웃 가이드와 동일).
// cqw = 컨테이너 폭 대비 %. 토큰 px / 1200 * 100 으로 환산.
const BASE_W = 1200;
const BASE_H = 2040;
const pct = (v: number, base: number) => `${(v / base) * 100}%`;
const cqw = (px: number) => (px / BASE_W) * 100;

// safeZones.number / safeZones.titleContent (canvas.tokens.json v1.1.0).
const NUMBER_ZONE = { x: 435, y: 30, w: 330, h: 68 };
const TITLE_ZONE = { x: 300, y: 1840, w: 600, h: 120 };
const NUMBER_PX = 38;
const TEXT_SHADOW = "0 2px 2.4px rgba(9,10,13,0.78)";

// 장문 축소: 토큰의 medium/long 임계값.
function koFontPx(len: number): number {
  return len >= 13 ? 38 : len >= 9 ? 44 : 50;
}
function enFontPx(len: number): number {
  return len >= 30 ? 11 : len >= 22 ? 12 : 13;
}
function zoneStyle(z: { x: number; y: number; w: number; h: number }) {
  return {
    left: pct(z.x, BASE_W),
    top: pct(z.y, BASE_H),
    width: pct(z.w, BASE_W),
    height: pct(z.h, BASE_H),
  } as const;
}

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
      {withText
        ? (() => {
            const nameEn = card.nameEn.toUpperCase();
            const koPx = koFontPx([...nameKo].length);
            const enPx = enFontPx(nameEn.length);
            return (
              <div aria-hidden className="pointer-events-none absolute inset-0">
                {card.arcana === "major" ? (
                  <div
                    className="absolute flex items-center justify-center"
                    style={zoneStyle(NUMBER_ZONE)}
                  >
                    <span
                      className="font-serif font-bold text-[#e5c678]"
                      style={{
                        fontSize: `clamp(9px, ${cqw(NUMBER_PX)}cqw, ${NUMBER_PX}px)`,
                        letterSpacing: `${cqw(6)}cqw`,
                        textShadow: TEXT_SHADOW,
                      }}
                    >
                      {romanNumeral(card.number)}
                    </span>
                  </div>
                ) : null}
                <div
                  className="absolute flex flex-col items-center justify-center text-center"
                  style={zoneStyle(TITLE_ZONE)}
                >
                  <span
                    className="font-serif font-semibold leading-tight text-[#f5efe7]"
                    style={{
                      fontSize: `clamp(11px, ${cqw(koPx)}cqw, ${koPx}px)`,
                      letterSpacing: `${cqw(6)}cqw`,
                      textShadow: TEXT_SHADOW,
                    }}
                  >
                    {nameKo}
                  </span>
                  <span
                    className="text-[#c9c1b8]"
                    style={{
                      marginTop: "0.3cqw",
                      fontSize: `clamp(5px, ${cqw(enPx)}cqw, ${enPx}px)`,
                      letterSpacing: `${cqw(3)}cqw`,
                      textShadow: TEXT_SHADOW,
                    }}
                  >
                    {nameEn}
                  </span>
                </div>
              </div>
            );
          })()
        : null}
    </div>
  );
}
