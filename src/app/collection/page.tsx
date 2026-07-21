"use client";

import { useState } from "react";
import Link from "next/link";
import { CardArt } from "@/components/CardArt";
import { CardBack } from "@/components/CardBack";
import { DesktopNav, MobileTopBar } from "@/components/SiteNav";
import { TabBar } from "@/components/TabBar";
import { cards } from "@/data/cards";
import { decks } from "@/data/decks";
import { koCards } from "@/data/ko";
import { collectedCount, useArcanaStore, useSelectedDeck } from "@/lib/store";

const FILTERS = [
  { id: "major", label: "메이저" },
  { id: "cups", label: "컵" },
  { id: "wands", label: "완드" },
  { id: "swords", label: "소드" },
  { id: "pentacles", label: "펜타클" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

export default function CollectionPage() {
  const { store } = useArcanaStore();
  const { deckId, select } = useSelectedDeck();
  const [filter, setFilter] = useState<FilterId>("major");

  const total = store ? collectedCount(store, deckId) : 0;
  const visible = cards.filter((card) =>
    filter === "major" ? card.arcana === "major" : card.suit === filter,
  );

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden lg:h-auto lg:min-h-[100dvh] lg:overflow-visible">
      <DesktopNav active="collection" />
      <MobileTopBar />
      <main className="mx-auto w-full min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-2 lg:max-w-[1280px] lg:overflow-visible lg:px-12 lg:pb-[88px] lg:pt-[72px]">
        <div className="lg:flex lg:items-end lg:justify-between">
          <div>
            <div className="flex gap-3 lg:mb-2.5">
              {decks
                .filter((deck) => deck.active)
                .map((deck) => (
                  <button
                    key={deck.id}
                    type="button"
                    onClick={() => select(deck.id)}
                    aria-pressed={deckId === deck.id}
                    className={`min-h-6 text-[12.5px] lg:text-[14px] ${
                      deckId === deck.id
                        ? "text-gold-soft"
                        : "text-muted hover:text-cream"
                    }`}
                  >
                    {deck.nameKo}
                  </button>
                ))}
            </div>
            <div className="flex items-end justify-between lg:block">
              <h1 className="font-display text-[27px] font-semibold lg:text-[40px]">
                컬렉션
              </h1>
              <p className="font-display text-2xl font-semibold text-gold-soft lg:hidden">
                {total}{" "}
                <span className="text-sm font-normal text-muted">/ 78</span>
              </p>
            </div>
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
            const collected = !!store?.collection[deckId]?.[card.slug];
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
                href={`/collection/${card.slug}`}
                className="group block"
              >
                <div className="relative aspect-[2/3.4] overflow-hidden rounded-xl bg-ink-2 transition-transform duration-300 group-hover:scale-[1.03]">
                  <CardArt
                    card={card}
                    deckId={deckId}
                    sizes="(min-width: 1024px) 190px, 33vw"
                  />
                </div>
                {label}
              </Link>
            ) : (
              <div key={card.slug}>
                <CardBack className="aspect-[2/3.4] w-full" />
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
