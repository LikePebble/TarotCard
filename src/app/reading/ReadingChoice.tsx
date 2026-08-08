"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ticketsExhaustedKey, track, trackOnce } from "@/lib/analytics";
import { CardArt } from "@/components/CardArt";
import { CardBack } from "@/components/CardBack";
import { cardBySlug } from "@/data/cards";
import { focusLabelOf } from "@/data/focus";
import { useSession } from "@/lib/auth/session";
import { useRetainedDrawUsage } from "@/lib/draw-guard";
import {
  blockingReading,
  setPendingSpread,
  useArcanaStore,
  useSelectedDeck,
  type SpreadType,
} from "@/lib/store";
import {
  TICKET_BONUS_HINT,
  ticketNoticeLinesOf,
  ticketStateOf,
} from "@/lib/tickets";
import { todayOneCardReadings } from "@/lib/today-readings";
import { accountDataReady, useSyncStatus } from "@/lib/sync/status";
import { usePeriodClock } from "@/lib/use-period-clock";
import {
  isDevTools,
  resetCurrentReadings,
  gatingReadingCount,
} from "@/lib/dev-reset";

const panel =
  "flex w-full flex-col items-start gap-[18px] rounded-2xl border border-line bg-ink-1 p-6 text-left hover:border-line-gold lg:min-h-[330px] lg:justify-between lg:rounded-[14px] lg:p-10";

/**
 * 패널에 앞면으로 보여 줄 카드 한 장.
 *
 * deckId를 장마다 들고 다니는 이유: 덱은 그 리딩을 뽑을 때 쓴 것이어야 한다.
 * 기본 덱을 바꿔도 실제로 받은 그림이 그대로 보여야 하고, "오늘의 카드"는
 * 오늘 안에서도 장마다 덱이 다를 수 있다.
 */
type CardFace = {
  key: string;
  slug: string;
  deckId: string;
  /** 카드 아래 붙는 주제 이름. 없으면 라벨 없이 그림만 둔다(주 1회 유형). */
  label?: string;
};

/**
 * 리딩 유형 패널.
 *
 * href가 있으면 <Link>(이번 주기에 이미 뽑아 새로 시작할 수 없는 상태),
 * 없으면 <button>(뽑기 가능)이다. 패널 전체가 하나의 조작 대상이므로 안에
 * 링크나 버튼을 겹쳐 두지 않는다 — 카드 그림은 표시 전용이다.
 *
 * faces가 있으면 뒷면 대신 그 카드들을 앞면으로 보여 준다. 없으면 cardCount
 * 만큼 뒷면을 깐다.
 *
 * ticketNote는 세 값을 구분한다: undefined면 티켓과 무관한 유형(주 1회)이라
 * 자리를 아예 두지 않고, null이면 아직 확정 전이라 자리만 비워 두며(값이
 * 바뀌며 깜빡이지 않게), 문자열이면 그대로 보여 준다.
 */
