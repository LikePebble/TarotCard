"use client";

import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import { DeckCard } from "@/components/DeckCard";
import { DesktopNav, MobileTopBar } from "@/components/SiteNav";
import { TabBar } from "@/components/TabBar";
import { decksByDefaultFirst } from "@/data/decks";
import { collectedCount, useEntitlements } from "@/lib/entitlements";
import { useSelectedDeck } from "@/lib/store";

export default function CollectionPage() {
  const ent = useEntitlements();
  const { deckId: defaultDeckId, select } = useSelectedDeck();
  const list = decksByDefaultFirst(defaultDeckId);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden lg:h-auto lg:min-h-[100dvh] lg:overflow-visible">
      <DesktopNav active="collection" />
      <MobileTopBar />
      <main className="mx-auto w-full min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-2 lg:max-w-[1060px] lg:overflow-visible lg:px-12 lg:pb-[88px] lg:pt-[72px]">
        <h1 className="font-display text-[27px] font-semibold lg:text-[40px]">
          컬렉션
        </h1>
        <p className="mt-1 text-[13px] text-muted lg:text-[14px]">
          덱마다 78장을 따로 모읍니다.
        </p>

        <div className="mt-5 flex flex-col gap-2.5 lg:mt-8">
          {list.map((deck) => {
            const collected = collectedCount(deck.id, ent);
            const isDefault = deck.id === defaultDeckId;
            return (
              <div
                key={deck.id}
                className="rounded-2xl border border-line bg-ink-1 p-4 lg:rounded-[14px] lg:p-5"
              >
                <Link
                  href={`/collection/${deck.id}`}
                  className="flex items-center gap-3 transition-opacity hover:opacity-90"
                >
                  <span className="min-w-0 flex-1">
                    <DeckCard
                      deck={deck}
                      collected={collected}
                      isDefault={isDefault}
                    />
                  </span>
                  <CaretRight size={18} className="text-muted" aria-hidden />
                </Link>
                {isDefault ? null : (
                  <button
                    type="button"
                    onClick={() => select(deck.id)}
                    className="mt-3 min-h-11 text-[13px] text-muted underline underline-offset-4 hover:text-cream"
                  >
                    기본 덱으로 설정
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <TabBar />
    </div>
  );
}
