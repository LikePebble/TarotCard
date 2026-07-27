"use client";

import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import { DeckCard } from "@/components/DeckCard";
import { DesktopNav, MobileTopBar } from "@/components/SiteNav";
import { TabBar } from "@/components/TabBar";
import { cards } from "@/data/cards";
import { decksByDefaultFirst } from "@/data/decks";
import { isDevTools } from "@/lib/dev-reset";
import {
  grantDeckLocal,
  ownsDeck,
  revokeDeckLocal,
  useEntitlements,
} from "@/lib/entitlements";
import { catalogProgress } from "@/lib/catalog-filter";
import { useUnreadCollections } from "@/lib/collection-unseen";
import { useArcanaStore, useSelectedDeck } from "@/lib/store";
import { useSession } from "@/lib/auth/session";
import { collectionVisibility } from "@/lib/collection-access";

export default function CollectionPage() {
  const { store } = useArcanaStore();
  const unreadByDeck = useUnreadCollections();
  const ent = useEntitlements();
  const { user } = useSession();
  const { deckId: defaultDeckId, select } = useSelectedDeck();
  const list = decksByDefaultFirst(defaultDeckId);
  const premiumDecks = list.filter((deck) => deck.id !== "classic");

  const toggleReleaseDeck = (deckId: string) => {
    if (!ownsDeck(deckId, ent)) {
      grantDeckLocal(deckId);
      return;
    }

    revokeDeckLocal(deckId);
  };

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden lg:h-auto lg:min-h-[100dvh] lg:overflow-visible">
      <DesktopNav active="collection" />
      <MobileTopBar />
      <main className="mx-auto w-full min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-2 lg:max-w-[1060px] lg:overflow-visible lg:px-12 lg:pb-[88px] lg:pt-[72px]">
        <h1 className="font-display text-[27px] font-semibold lg:text-[40px]">
          컬렉션
        </h1>
        <p className="mt-1 text-[13px] text-muted lg:text-[14px]">
          나만의 덱을 설정하고 78장의 타로카드를 수집해 보세요.
        </p>

        <div className="mt-5 flex flex-col gap-2.5 lg:mt-8">
          {list.map((deck) => {
            const localEncounters = new Set(
              Object.keys(store?.collection[deck.id] ?? {}),
            );
            const { owns: owned, encounters: encountered } =
              collectionVisibility(
                user !== null,
                ownsDeck(deck.id, ent),
                localEncounters,
              );
            const collected = catalogProgress(owned, encountered, cards.length);
            const hasUnread =
              user !== null && (unreadByDeck[deck.id] ?? []).length > 0;
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
                      hasUnread={hasUnread}
                    />
                  </span>
                  <CaretRight size={18} className="text-muted" aria-hidden />
                </Link>
                {!isDefault ? (
                  <button
                    type="button"
                    onClick={() => select(deck.id)}
                    className="mt-3 min-h-11 text-[13px] text-muted underline underline-offset-4 hover:text-cream"
                  >
                    기본 덱으로 설정
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
        {isDevTools ? (
          <section
            aria-labelledby="release-tools-title"
            className="mt-6 rounded-2xl border border-dashed border-line-gold/60 bg-ink-1 p-4 lg:p-5"
          >
            <h2
              id="release-tools-title"
              className="font-display text-[16px] font-semibold text-gold-soft"
            >
              출시 테스트 도구
            </h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
              결제 연동 전 프리미엄 덱의 전체 도감 지급·회수를 검증합니다.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {premiumDecks.map((deck) => {
                const owned = ownsDeck(deck.id, ent);
                return (
                  <button
                    key={deck.id}
                    type="button"
                    onClick={() => toggleReleaseDeck(deck.id)}
                    className="min-h-11 rounded-xl border border-line px-4 text-[13px] text-body transition-colors hover:border-line-gold hover:text-cream"
                  >
                    {deck.nameKo} 테스트 {owned ? "회수" : "지급"}
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}
      </main>
      <TabBar />
    </div>
  );
}