function TypeCard({
  title,
  titleClass = "",
  note,
  noteToned,
  cadenceLabel,
  ticketNote,
  faces,
  pendingBacks = 0,
  href,
  locked = false,
  aria,
  onStart,
  deckId,
  cardClassName,
  cardSizes,
  cardCount,
}: {
  title: string;
  titleClass?: string;
  /** 설명문 또는 이미 받은 상태의 안내문. */
  note: string;
  /** 이미 받은 상태의 안내면 true — 설명문(muted)과 색을 가른다. */
  noteToned: boolean;
  cadenceLabel: string;
  ticketNote?: string | null;
  faces: CardFace[];
  /** 받은 카드 뒤에 덧붙일 뒷면 수 — 아직 더 받을 수 있다는 표시. */
  pendingBacks?: number;
  href?: string;
  /** 로그아웃으로 결과는 지웠지만, 같은 케이던스의 재뽑기는 막아야 하는 경우. */
  locked?: boolean;
  aria: string;
  onStart: () => void;
  deckId: string;
  cardClassName: string;
  cardSizes: string;
  cardCount: number;
}) {
  const faceEls = faces.map((face) => {
    const card = cardBySlug.get(face.slug);
    if (!card) return null;
    return (
      <div
        key={face.key}
        className="flex flex-none flex-col items-center gap-1.5"
      >
        {/* CardArt는 래퍼가 h-full w-full이라 크기 클래스를 직접 넘기면
            w-full과 충돌한다. CardBack과 달리 바깥에서 크기를 잡아 준다. */}
        <div
          className={`relative overflow-hidden rounded-[12px] border border-line-gold ${cardClassName}`}
        >
          <CardArt card={card} deckId={face.deckId} sizes={cardSizes} />
        </div>
        {face.label ? (
          <span className="text-center text-[11px] text-muted lg:text-[12.5px]">
            {face.label}
          </span>
        ) : null}
      </div>
    );
  });

  // 아직 아무것도 안 받았으면 이 유형이 몇 장짜리인지를 뒷면 수로 보여 준다.
  // 이미 받은 게 있으면, 더 받을 수 있을 때만(pendingBacks) 뒷면을 덧붙인다.
  // 받은 카드만 늘어놓으면 패널이 기록 표시처럼 보여, 아직 뽑을 수 있다는
  // 사실이 문구에만 남고 카드 행에서는 사라진다.
  const backCount = faces.length > 0 ? pendingBacks : cardCount;
  const cardEls = [
    ...faceEls,
    ...Array.from({ length: backCount }, (_, i) => (
      <CardBack
        key={`back-${i}`}
        deckId={deckId}
        sizes={cardSizes}
        className={cardClassName}
      />
    )),
  ];

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
            noteToned ? "text-gold-soft" : "text-muted lg:max-w-[300px]"
          }`}
        >
          {note}
        </p>
        {ticketNote === undefined ? null : ticketNote === null ? (
          <p aria-hidden className="mt-1.5 min-h-[17px] lg:min-h-[19px]" />
        ) : (
          <p className="mt-1.5 min-h-[17px] whitespace-pre-line text-[12.5px] text-muted lg:min-h-[19px] lg:text-[13.5px]">
            {ticketNote}
          </p>
        )}
      </div>
      <div className="flex items-start gap-1.5 lg:mt-7 lg:gap-2.5">
        {cardEls}
      </div>
    </>
  );

  return locked ? (
    <div aria-label={aria} aria-disabled className={`${panel} cursor-not-allowed opacity-45`}>
      {inner}
    </div>
  ) : href ? (
    <Link href={href} aria-label={aria} className={panel}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onStart} aria-label={aria} className={panel}>
      {inner}
    </button>
  );
}

export function ReadingChoice() {
  const router = useRouter();
  const { store } = useArcanaStore();
  const { user, loading, devSession } = useSession();
  const { deckId } = useSelectedDeck();
  const { initialSync } = useSyncStatus();
  const now = usePeriodClock();

  const choose = (spread: SpreadType) => {
    track("reading_start", { spread });
    setPendingSpread(spread);
    router.push("/reading/focus");
  };

  // 티켓 수는 스토어(오늘 쓴 장수)와 세션(로그인 보너스 +1) 둘 다에 달려 있다.
  // 둘 중 하나라도 정해지기 전에 그리면 "2장 → 3장"으로 값이 바뀌어 보이고,
  // 소진 여부까지 뒤집힌다. JournalLink와 같은 방식으로 확정 전에는 티켓에
  // 기대는 표시를 아예 내보내지 않는다.
  const ticketsReady =
    store !== null &&
    accountDataReady({
      authLoading: loading,
      signedIn: user !== null,
      devSession,
      initialSync,
    });
  const retainedUsage = useRetainedDrawUsage(
    now,
    !loading && user === null,
  );
  const tickets = ticketStateOf(store, now, user !== null, retainedUsage.oneSlotsUsed);

  // 오늘 받은 "오늘의 카드"들. 오늘 쓴 티켓 수와 같은 스토어에서 파생되므로
  // 티켓이 확정되기 전에는 함께 비워 둔다 — 카드만 먼저 나타났다가 티켓 문구가
  // 뒤늦게 바뀌면 같은 사실을 두 번 다르게 말하는 꼴이 된다.
  const todayOnes =
    ticketsReady && store ? todayOneCardReadings(store.readings, now) : [];
  const oneExhausted = ticketsReady && tickets.remaining === 0;
  const todayFaces: CardFace[] = todayOnes.map((r) => ({
    key: r.id,
    slug: r.cards[0],
    deckId: r.deckId,
    label: focusLabelOf(r.category),
  }));

  // 과거·현재·미래는 주 1회라 티켓과 무관하다 — maxDailySlots를 넘기지 않는다.
  const blockedThree = store ? blockingReading(store, "three", now) : undefined;
  const retainedThree = retainedUsage.threeUsed;
  const gatingCount = gatingReadingCount(store);
  const resettableCount = Math.max(
    gatingCount,
    retainedUsage.oneSlotsUsed + Number(retainedThree),
  );

  // 소진 안내가 실제로 화면에 나온 순간에만 계측한다. oneExhausted는
  // ticketsReady(스토어 + 세션 확정)를 이미 포함하므로, 마운트 직후의 잠정
  // 상태(store=null → used=0)로 잘못 나갈 일이 없다. trackOnce의 키는 날짜
  // 단위라 같은 탭에서 리렌더·재방문·주제 선택 화면까지 통틀어 하루 한 번이다.
  useEffect(() => {
    if (!oneExhausted) return;
    trackOnce(ticketsExhaustedKey(now), "tickets_exhausted", {
      surface: "reading_choice",
      spread: "one",
    });
  }, [oneExhausted, now]);

  return (
    <div className="mt-[18px] flex flex-col gap-[18px] lg:mt-12 lg:grid lg:grid-cols-[1.25fr_1fr] lg:gap-5">
      <TypeCard
        title="오늘의 카드"
        cadenceLabel="매일"
        // 소진이든 아니든 언제나 테마 선택 화면으로 보낸다. 그 화면이 테마마다
        // 받음/받을 수 있음/티켓 소진을 이미 갈라 보여 주고, 받은 테마는 그
        // 결과로 이어 준다. 여기서 리딩 하나를 골라 줄 이유가 없다.
        note={
          oneExhausted
            ? "오늘의 흐름은 이미 받으셨습니다 · 다시 보기"
            : "한 장의 카드를 뽑아 오늘 하루 흐름을 살펴 보세요."
        }
        noteToned={oneExhausted}
        ticketNote={ticketsReady ? ticketNoticeLinesOf(tickets) : null}
        faces={todayFaces}
        // 티켓이 남았으면 뒷면 한 장을 덧붙여 "아직 뽑을 수 있다"를 카드 행에서도 보인다.
        pendingBacks={oneExhausted ? 0 : 1}
        aria={
          oneExhausted
            ? `오늘의 카드, 오늘 받으신 ${todayFaces.length}장 다시 보기`
            : todayFaces.length > 0
              ? `오늘의 카드, 오늘 ${todayFaces.length}장 받으셨습니다 · 새로 뽑기`
              : "오늘의 카드"
        }
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
        note={
          blockedThree
            // 3카드는 "운명"으로 부른다. 1장이 이미 "오늘의 흐름"이라 같은 말을
            // 쓰면 두 리딩이 언어로 구분되지 않는다. 결정론적 주장("운명이 이
            // 카드로 결정됐다")은 여전히 금지지만, 명사 자체는 사주·타로에서
            // 관용적으로 쓰는 말이라 서비스 안에서 허용한다. 예측하지 않는다는
            // 고지는 약관 제5조가 맡는다.
            ? "이번 주의 운명은 이미 받으셨습니다 · 결과 보기"
            : retainedThree
              ? "이번 주의 운명은 이미 받으셨습니다"
              : "세 장의 카드를 뽑아 과거와 현재, 미래의 운명을 읽어 보세요."
        }
        noteToned={blockedThree !== undefined || retainedThree}
        faces={
          blockedThree
            ? blockedThree.cards.map((slug, i) => ({
                key: `${slug}-${i}`,
                slug,
                deckId: blockedThree.deckId,
              }))
            : []
        }
        href={blockedThree ? `/reading/${blockedThree.id}` : undefined}
        locked={!blockedThree && retainedThree}
        aria={
          blockedThree
            ? "과거 현재 미래 결과 보기"
            : retainedThree
              ? "과거 현재 미래, 이번 주는 이미 받았습니다"
              : "과거 현재 미래"
        }
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

      {isDevTools && resettableCount > 0 ? (
        <button
          type="button"
          onClick={() => resetCurrentReadings()}
          className="justify-self-start text-[12px] text-muted underline underline-offset-4 hover:text-cream lg:col-span-2"
        >
          [개발] 오늘·이번 주 리딩 {resettableCount}건 리셋
        </button>
      ) : null}
    </div>
  );
}
