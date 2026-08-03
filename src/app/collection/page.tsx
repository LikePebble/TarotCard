"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CaretRight } from "@phosphor-icons/react";
import { DeckCard } from "@/components/DeckCard";
import { DesktopNav, MobileTopBar } from "@/components/SiteNav";
import { TabBar } from "@/components/TabBar";
import { cards } from "@/data/cards";
import { decks, decksByDefaultFirst } from "@/data/decks";
import { isDevTools } from "@/lib/dev-reset";
import {
  LAUNCH_PROMO_DECKS,
  grantDeckLocal,
  ownsDeck,
  revokeDeckLocal,
  useEntitlements,
} from "@/lib/entitlements";
import { catalogProgress } from "@/lib/catalog-filter";
import { useUnreadCollections } from "@/lib/collection-unseen";
import {
  joinDeckNames,
  launchPromoVariant,
  promoDeckNames,
} from "@/lib/launch-promo";
import { useArcanaStore, useSelectedDeck } from "@/lib/store";
import { useSession } from "@/lib/auth/session";
import { collectionVisibility } from "@/lib/collection-access";

export default function CollectionPage() {
  const router = useRouter();
  const { store } = useArcanaStore();
  const unreadByDeck = useUnreadCollections();
  const ent = useEntitlements();
  const { user, loading: sessionLoading } = useSession();
  const { deckId: defaultDeckId, select } = useSelectedDeck();
  const list = decksByDefaultFirst(defaultDeckId);
  const premiumDecks = list.filter((deck) => deck.id !== "classic");
  // 기본 덱 설정에 따라 문구의 이름 순서가 흔들리지 않도록 원본 순서를 쓴다.
  const promoDecks = promoDeckNames(decks);
  const promoNames = joinDeckNames(promoDecks);
  const promoVariant = launchPromoVariant(
    LAUNCH_PROMO_DECKS,
    sessionLoading,
    user !== null,
    promoDecks.length,
  );

  const toggleReleaseDeck = (deckId: string) => {
    if (!ownsDeck(deckId, ent)) {
      grantDeckLocal(deckId);
      return;
    }

    revokeDeckLocal(deckId);
  };

  const selectDefaultDeck = (deckId: string) => {
    select(deckId);
    if (
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("from") === "reading"
    ) {
      if (window.history.length > 1) router.back();
      else router.replace("/reading");
    }
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

        {/*
          덱 목록보다 먼저 둔다. 아래 목록에서 프리미엄 덱이 모두 열린 것을 먼저
          본 뒤에 이유를 읽으면, 그때는 이미 "원래 이런 것"이라고 믿은 뒤다.
          한정 프로모션으로 열어 드렸다는 사실을 먼저 밝힌다.

          유료 전환 예고는 넣지 않는다. 결제가 실제로 들어갈 때 약관에 유료
          조항을 세우고 그 절차에 따라 알리기로 했다(약관 제3조). 근거 조문이
          없는 상태에서 "유료로 바뀔 수 있습니다"만 화면에 두면, 지키지 못할
          예고가 되거나 나중에 오해의 근거가 된다.

          게스트에게는 같은 자리가 안내가 아니라 제안이다. 아래 목록은 로그인
          전에는 모두 잠겨 보이므로(collectionVisibility), 무엇을 받게 되는지
          여기서 먼저 말하지 않으면 로그인할 이유가 화면 어디에도 없다.
        */}
        {promoVariant === "guest" ? (
          <section
            aria-labelledby="launch-promo-title"
            className="mt-4 rounded-2xl border border-line-gold bg-ink-1 p-4 lg:mt-6 lg:p-5"
          >
            <h2
              id="launch-promo-title"
              className="font-display text-[16px] font-semibold text-gold-soft lg:text-[18px]"
            >
              로그인하시면 프리미엄 덱을 드립니다
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-body lg:text-[14px]">
              출시를 기념하여, 한정 기간 동안 로그인하신 분께 {promoNames}{" "}
              프리미엄 덱을 드립니다.
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted lg:text-[13px]">
              한정 기간 동안 드리는 것이라 기간이 끝나면 이 안내는 사라집니다.
            </p>
            <Link
              href="/login?next=/collection"
              className="btn btn-gold mt-4 w-full sm:w-auto"
            >
              로그인하고 덱 받기
            </Link>
          </section>
        ) : promoVariant === "member" ? (
          <section
            aria-labelledby="launch-promo-title"
            className="mt-4 rounded-2xl border border-line bg-ink-1 p-4 lg:mt-6 lg:p-5"
          >
            <h2
              id="launch-promo-title"
              className="font-display text-[15px] font-semibold text-gold-soft lg:text-[16px]"
            >
              출시 기념 한정 프로모션
            </h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted lg:text-[13px]">
              로그인해 주신 분께 {promoNames} 프리미엄 덱을 열어 드렸습니다.
              한정 기간 동안 드리는 프로모션입니다.
            </p>
          </section>
        ) : null}

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
                deck.id,
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
                    onClick={() => selectDefaultDeck(deck.id)}
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
