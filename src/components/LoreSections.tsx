import { cardLore } from "@/data/lore";

const SECTION_SUMMARY =
  "flex min-h-11 cursor-pointer list-none items-center justify-between py-3 font-display text-[15px] text-cream marker:content-none [&::-webkit-details-marker]:hidden";

/** 카드 상세의 접힘 3섹션(상징·이야기·대응). RWS 기준 공통이라 덱 분기는 안내 캡션뿐이다. */
export function LoreSections({ slug, deckId }: { slug: string; deckId: string }) {
  const lore = cardLore(slug);
  if (!lore) return null;

  return (
    <section className="mt-7 lg:max-w-[560px]">
      {deckId !== "classic" && (
        <p className="mb-2 text-[12.5px] leading-relaxed text-muted">
          아래 이야기는 클래식 덱(라이더-웨이트)의 그림을 기준으로 합니다. 프리미엄
          덱은 같은 카드를 저마다의 시선으로 새로 그린 것이라, 그림 속 표현은 다를
          수 있습니다.
        </p>
      )}
      <details className="border-t border-line">
        <summary className={SECTION_SUMMARY}>
          카드 속 상징들 <span aria-hidden className="text-muted">＋</span>
        </summary>
        <ul className="space-y-3 pb-5">
          {lore.symbols.map((symbol) => (
            <li key={symbol.name} className="font-serif text-[14.5px] text-body">
              <span className="text-cream">{symbol.name}</span> — {symbol.meaning}
            </li>
          ))}
        </ul>
      </details>
      <details className="border-t border-line">
        <summary className={SECTION_SUMMARY}>
          카드 이야기 <span aria-hidden className="text-muted">＋</span>
        </summary>
        <div className="space-y-3 pb-5 font-serif text-[14.5px] text-body">
          {lore.story.split("\n\n").map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
      </details>
      <details className="border-y border-line">
        <summary className={SECTION_SUMMARY}>
          전통 대응 <span aria-hidden className="text-muted">＋</span>
        </summary>
        <dl className="space-y-1.5 pb-5">
          {lore.correspondence.map((row) => (
            <div key={row.label} className="flex gap-3 text-[14px]">
              <dt className="w-14 flex-none text-muted">{row.label}</dt>
              <dd className="text-body">{row.value}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}
