"use client";

import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { cardBySlug, cards } from "@/data/cards";
import { koCards } from "@/data/ko";
import { cardDetailHref } from "@/lib/card-detail-nav";
import { type CatalogFilter, visibleCards } from "@/lib/catalog-filter";
import { neighborSlugs } from "@/lib/collection-nav";

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
 * 카드 상세의 이전/다음 네비게이션. 진입한 도감 필터 안에서만 순서대로 이동하고
 * 양 끝에서는 멈춘다.
 */
export function CollectedCardNav({
  deckId,
  slug,
  readingId,
  filter,
}: {
  deckId: string;
  slug: string;
  readingId: string | null;
  filter: CatalogFilter;
}) {
  // 수집 여부로 거르지 않는다. 덱 상품은 소유권이 아니라 수집 시간 단축권이고,
  // 카드 상세 본문은 이미 누구에게나 열려 있다. 수집한 카드만 이어 주면 익명
  // 방문자에게는 이전/다음이 0개라 234개 상세 페이지가 서로 끊긴다.
  const orderedSlugs = visibleCards(cards, filter).map((card) => card.slug);
  const { prev, next } = neighborSlugs(orderedSlugs, slug);

  return (
    <div className={OUTER_CLASS}>
      {prev ? (
        <Link
          href={cardDetailHref(deckId, prev, readingId, filter)}
          className={ARROW_CLASS}
        >
          <CaretLeft size={14} aria-hidden />
          {labelOf(prev)}
        </Link>
      ) : (
        <span className={ARROW_CLASS} />
      )}
      {next ? (
        <Link
          href={cardDetailHref(deckId, next, readingId, filter)}
          className={ARROW_CLASS}
        >
          {labelOf(next)}
          <CaretRight size={14} aria-hidden />
        </Link>
      ) : (
        <span className={ARROW_CLASS} />
      )}
    </div>
  );
}
