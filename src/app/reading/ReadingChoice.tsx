"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CardArt } from "@/components/CardArt";
import { CardBack } from "@/components/CardBack";
import { cardBySlug } from "@/data/cards";
import {
  blockingReading,
  setPendingSpread,
  useArcanaStore,
  useSelectedDeck,
  type ReadingRecord,
  type SpreadType,
} from "@/lib/store";
import { isDevTools, resetTodayReadings, todayReadingCount } from "@/lib/dev-reset";

const panel =
  "flex w-full flex-col items-start gap-[18px] rounded-2xl border border-line bg-ink-1 p-6 text-left hover:border-line-gold lg:min-h-[330px] lg:justify-between lg:rounded-[14px] lg:p-10";

/**
 * 리딩 유형 카드. 이번 주기에 이미 뽑았으면(blocked) 새로 시작하지 못하게
 * 하고 그 결과로 링크한다(리롤 방지). 아니면 유형을 골라 포커스 단계로 간다.
 *
 * blocked면 뒷면 대신 실제로 뽑은 카드(blocked.cards)를 보여준다 — 덱은 그때
 * 뽑을 때 쓴 blocked.deckId를 쓴다. 기본 덱을 바꿔도 실제로 받은 그림 그대로.
 */
function TypeCard({
  title,
  titleClass = "",
  desc,
  blockedNote,
  blocked,
  ariaBase,
  onStart,
  deckId,
  cardClassName,
  cardSizes,
  cardCount,
}: {
  title: string;
  titleClass?: string;
  desc: string;
  blockedNote: string;
  blocked: ReadingRecord | undefined;
  ariaBase: string;
  onStart: () => void;
  deckId: string;
  cardClassName: string;
  cardSizes: string;
  cardCount: number;
}) {
  const cardEls = blocked
    ? blocked.cards.map((slug) => {
        const card = cardBySlug.get(slug);
        if (!card) return null;
        // CardArt는 래퍼가 h-full w-full이라 크기 클래스를 직접 넘기면
        // w-full과 충돌한다. CardBack과 달리 바깥에서 크기를 잡아 준다.
        return (
          <div
            key={slug}
            className={`relative overflow-hidden rounded-[12px] border border-line-gold ${cardClassName}`}
          >
            <CardArt card={card} deckId={blocked.deckId} sizes={cardSizes} />
          </div>
        );
      })
    : Array.from({ length: cardCount }, (_, i) => (
        <CardBack
          key={i}
          deckId={deckId}
          sizes={cardSizes}
          className={cardClassName}
        />
      ));

  const inner = (
    <>
      <div>
        <h2
          className={`font-display text-[21px] font-semibold lg:text-[27px] ${titleClass}`}
        >
          {title}
        </h2>
        <p
          className={`mt-1 text-[13.5px] lg:text-[15px] ${
            blocked ? "text-gold-soft" : "text-muted lg:max-w-[300px]"
          }`}
        >
          {blocked ? blockedNote : desc}
        </p>
      </div>
      <div className="flex gap-1.5 lg:mt-7 lg:gap-2.5">{cardEls}</div>
    </>
  );

  return blocked ? (
    <Link
      href={`/reading/${blocked.id}`}
      aria-label={`${ariaBase} 결과 보기`}
      className={panel}
    >
      {inner}
    </Link>
  ) : (
    <button
      type="button"
      onClick={onStart}
      aria-label={ariaBase}
      className={panel}
    >
      {inner}
    </button>
  );
}

export function ReadingChoice() {
  const router = useRouter();
  const { store } = useArcanaStore();
  const { deckId } = useSelectedDeck();
  const [now] = useState(() => new Date());

  const choose = (spread: SpreadType) => {
    setPendingSpread(spread);
    router.push("/reading/focus");
  };

  const blockedOne = store ? blockingReading(store, "one", now) : undefined;
  const blockedThree = store ? blockingReading(store, "three", now) : undefined;
  const todayCount = todayReadingCount(store);

  return (
    <div className="mt-[18px] flex flex-col gap-[18px] lg:mt-12 lg:grid lg:grid-cols-[1.25fr_1fr] lg:gap-5">
      <TypeCard
        title="오늘의 카드"
        desc="한 장의 카드로 오늘 하루의 흐름을 봅니다."
        blockedNote="오늘의 흐름은 이미 받으셨어요 · 결과 보기"
        blocked={blockedOne}
        ariaBase="오늘의 카드"
        onStart={() => choose("one")}
        deckId={deckId}
        cardClassName="aspect-[2/3.4] w-[52px] lg:w-24"
        cardSizes="96px"
        cardCount={1}
      />

      <TypeCard
        title="과거 · 현재 · 미래"
        titleClass="whitespace-nowrap"
        desc="세 장의 카드로 지나온 길과 다가올 길을 읽습니다."
        blockedNote="이번 주의 흐름은 이미 받으셨어요 · 결과 보기"
        blocked={blockedThree}
        ariaBase="과거 현재 미래"
        onStart={() => choose("three")}
        deckId={deckId}
        cardClassName="aspect-[2/3.4] w-11 lg:w-[74px]"
        cardSizes="74px"
        cardCount={3}
      />

      {isDevTools && todayCount > 0 ? (
        <button
          type="button"
          onClick={() => resetTodayReadings()}
          className="justify-self-start text-[12px] text-muted underline underline-offset-4 hover:text-cream lg:col-span-2"
        >
          [개발] 오늘 리딩 {todayCount}건 리셋
        </button>
      ) : null}
    </div>
  );
}
