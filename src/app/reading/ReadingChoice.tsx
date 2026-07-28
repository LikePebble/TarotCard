"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CardArt } from "@/components/CardArt";
import { CardBack } from "@/components/CardBack";
import { cardBySlug } from "@/data/cards";
import { useSession } from "@/lib/auth/session";
import { localDateOf } from "@/lib/period";
import {
  blockingReading,
  setPendingSpread,
  useArcanaStore,
  useSelectedDeck,
  type ReadingRecord,
  type SpreadType,
} from "@/lib/store";
import {
  TICKET_BONUS_HINT,
  TICKET_RESET_NOTE,
  ticketNoticeOf,
  ticketStateOf,
} from "@/lib/tickets";
import {
  isDevTools,
  resetCurrentReadings,
  gatingReadingCount,
} from "@/lib/dev-reset";

const panel =
  "flex w-full flex-col items-start gap-[18px] rounded-2xl border border-line bg-ink-1 p-6 text-left hover:border-line-gold lg:min-h-[330px] lg:justify-between lg:rounded-[14px] lg:p-10";

/**
 * 리딩 유형 카드. 이번 주기에 이미 뽑았으면(blocked) 새로 시작하지 못하게
 * 하고 blockedHref로 링크한다(리롤 방지). 아니면 유형을 골라 포커스 단계로 간다.
 *
 * blocked면 뒷면 대신 실제로 뽑은 카드(blocked.cards)를 보여준다 — 덱은 그때
 * 뽑을 때 쓴 blocked.deckId를 쓴다. 기본 덱을 바꿔도 실제로 받은 그림 그대로.
 *
 * ticketNote는 세 값을 구분한다: undefined면 티켓과 무관한 유형(주 1회)이라
 * 자리를 아예 두지 않고, null이면 아직 확정 전이라 자리만 비워 두며(값이
 * 바뀌며 깜빡이지 않게), 문자열이면 그대로 보여 준다.
 */
function TypeCard({
  title,
  titleClass = "",
  desc,
  cadenceLabel,
  blockedNote,
  blockedHref,
  blockedAria,
  ticketNote,
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
  cadenceLabel: string;
  blockedNote: string;
  blockedHref?: string;
  blockedAria?: string;
  ticketNote?: string | null;
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
        <div className="flex items-center gap-2.5">
          <h2
            className={`font-display text-[21px] font-semibold lg:text-[27px] ${titleClass}`}
          >
            {title}
          </h2>
          <span className="flex-none rounded-full border border-line-gold px-2.5 py-1 text-[11px] text-gold-soft">
            {cadenceLabel}
          </span>
        </div>
        <p
          className={`mt-1 text-[13.5px] lg:text-[15px] ${
            blocked ? "text-gold-soft" : "text-muted lg:max-w-[300px]"
          }`}
        >
          {blocked ? blockedNote : desc}
        </p>
        {ticketNote === undefined ? null : ticketNote === null ? (
          <p aria-hidden className="mt-1.5 min-h-[17px] lg:min-h-[19px]" />
        ) : (
          <p className="mt-1.5 min-h-[17px] text-[12.5px] text-muted lg:min-h-[19px] lg:text-[13.5px]">
            {ticketNote}
          </p>
        )}
      </div>
      <div className="flex gap-1.5 lg:mt-7 lg:gap-2.5">{cardEls}</div>
    </>
  );

  return blocked ? (
    <Link
      href={blockedHref ?? `/reading/${blocked.id}`}
      aria-label={blockedAria ?? `${ariaBase} 결과 보기`}
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
  const { user, loading } = useSession();
  const { deckId } = useSelectedDeck();
  const [now] = useState(() => new Date());

  const choose = (spread: SpreadType) => {
    setPendingSpread(spread);
    router.push("/reading/focus");
  };

  // 티켓 수는 스토어(오늘 쓴 장수)와 세션(로그인 보너스 +1) 둘 다에 달려 있다.
  // 둘 중 하나라도 정해지기 전에 그리면 "2장 → 3장"으로 값이 바뀌어 보이고,
  // 소진 여부까지 뒤집힌다. JournalLink와 같은 방식으로 확정 전에는 티켓에
  // 기대는 표시를 아예 내보내지 않는다.
  const ticketsReady = store !== null && !loading;
  const tickets = ticketStateOf(store, now, user !== null);
  const blockedOne =
    ticketsReady && store
      ? blockingReading(store, "one", now, tickets.total)
      : undefined;
  // 과거·현재·미래는 주 1회라 티켓과 무관하다 — maxDailySlots를 넘기지 않는다.
  const blockedThree = store ? blockingReading(store, "three", now) : undefined;
  const gatingCount = gatingReadingCount(store);

  return (
    <div className="mt-[18px] flex flex-col gap-[18px] lg:mt-12 lg:grid lg:grid-cols-[1.25fr_1fr] lg:gap-5">
      <TypeCard
        title="오늘의 카드"
        cadenceLabel="매일"
        desc="한 장의 카드를 뽑아 오늘 하루 흐름을 살펴 보세요."
        // 소진 상태에서는 "결과 보기"가 성립하지 않는다 — 오늘 받은 리딩이
        // 여럿이라 그중 하나를 고를 근거가 없다. 그날 리딩을 전부 모아 보여
        // 주는 그날의 일기로 보낸다.
        blockedNote="오늘 받은 카드는 일기에 모여 있습니다 · 모아 보기"
        blockedHref={`/my/journal/${localDateOf(now)}`}
        blockedAria="오늘의 카드, 오늘 받은 카드 모아 보기"
        ticketNote={
          ticketsReady
            ? tickets.remaining > 0
              ? ticketNoticeOf(tickets)
              : `${ticketNoticeOf(tickets)} · ${TICKET_RESET_NOTE}`
            : null
        }
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
        cadenceLabel="이번 주"
        desc="세 장의 카드를 뽑아 과거와 현재, 미래의 흐름을 읽어 보세요."
        blockedNote="이번 주의 흐름은 이미 받으셨습니다 · 결과 보기"
        blocked={blockedThree}
        ariaBase="과거 현재 미래"
        onStart={() => choose("three")}
        deckId={deckId}
        cardClassName="aspect-[2/3.4] w-11 lg:w-[74px]"
        cardSizes="74px"
        cardCount={3}
      />

      {/* 로그인 보너스 안내. 티켓이 확정되기 전에는 내보내지 않는다. 패널
          자체가 button/Link라 카드 안에 링크를 넣을 수 없어 아래 줄로 뺀다. */}
      {ticketsReady && user === null ? (
        <Link
          href="/login"
          className="flex min-h-11 items-center justify-between gap-3 rounded-2xl border border-line bg-ink-1 px-5 py-3.5 hover:border-line-gold lg:col-span-2 lg:rounded-[14px] lg:px-6"
        >
          <span className="text-[13px] text-muted lg:text-[14px]">
            {TICKET_BONUS_HINT}
          </span>
          <span className="flex-none text-[13px] text-gold-soft lg:text-[14px]">
            로그인
          </span>
        </Link>
      ) : null}

      {isDevTools && gatingCount > 0 ? (
        <button
          type="button"
          onClick={() => resetCurrentReadings()}
          className="justify-self-start text-[12px] text-muted underline underline-offset-4 hover:text-cream lg:col-span-2"
        >
          [개발] 오늘·이번 주 리딩 {gatingCount}건 리셋
        </button>
      ) : null}
    </div>
  );
}
