"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react";
import { CardArt } from "@/components/CardArt";
import { CardBack } from "@/components/CardBack";
import { DesktopNav, MobileTopBar } from "@/components/SiteNav";
import { TabBar } from "@/components/TabBar";
import { cards } from "@/data/cards";
import { decks } from "@/data/decks";
import { koCards } from "@/data/ko";
import {
  collectedCount,
  ownsDeck,
  useEntitlements,
} from "@/lib/entitlements";
import { useArcanaStore, useSelectedDeck } from "@/lib/store";

const FILTERS = [
  { id: "major", label: "메이저" },
  { id: "cups", label: "컵" },
  { id: "wands", label: "완드" },
  { id: "swords", label: "소드" },
  { id: "pentacles", label: "펜타클" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

export default function DeckCatalogPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = use(params);
  const { store } = useArcanaStore();
  const ent = useEntitlements();
  const { deckId: defaultDeckId, select } = useSelectedDeck();
  const [filter, setFilter] = useState<FilterId>("major");

  const deck = decks.find((d) => d.id === deckId && d.active);
  // 모르는 덱은 클래식으로 둔갑시키지 않는다 — 옛 카드 상세 URL이 조용히
  // 엉뚱한 도감으로 보이는 것을 막는다.
  // 훅을 모두 부른 뒤에 던진다(조건부 훅 호출 금지).
  if (!deck) notFound();

  const isDefault = defaultDeckId === deck.id;
  const total = collectedCount(deck.id, ent);
  const owned = ownsDeck(deck.id, ent);
  const visible = cards.filter((card) =>
    filter === "major" ? card.arcana === "major" : card.suit === filter,
  );

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden lg:h-auto lg:min-h-[100dvh] lg:overflow-visible">
      <DesktopNav active="collection" />
      <MobileTopBar />
      <main className="mx-auto w-full min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-2 lg:max-w-[1280px] lg:overflow-visible lg:px-12 lg:pb-[88px] lg:pt-[72px]">
        <Link
          href="/collection"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted hover:text-cream"
        >
          <CaretLeft size={16} aria-hidden />
          컬렉션
        </Link>

        <div className="lg:flex lg:items-end lg:justify-between">
          <div>
            <div className="flex items-end justify-between lg:block">
              <h1 className="font-display text-[27px] font-semibold lg:text-[40px]">
                {deck.nameKo}
              </h1>
              <p className="font-display text-2xl font-semibold text-gold-soft lg:hidden">
                {total}{" "}
                <span className="text-sm font-normal text-muted">/ 78</span>
              </p>
            </div>
            {isDefault ? (
              <p className="mt-2 text-[13px] text-gold-soft">
                기본 덱 · 리딩에서 이 덱으로 뽑습니다
              </p>
            ) : (
              <button
                type="button"
                onClick={() => select(deck.id)}
                className="mt-2 min-h-11 text-[13px] text-muted underline underline-offset-4 hover:text-cream"
              >
                기본 덱으로 설정
              </button>
            )}
          </div>
          <div className="hidden lg:block lg:text-right">
            <p className="font-display text-[40px] font-semibold text-gold-soft">
              {total}{" "}
              <span className="text-xl font-normal text-muted">/ 78</span>
            </p>
            <div className="mt-2.5 h-0.5 w-[220px] bg-line">
              <div
                className="h-full bg-gold transition-[width] duration-500"
                style={{ width: `${(total / 78) * 100}%` }}
              />
            </div>
          </div>
        </div>
        <div className="mt-3 h-0.5 bg-line lg:hidden">
          <div
            className="h-full bg-gold transition-[width] duration-500"
            style={{ width: `${(total / 78) * 100}%` }}
          />
        </div>

        {store && total === 0 ? (
          <div className="mt-5 rounded-2xl border border-line bg-ink-1 p-6 lg:mt-10 lg:flex lg:items-center lg:justify-between lg:p-8">
            <div>
              <p className="font-display text-lg font-semibold lg:text-[21px]">
                아직 수집한 카드가 없습니다
              </p>
              <p className="mt-1 text-[13.5px] text-muted lg:text-[15px]">
                첫 리딩에서 뽑은 카드가 이곳에 모입니다.
              </p>
            </div>
            <Link
              href="/reading"
              className="btn btn-gold mt-4 w-full lg:mt-0 lg:w-auto"
            >
              리딩 시작하기
            </Link>
          </div>
        ) : null}

        <div
          className="-mx-5 mt-[18px] flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:mt-8 lg:flex-wrap lg:overflow-visible lg:px-0"
          role="tablist"
          aria-label="아르카나 필터"
        >
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              onClick={() => setFilter(item.id)}
              className={`min-h-11 flex-none whitespace-nowrap rounded-full border px-4 text-[13px] lg:px-5 lg:text-[14px] ${
                filter === item.id
                  ? "border-gold text-gold-soft"
                  : "border-line text-muted hover:text-cream"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-y-3.5 gap-x-3 lg:mt-8 lg:grid-cols-6 lg:gap-[22px]">
          {visible.map((card) => {
            const collected = owned;
            const nameKo = koCards[card.slug]?.nameKo ?? card.nameEn;
            const label = (
              <p
                className={`mt-[7px] text-center text-[11px] leading-[1.4] lg:mt-2.5 lg:text-[13px] ${
                  collected ? "" : "text-muted"
                }`}
              >
                {nameKo}
                <br />
                <span className={collected ? "text-muted" : ""}>
                  {card.nameEn}
                </span>
              </p>
            );
            return collected ? (
              <Link
                key={card.slug}
                href={`/collection/${deck.id}/${card.slug}`}
                className="group block"
              >
                <div className="relative aspect-[2/3.4] overflow-hidden rounded-xl bg-ink-2 transition-transform duration-300 group-hover:scale-[1.03]">
                  <CardArt
                    card={card}
                    deckId={deck.id}
                    sizes="(min-width: 1024px) 190px, 33vw"
                  />
                </div>
                {label}
              </Link>
            ) : (
              <div key={card.slug}>
                <CardBack
                  deckId={deck.id}
                  sizes="(min-width: 1024px) 190px, 33vw"
                  className="aspect-[2/3.4] w-full"
                />
                {label}
              </div>
            );
          })}
        </div>
      </main>
      <TabBar />
    </div>
  );
}
