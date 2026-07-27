"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { CaretLeft, Info } from "@phosphor-icons/react";
import { CardArt } from "@/components/CardArt";
import { CardBack } from "@/components/CardBack";
import { DeckInfoModal } from "@/components/DeckInfoModal";
import { DesktopNav, MobileTopBar } from "@/components/SiteNav";
import { TabBar } from "@/components/TabBar";
import { cards } from "@/data/cards";
import { decks } from "@/data/decks";
import { koCards } from "@/data/ko";
import { ownsDeck, useEntitlements } from "@/lib/entitlements";
import {
  setSelectedDeckId,
  useArcanaStore,
  useSelectedDeck,
} from "@/lib/store";
import {
  catalogFilterOf,
  catalogCardUnlocked,
  catalogProgress,
  visibleCards,
} from "@/lib/catalog-filter";
import { cardDetailHref } from "@/lib/card-detail-nav";
import { useUnreadCollection } from "@/lib/collection-unseen";
import { useSession } from "@/lib/auth/session";
import { collectionVisibility } from "@/lib/collection-access";
import {
  deckDetailCtaState,
  deckReadingCtaLabel,
} from "@/lib/deck-detail-cta";

const FILTERS = [
  { id: "major", label: "메이저" },
  { id: "cups", label: "컵" },
  { id: "wands", label: "완드" },
  { id: "swords", label: "소드" },
  { id: "pentacles", label: "펜타클" },
] as const;

