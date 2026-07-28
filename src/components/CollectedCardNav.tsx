"use client";

import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { cardBySlug, cards } from "@/data/cards";
import { koCards } from "@/data/ko";
import { cardDetailHref } from "@/lib/card-detail-nav";
import {
  catalogCardUnlocked,
  type CatalogFilter,
  visibleCards,
} from "@/lib/catalog-filter";
import { neighborSlugs } from "@/lib/collection-nav";
import { useArcanaStore } from "@/lib/store";
import { useEntitlements, ownsDeck } from "@/lib/entitlements";
import { useSession } from "@/lib/auth/session";
import { collectionVisibility } from "@/lib/collection-access";

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
  // 수집한 카드 사이에서만 이동한다. 아직 만나지 않은 카드로 넘어가면
  // 도감에서 뒷면을 눌러 들어가는 것과 같아져 수집의 의미가 사라진다.
  const { store } = useArcanaStore();
  const ent = useEntitlements();
  const { user } = useSession();
  const localEncounters = new Set(Object.keys(store?.collection[deckId] ?? {}));
  const { owns, encounters } = collectionVisibility(
    user !== null,
    ownsDeck(deckId, ent),
    localEncounters,
  );
  const orderedSlugs = visibleCards(cards, filter)
    .filter((card) => catalogCardUnlocked(owns, encounters, card.slug))
    .map((card) => card.slug);
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
