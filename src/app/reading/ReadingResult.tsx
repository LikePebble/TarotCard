"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { CardArt } from "@/components/CardArt";
import { type Card } from "@/data/cards";
import { focusLabelOf, focusParagraphOf } from "@/data/focus";
import { koCards } from "@/data/ko";
import { koPositions } from "@/data/ko-positions";

const POSITIONS = ["과거", "현재", "미래"] as const;

function nameKoOf(card: Card): string {
  return koCards[card.slug]?.nameKo ?? card.nameEn;
}

function descriptionOf(card: Card): string[] {
  const ko = koCards[card.slug]?.description;
  return (ko && ko.length > 0 ? ko : card.en.description).split("\n\n");
}

/**
 * 오늘의 카드 결과. 갓 뽑은 리빌(draw)과 재열람(/reading/[id])이 공유한다.
 * collectionCount가 주어지면 "컬렉션에 추가되었습니다" 배너를 보여준다(신규 리빌).
 * actions에는 문맥별 버튼(자세히 보기 / 컬렉션 등)을 넘긴다.
 */
export function OneCardResult({
  card,
  deckId,
  focus,
  collectionCount,
  reducedMotion,
  actions,
}: {
  card: Card;
  deckId: string;
  focus: string;
  collectionCount?: number | null;
  reducedMotion: boolean;
  actions: ReactNode;
}) {
  const paragraphs = descriptionOf(card);
  const themeParagraph = focusParagraphOf(focus, card.slug);
  return (
    <motion.main
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-[1280px] flex-1 px-6 pb-8 pt-1 lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-[72px] lg:px-[72px] lg:py-20"
    >
      <div className="flex justify-center lg:justify-end">
        <div className="relative aspect-[2/3.4] w-[200px] overflow-hidden rounded-xl bg-ink-2 shadow-[0_24px_60px_rgba(8,5,0,0.65)] lg:w-full lg:max-w-[360px] lg:rounded-[14px]">
          <CardArt
            card={card}
            deckId={deckId}
            sizes="(min-width: 1024px) 360px, 200px"
            priority
            showText
          />
        </div>
      </div>
      <div>
        <p className="mt-[22px] text-center text-[13px] text-muted lg:mt-0 lg:text-left lg:text-[14px]">
          오늘의 카드 ·{" "}
          <b className="font-medium text-gold">{focusLabelOf(focus)}</b>
        </p>
        <h1 className="mt-1 text-center font-serif text-[30px] font-semibold lg:text-left lg:text-[44px]">
          {nameKoOf(card)}{" "}
          <span className="ml-1 text-base font-normal text-muted lg:text-[22px]">
            {card.nameEn}
          </span>
        </h1>
        <div className="mt-4 space-y-3 text-[15px] text-body lg:mt-6 lg:max-w-[520px] lg:text-base">
          {paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
        {themeParagraph ? (
          <div className="mt-5 border-t border-line pt-4 lg:max-w-[520px]">
            <p className="text-[12.5px] text-gold lg:text-[13.5px]">
              {focusLabelOf(focus)}
            </p>
            <p className="mt-1.5 text-[15px] text-body lg:text-base">
              {themeParagraph}
            </p>
          </div>
        ) : null}
        {collectionCount !== undefined ? (
          <div className="mt-5 flex items-baseline justify-between rounded-[14px] border border-line-gold px-[18px] py-3.5 text-[13.5px] lg:mt-8 lg:inline-flex lg:gap-3.5 lg:text-[14.5px]">
            <span>컬렉션에 추가되었습니다</span>
            <b className="font-serif text-[15px] font-semibold text-gold-soft">
              {collectionCount ?? "-"} / 78
            </b>
          </div>
        ) : null}
        <div className="mt-5 flex flex-col gap-2.5 lg:mt-8 lg:flex-row lg:gap-3.5">
          {actions}
        </div>
      </div>
    </motion.main>
  );
}

/**
 * 과거·현재·미래 결과. 갓 뽑은 리빌(draw)과 재열람(/reading/[id])이 공유한다.
 */
export function ThreeCardResult({
  picked,
  deckId,
  focus,
  collectionCount,
  reducedMotion,
  actions,
}: {
  picked: Card[];
  deckId: string;
  focus: string;
  collectionCount?: number | null;
  reducedMotion: boolean;
  actions: ReactNode;
}) {
  return (
    <motion.main
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-[760px] flex-1 px-6 pb-8 pt-1 lg:pb-24 lg:pt-14"
    >
      <p className="text-center text-[13px] text-muted lg:text-[14px]">
        과거 · 현재 · 미래{" "}
        <b className="font-medium text-gold">{focusLabelOf(focus)}</b>
      </p>
      <div className="mt-4 flex justify-center gap-2.5">
        {picked.map((card) => (
          <div
            key={card.slug}
            className="relative aspect-[2/3.4] w-[72px] overflow-hidden rounded-lg bg-ink-2 lg:w-[92px]"
          >
            <CardArt card={card} deckId={deckId} sizes="92px" />
          </div>
        ))}
      </div>
      <div className="mt-2">
        {picked.map((card, i) => {
          const positionKey = (["past", "present", "future"] as const)[i];
          const positionSentence = koPositions[card.slug]?.[positionKey];
          const themeParagraph = focusParagraphOf(focus, card.slug);
          return (
            <section
              key={card.slug}
              className="flex items-start gap-4 border-b border-line py-[22px] last:border-b-0 lg:gap-7 lg:py-8"
            >
              <div className="relative aspect-[2/3.4] w-[88px] flex-none overflow-hidden rounded-xl bg-ink-2 lg:w-[120px]">
                <CardArt card={card} deckId={deckId} sizes="120px" />
              </div>
              <div>
                <p className="text-[12.5px] text-gold lg:text-[13.5px]">
                  {POSITIONS[i]}
                </p>
                <h2 className="mt-0.5 mb-1.5 font-serif text-xl font-semibold lg:text-2xl">
                  {nameKoOf(card)}{" "}
                  <span className="ml-1 text-[13px] font-normal text-muted lg:text-[15px]">
                    {card.nameEn}
                  </span>
                </h2>
                {positionSentence ? (
                  <p className="mb-2 text-[14.5px] leading-[1.6] text-cream lg:text-base">
                    {positionSentence}
                  </p>
                ) : null}
                <div className="space-y-2.5 text-[13.5px] leading-[1.65] text-body lg:text-[15px]">
                  {descriptionOf(card).map((paragraph) => (
                    <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                  ))}
                </div>
                {themeParagraph ? (
                  <div className="mt-3 border-t border-line pt-2.5">
                    <p className="text-[12.5px] text-gold lg:text-[13.5px]">
                      {focusLabelOf(focus)}
                    </p>
                    <p className="mt-1 text-[13.5px] leading-[1.65] text-body lg:text-[15px]">
                      {themeParagraph}
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
      {collectionCount !== undefined ? (
        <div className="mt-2 flex items-baseline justify-between rounded-[14px] border border-line-gold px-[18px] py-3.5 text-[13.5px] lg:text-[14.5px]">
          <span>3장이 컬렉션에 추가되었습니다</span>
          <b className="font-serif text-[15px] font-semibold text-gold-soft">
            {collectionCount ?? "-"} / 78
          </b>
        </div>
      ) : null}
      <div className="mt-5 flex flex-col gap-2.5 lg:flex-row lg:justify-center lg:gap-3.5">
        {actions}
      </div>
    </motion.main>
  );
}
