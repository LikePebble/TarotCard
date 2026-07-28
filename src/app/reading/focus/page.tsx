"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FlowHeader } from "@/components/FlowHeader";
import { DesktopNav } from "@/components/SiteNav";
import { focusOptionsFor } from "@/data/focus";
import { ticketsExhaustedKey, track, trackOnce } from "@/lib/analytics";
import { useSession } from "@/lib/auth/session";
import {
  getPendingSpread,
  setPendingFocus,
  slotState,
  useArcanaStore,
  type SlotState,
  type SpreadType,
} from "@/lib/store";
import {
  ticketNoticeLinesOf,
  ticketStateOf,
} from "@/lib/tickets";

const row =
  "group flex w-full items-baseline justify-between gap-3 border-b border-line px-1 py-[22px] text-left lg:px-2 lg:py-[30px]";
const labelClass = "font-display text-[21px] font-medium lg:text-[26px]";
const noteClass = "flex-none text-[13px] lg:text-[14.5px]";

export default function FocusPage() {
  const router = useRouter();
  const [spread, setSpread] = useState<SpreadType | null>(null);
  const { store } = useArcanaStore();
  const { user, loading } = useSession();
  const [now] = useState(() => new Date());

  useEffect(() => {
    const pending = getPendingSpread();
    if (!pending) {
      router.replace("/reading");
      return;
    }
    setSpread(pending);
  }, [router]);

  const choose = (focus: string) => {
    // spread는 이 화면에 들어온 시점에 이미 정해져 있다(없으면 /reading으로
    // 되돌아간다). 그래도 null 자리에 문자열을 지어내지는 않는다.
    if (spread) track("focus_selected", { spread, focus });
    setPendingFocus(focus);
    router.push("/reading/draw");
  };

  // 티켓은 "오늘의 카드"에만 적용된다. 과거·현재·미래는 주 1회 케이던스라
  // 지금까지처럼 테마를 고르는 화면이 그대로 열린다.
  const usesTickets = spread === "one";
  // 스토어(오늘 쓴 장수)와 세션(로그인 보너스 +1)이 모두 정해져야 티켓 수가
  // 확정된다. 그 전에 그리면 잔량이 "2장 → 3장"으로 튀고 available/exhausted가
  // 뒤집혀 보이므로, 확정 전에는 목록 자체를 내보내지 않는다.
  const ticketsReady = store !== null && !loading;
  const tickets = ticketStateOf(store, now, user !== null);
  const ready = spread !== null && (!usesTickets || ticketsReady);
  const options = ready && spread ? focusOptionsFor(spread) : [];

  // "오늘은 여기까지" 행과 소진 안내문이 실제로 그려지는 조건. ticketsReady를
  // 포함하므로 확정 전 잠정 상태로는 나가지 않는다. ReadingChoice와 같은
  // 날짜 키를 쓰므로, 리딩 선택 → 주제 선택으로 이어 들어와도 하루 한 번이다.
  const focusExhausted = usesTickets && ticketsReady && tickets.remaining === 0;
  useEffect(() => {
    if (!focusExhausted) return;
    trackOnce(ticketsExhaustedKey(now), "tickets_exhausted", {
      surface: "reading_focus",
      spread: "one",
    });
  }, [focusExhausted, now]);

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <DesktopNav active="reading" />
      <FlowHeader backHref="/reading" backLabel="리딩" step="2 / 3" />
      <main className="mx-auto w-full max-w-[860px] px-6 pb-8 pt-3 lg:px-12 lg:pb-24 lg:pt-[88px]">
        <p className="min-h-[21px] text-[13px] text-muted lg:mb-3.5 lg:text-[14px]">
          {spread === "three" ? (
            <>
              <b className="font-medium text-gold">과거 · 현재 · 미래</b> 카드를
              뽑습니다
            </>
          ) : spread === "one" ? (
            <>
              <b className="font-medium text-gold">오늘의 카드</b>를 뽑습니다
            </>
          ) : null}
        </p>
        <h1 className="mt-1 font-display text-[27px] font-semibold leading-[1.35] lg:mt-0 lg:text-[40px] lg:leading-[1.3]">
          무엇이 궁금한가요
        </h1>
        {usesTickets ? (
          // 자리는 늘 잡아 두고 문구만 채운다 — 확정되는 순간 목록이 밀려
          // 내려가지 않게.
          <p className="mt-2.5 min-h-[19px] whitespace-pre-line text-[13px] text-muted lg:mt-3.5 lg:text-[14px]">
            {ticketsReady ? ticketNoticeLinesOf(tickets) : ""}
          </p>
        ) : null}
        <div className="mt-[22px] min-h-[330px] border-t border-line lg:mt-10">
          {options.map((option) => {
            const slot: SlotState =
              usesTickets && store
                ? slotState(store, "one", option.id, now, tickets.total)
                : { state: "available" };

            // 오늘 이미 뽑은 테마는 막지 않고 그때 받은 결과로 보낸다.
            if (slot.state === "completed") {
              return (
                <Link
                  key={option.id}
                  href={`/reading/${slot.readingId}`}
                  aria-label={`${option.label}, 오늘 받은 결과 보기`}
                  className={row}
                >
                  <span
                    className={`${labelClass} group-hover:text-gold-soft`}
                  >
                    {option.label}
                  </span>
                  <span className={`${noteClass} text-gold-soft`}>
                    오늘 받았습니다 · 결과 보기
                  </span>
                </Link>
              );
            }

            // 오늘 더 받을 수 없는 주제. 상태를 흐림(색)만으로 두지 않고
            // 문구로도 말하되, "소진"처럼 재화가 떨어진 말투는 쓰지 않는다.
            if (slot.state === "exhausted") {
              return (
                <button
                  key={option.id}
                  type="button"
                  disabled
                  aria-label={`${option.label}, 오늘은 여기까지입니다`}
                  className={`${row} cursor-not-allowed opacity-45`}
                >
                  <span className={labelClass}>{option.label}</span>
                  <span className={`${noteClass} text-muted`}>오늘은 여기까지</span>
                </button>
              );
            }

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => choose(option.id)}
                aria-label={option.label}
                className={row}
              >
                <span className={`${labelClass} group-hover:text-gold-soft`}>
                  {option.label}
                </span>
                <span className={`${noteClass} text-muted`}>{option.desc}</span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
