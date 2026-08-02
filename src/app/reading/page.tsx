"use client";

import Link from "next/link";
import { FlowHeader } from "@/components/FlowHeader";
import { CardBack } from "@/components/CardBack";
import { DesktopNav } from "@/components/SiteNav";
import { deckById } from "@/data/decks";
import { useSelectedDeck } from "@/lib/store";
import { ReadingChoice } from "./ReadingChoice";

export default function ReadingPage() {
  const { deckId, ready } = useSelectedDeck();
  const deck = deckById(deckId);

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <DesktopNav active="reading" />
      <FlowHeader
        backHref="/"
        backLabel="홈"
        step="1 / 3"
        contentClassName="max-w-[1060px]"
      />
      <main className="mx-auto w-full max-w-[1060px] px-6 pb-8 pt-3 lg:px-12 lg:pb-24 lg:pt-[88px]">
        <h1 className="font-display text-[27px] font-semibold leading-[1.35] lg:text-[40px] lg:leading-[1.3]">
          어떤 리딩을{" "}
          <br className="lg:hidden" />
          할까요
        </h1>
        {/* hydration 전에는 classic이 잠정값이므로, 확정된 덱만 표시해 이름이 튀지 않게 한다. */}
        {ready ? (
          <section className="mt-5 flex items-center gap-3 rounded-2xl border border-line bg-ink-1 p-3.5 lg:mt-7 lg:rounded-[14px] lg:p-4">
            <div className="relative h-16 w-11 flex-none overflow-hidden rounded-md bg-ink-2 lg:h-[76px] lg:w-[50px]">
              <CardBack deckId={deck.id} sizes="50px" className="absolute inset-0" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] text-muted">이번 리딩에 사용할 덱</p>
              <p className="mt-0.5 font-display text-[17px] font-semibold text-cream lg:text-[19px]">
                {deck.nameKo}
              </p>
            </div>
            <Link
              href="/collection?from=reading"
              className="inline-flex min-h-11 flex-none items-center rounded-lg border border-line-gold px-3 text-[13px] text-gold-soft hover:text-cream"
            >
              덱 바꾸기
            </Link>
          </section>
        ) : null}
        <ReadingChoice />
      </main>
    </div>
  );
}
