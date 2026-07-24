"use client";

import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { cardBySlug, cards } from "@/data/cards";
import { koCards } from "@/data/ko";
import { neighborSlugs } from "@/lib/collection-nav";
import { collectedSlugs, useEntitlements } from "@/lib/entitlements";
import { useArcanaStore } from "@/lib/store";

const ORDERED_SLUGS = cards.map((c) => c.slug);

const ARROW_CLASS =
  "inline-flex min-h-11 items-center gap-1.5 text-[13.5px] text-muted hover:text-gold-soft lg:text-[15px]";
const OUTER_CLASS =
  "mt-7 flex justify-between border-t border-line pt-5 lg:mt-14 lg:pt-7";

function labelOf(slug: string): string {
  const card = cardBySlug.get(slug);
  if (!card) return "";
  const nameKo = koCards[card.slug]?.nameKo ?? card.nameEn;
  return `${nameKo} ${card.nameEn}`;
}

/**
 * 카드 상세의 이전/다음 네비게이션. 78장 전체가 아니라 이 덱에서 수집한
 * 카드 사이만 오간다(도감 그리드와 같은 규칙). 수집 여부는 localStorage에만
 * 있어 서버가 모르므로 이 부분만 클라이언트로 뗀다.
 */
export function CollectedCardNav({
  deckId,
  slug,
}: {
  deckId: string;
  slug: string;
}) {
  const { store } = useArcanaStore();
  const ent = useEntitlements();

  // 마운트 전(store===null)에도 바깥 행 높이는 고정 — 안쪽만 비운다.
  // 그래야 로드 직후 화살표가 나타나거나 사라질 때 레이아웃이 흔들리지 않는다.
  if (store === null) {
    return (
      <div className={OUTER_CLASS}>
        <span className={ARROW_CLASS} />
        <span className={ARROW_CLASS} />
      </div>
    );
  }

  const collected = collectedSlugs(deckId, ent);
  const { prev, next } = neighborSlugs(ORDERED_SLUGS, collected, slug);

  return (
    <div className={OUTER_CLASS}>
      {prev ? (
        <Link href={`/collection/${deckId}/${prev}`} className={ARROW_CLASS}>
          <CaretLeft size={14} aria-hidden />
          {labelOf(prev)}
        </Link>
      ) : (
        <span className={ARROW_CLASS} />
      )}
      {next ? (
        <Link href={`/collection/${deckId}/${next}`} className={ARROW_CLASS}>
          {labelOf(next)}
          <CaretRight size={14} aria-hidden />
        </Link>
      ) : (
        <span className={ARROW_CLASS} />
      )}
    </div>
  );
}