export default function DeckCatalogPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { deckId } = use(params);
  const { store } = useArcanaStore();
  const ent = useEntitlements();
  const { user } = useSession();
  const { deckId: defaultDeckId } = useSelectedDeck();
  const unreadCollectionSet = useUnreadCollection(deckId);
  const [infoOpen, setInfoOpen] = useState(false);

  const deck = decks.find((d) => d.id === deckId && d.active);
  // 모르는 덱은 클래식으로 둔갑시키지 않는다 — 옛 카드 상세 URL이 조용히
  // 엉뚱한 도감으로 보이는 것을 막는다.
  // 훅을 모두 부른 뒤에 던진다(조건부 훅 호출 금지).
  if (!deck) notFound();

  const isDefault = defaultDeckId === deck.id;
  const actualOwned = ownsDeck(deck.id, ent);
  const ctaState = deckDetailCtaState(user !== null, actualOwned);
  const isPremium = deck.id !== "classic";
  const localEncounters = new Set(Object.keys(store?.collection[deck.id] ?? {}));
  const { owns: owned, encounters: collectedSet } = collectionVisibility(
    user !== null,
    actualOwned,
    localEncounters,
  );
  const total = catalogProgress(owned, collectedSet, cards.length);
  const filter = catalogFilterOf(searchParams.get("filter")) ?? "major";
  const visible = visibleCards(cards, filter);
  const unreadSet =
    user === null ? new Set<string>() : unreadCollectionSet;
  const startReading = () => {
    // 목적지에서 읽을 선택값만 저장한다. 현재 화면의 상태를 갱신하면
    // 이동 직전에 CTA가 "지금 리딩받기"로 바뀌어 눌린 상태처럼 보인다.
    setSelectedDeckId(deck.id);
    router.push("/reading");
  };

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
              <div className="flex items-center gap-1">
                <h1 className="font-display text-[27px] font-semibold lg:text-[40px]">
                  {deck.nameKo}
                </h1>
                <button
                  type="button"
                  onClick={() => setInfoOpen(true)}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted transition-colors hover:text-gold-soft"
                  aria-label={`${deck.nameKo} 덱 정보 보기`}
                  title="덱 정보 보기"
                >
                  <Info size={19} aria-hidden />
                </button>
              </div>
              <p className="font-display text-2xl font-semibold text-gold-soft lg:hidden">
                {total}{" "}
                <span className="text-sm font-normal text-muted">/ 78</span>
              </p>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {isDefault ? (
                <span className="rounded-full border border-line-gold px-2.5 py-1 text-[12px] text-gold-soft">
                  기본 덱
                </span>
              ) : null}
              {isPremium ? (
                <span className="rounded-full border border-line px-2.5 py-1 text-[12px] text-muted">
                  {ctaState === "guest"
                    ? "로그인 후 수집"
                    : owned
                      ? "소장 중"
                      : "리딩으로 수집 중"}
                </span>
              ) : null}
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

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:mt-8">
          <button
            type="button"
            onClick={startReading}
            className="btn btn-gold w-full sm:w-auto"
          >
            {deckReadingCtaLabel(isDefault)}
          </button>
          {ctaState === "guest" ? (
            <Link href="/login" className="btn btn-ghost w-full sm:w-auto">
              로그인하고 카드 수집하기
            </Link>
          ) : ctaState === "member-unowned" ? (
            <button
              type="button"
              disabled
              aria-label="모든 카드 해금하기, 준비 중"
              title="결제 기능 준비 중"
              className="btn btn-ghost w-full cursor-not-allowed opacity-45 sm:w-auto"
            >
              모든 카드 해금하기
            </button>
          ) : null}
        </div>

        <div
          className="-mx-5 mt-[18px] flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:mt-8 lg:flex-wrap lg:overflow-visible lg:px-0"
        >
          <div className="contents" role="tablist" aria-label="아르카나 필터">
            {FILTERS.map((item) => {
              const hasUnread = visibleCards(cards, item.id).some((card) =>
                unreadSet.has(card.slug),
              );
              return (
              // 탭을 <a href>로 둔다. router.replace 핸들러만 있으면 크롤러가
              // ?filter=cups 같은 다른 아르카나로 갈 길이 없어, 그리드에 걸린
              // 나머지 56장의 카드 상세가 사이트 어디에서도 도달 불가가 된다.
              // replace + scroll={false}로 기존 router.replace 거동을 그대로 둔다.
              <Link
                key={item.id}
                href={`/collection/${deck.id}?filter=${item.id}`}
                replace
                scroll={false}
                role="tab"
                aria-selected={filter === item.id}
                className={`inline-flex min-h-11 flex-none items-center justify-center whitespace-nowrap rounded-full border px-4 text-[13px] lg:px-5 lg:text-[14px] ${
                  filter === item.id
                    ? "border-gold text-gold-soft"
                    : "border-line text-muted hover:text-cream"
                }`}
              >
                {item.label}
                {hasUnread ? (
                  <span
                    className="relative -top-1 ml-1 inline-block size-1.5 rounded-full bg-notice"
                    aria-label="새 카드 수집됨"
                  />
                ) : null}
              </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-y-3.5 gap-x-3 lg:mt-8 lg:grid-cols-6 lg:gap-[22px]">
          {visible.map((card) => {
            const collected = catalogCardUnlocked(
              owned,
              collectedSet,
              card.slug,
            );
            const nameKo = koCards[card.slug]?.nameKo ?? card.nameEn;
            const label = (
              <p
                className={`mt-[7px] text-center text-[11px] leading-[1.4] lg:mt-2.5 lg:text-[13px] ${
                  collected ? "" : "text-muted"
                }`}
              >
                <span className="relative inline-block">
                  {nameKo}
                  {collected && unreadSet.has(card.slug) ? (
                    <span
                      className="absolute -right-2 -top-0.5 size-1.5 rounded-full bg-notice"
                      aria-hidden
                    />
                  ) : null}
                </span>
                <br />
                <span className={collected ? "text-muted" : ""}>
                  {card.nameEn}
                </span>
              </p>
            );
            // 아직 만나지 않은 카드도 상세로 링크한다. 상세 페이지 자체는
            // 잠겨 있지 않고(미수집 안내를 스스로 보여 준다), 링크를 끊으면
            // 234장의 카드 상세로 들어갈 길이 사이트 어디에도 남지 않는다.
            // 잠금은 링크 유무가 아니라 앞면/뒷면 아트로만 표현한다.
            const ariaLabel = collected
              ? unreadSet.has(card.slug)
                ? `${nameKo}, 새로 수집됨`
                : `${nameKo}, 수집됨`
              : `${nameKo}, 아직 수집하지 않음`;
            return (
              <Link
                key={card.slug}
                href={cardDetailHref(deck.id, card.slug, null, filter)}
                className="group block"
                aria-label={ariaLabel}
              >
                {collected ? (
                  <div className="relative aspect-[2/3.4] overflow-hidden rounded-xl bg-ink-2 transition-transform duration-300 group-hover:scale-[1.03]">
                    <CardArt
                      card={card}
                      deckId={deck.id}
                      sizes="(min-width: 1024px) 190px, 33vw"
                    />
                  </div>
                ) : (
                  <CardBack
                    deckId={deck.id}
                    sizes="(min-width: 1024px) 190px, 33vw"
                    className="aspect-[2/3.4] w-full"
                  />
                )}
                {label}
              </Link>
            );
          })}
        </div>
      </main>
      {infoOpen ? (
        <DeckInfoModal deck={deck} onClose={() => setInfoOpen(false)} />
      ) : null}
      <TabBar />
    </div>
  );
}
