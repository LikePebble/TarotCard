"use client";

import { type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CardBack } from "@/components/CardBack";
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
 */
function TypeCard({
  title,
  titleClass = "",
  desc,
  blockedNote,
  blocked,
  ariaBase,
  onStart,
  children,
}: {
  title: string;
  titleClass?: string;
  desc: string;
  blockedNote: string;
  blocked: ReadingRecord | undefined;
  ariaBase: string;
  onStart: () => void;
  children: ReactNode;
}) {
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
      <div className="flex gap-1.5 lg:mt-7 lg:gap-2.5">{children}</div>
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
      >
        <CardBack
          deckId={deckId}
          sizes="96px"
          className="aspect-[2/3.4] w-[52px] lg:w-24"
        />
      </TypeCard>

      <TypeCard
        title="과거 · 현재 · 미래"
        titleClass="whitespace-nowrap"
        desc="세 장의 카드로 지나온 길과 다가올 길을 읽습니다."
        blockedNote="이번 주의 흐름은 이미 받으셨어요 · 결과 보기"
        blocked={blockedThree}
        ariaBase="과거 현재 미래"
        onStart={() => choose("three")}
      >
        <CardBack
          deckId={deckId}
          sizes="74px"
          className="aspect-[2/3.4] w-11 lg:w-[74px]"
        />
        <CardBack
          deckId={deckId}
          sizes="74px"
          className="aspect-[2/3.4] w-11 lg:w-[74px]"
        />
        <CardBack
          deckId={deckId}
          sizes="74px"
          className="aspect-[2/3.4] w-11 lg:w-[74px]"
        />
      </TypeCard>

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
