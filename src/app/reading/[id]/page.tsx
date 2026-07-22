"use client";

import { use } from "react";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { CaretLeft } from "@phosphor-icons/react";
import { DesktopNav } from "@/components/SiteNav";
import { cardBySlug, type Card } from "@/data/cards";
import { useJournal } from "@/lib/journal";
import { readingById, useArcanaStore } from "@/lib/store";
import { OneCardResult, ThreeCardResult } from "../ReadingResult";

/**
 * 저장된 리딩 결과를 id로 재열람한다. draw의 갓-뽑은 리빌과 같은 결과
 * 컴포넌트를 쓰되, collectionCount를 넘기지 않아 "추가되었습니다" 배너는
 * 숨긴다(이미 지난 리딩이므로).
 */
export default function ReadingResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const reducedMotion = useReducedMotion();
  const { store } = useArcanaStore();
  const { store: journal } = useJournal();

  const backNav = (
    <nav className="flex h-14 flex-none items-center px-5 lg:hidden">
      <Link
        href="/reading"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted hover:text-cream"
      >
        <CaretLeft size={16} aria-hidden />
        리딩
      </Link>
    </nav>
  );

  // SSR / mount 전에는 store·journal이 null. 빈 화면으로 깜빡임을 막는다
  // (journal도 같이 기다리지 않으면 라벨이 "쓰기"→"보기"로 깜빡인다).
  if (store === null || journal === null) {
    return (
      <div className="flex min-h-[100dvh] flex-col">
        <DesktopNav active="reading" />
        {backNav}
      </div>
    );
  }

  const reading = readingById(store, id);
  const cards = reading
    ? (reading.cards
        .map((slug) => cardBySlug.get(slug))
        .filter(Boolean) as Card[])
    : [];

  if (!reading || cards.length === 0) {
    return (
      <div className="flex min-h-[100dvh] flex-col">
        <DesktopNav active="reading" />
        {backNav}
        <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="font-display text-[21px] font-semibold">
            리딩을 찾을 수 없습니다
          </p>
          <p className="mt-1.5 text-[14px] text-muted">
            이 결과는 이 기기에 저장되어 있지 않습니다.
          </p>
          <Link href="/reading" className="btn btn-gold mt-6">
            리딩 시작하기
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <DesktopNav active="reading" />
      {backNav}
      {reading.spread === "one" ? (
        <OneCardResult
          card={cards[0]}
          deckId={reading.deckId}
          focus={reading.category}
          reducedMotion={!!reducedMotion}
          actions={
            <>
              <Link
                href={`/collection/${reading.deckId}/${cards[0].slug}`}
                className="btn btn-gold w-full lg:w-auto"
              >
                카드 자세히 보기
              </Link>
              <Link href="/collection" className="btn btn-ghost w-full lg:w-auto">
                컬렉션 보기
              </Link>
              <Link
                href={`/my/journal/${reading.localDate}`}
                className="btn btn-ghost w-full lg:w-auto"
              >
                {journal[reading.localDate] ? "이날의 일기 보기" : "이날의 일기 쓰기"}
              </Link>
            </>
          }
        />
      ) : (
        <ThreeCardResult
          picked={cards}
          deckId={reading.deckId}
          focus={reading.category}
          reducedMotion={!!reducedMotion}
          actions={
            <>
              <Link href="/collection" className="btn btn-gold w-full lg:w-auto">
                컬렉션 보기
              </Link>
              <Link
                href={`/my/journal/${reading.localDate}`}
                className="btn btn-ghost w-full lg:w-auto"
              >
                {journal[reading.localDate] ? "이날의 일기 보기" : "이날의 일기 쓰기"}
              </Link>
            </>
          }
        />
      )}
    </div>
  );
}
