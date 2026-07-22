"use client";

import Link from "next/link";
import { CaretLeft, Check } from "@phosphor-icons/react";
import { DeckCard } from "@/components/DeckCard";
import { DesktopNav, MobileTopBar } from "@/components/SiteNav";
import { TabBar } from "@/components/TabBar";
import { decksByDefaultFirst } from "@/data/decks";
import { collectedCount, useArcanaStore, useSelectedDeck } from "@/lib/store";

export default function MyDecksPage() {
  const { store } = useArcanaStore();
  const { deckId: defaultDeckId, select } = useSelectedDeck();
  const list = decksByDefaultFirst(defaultDeckId);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden lg:h-auto lg:min-h-[100dvh] lg:overflow-visible">
      <DesktopNav active="my" />
      <MobileTopBar />
      <main className="mx-auto w-full min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-2 lg:max-w-[1060px] lg:overflow-visible lg:px-12 lg:pb-[88px] lg:pt-[72px]">
        <Link
          href="/my"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted hover:text-cream"
        >
          <CaretLeft size={16} aria-hidden />
          MY
        </Link>
        <h1 className="font-display text-[27px] font-semibold lg:text-[40px]">
          덱 관리
        </h1>
        <p className="mt-1 text-[13px] text-muted lg:text-[14px]">
          리딩에서 뽑을 덱을 고릅니다.
        </p>

        <div className="mt-5 flex flex-col gap-2.5 lg:mt-8">
          {list.map((deck) => {
            const collected = store ? collectedCount(store, deck.id) : 0;
            const isDefault = deck.id === defaultDeckId;
            return (
              <button
                key={deck.id}
                type="button"
                onClick={() => select(deck.id)}
                aria-pressed={isDefault}
                className={`flex items-center gap-3 rounded-2xl border bg-ink-1 p-4 text-left transition-colors lg:rounded-[14px] lg:p-5 ${
                  isDefault
                    ? "border-line-gold"
                    : "border-line hover:border-line-gold"
                }`}
              >
                <span className="min-w-0 flex-1">
                  <DeckCard
                    deck={deck}
                    collected={collected}
                    isDefault={isDefault}
                  />
                </span>
                {isDefault ? (
                  <Check size={18} className="text-gold-soft" aria-hidden />
                ) : null}
              </button>
            );
          })}
        </div>
      </main>
      <TabBar />
    </div>
  );
}
