"use client";

import { useState } from "react";
import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
function ymd(y: number, m0: number, d: number): string {
  return `${y}-${pad(m0 + 1)}-${pad(d)}`;
}

/**
 * 월별 달력. 리딩/일기가 있는 날에 마커를 찍고, 지난 날(오늘 포함)은 그날
 * 상세로 이동한다. 미래 날짜는 비활성(회색). 월 이동은 내부 상태.
 */
export function CalendarMonth({
  readingDates,
  journalDates,
  todayIso,
}: {
  readingDates: Set<string>;
  journalDates: Set<string>;
  todayIso: string;
}) {
  const [ty, tm] = todayIso.split("-").map(Number);
  const [view, setView] = useState({ y: ty, m: tm - 1 });

  const startPad = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(startPad).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prev = () =>
    setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));
  const next = () =>
    setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }));

  const navBtn =
    "flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-line-gold hover:text-cream active:scale-95";
  const cellBase =
    "relative flex aspect-square flex-col items-center justify-center rounded-xl text-[13px] transition-colors lg:text-[15px]";

  return (
    <section className="rounded-2xl border border-line bg-ink-1 p-5 lg:rounded-[18px] lg:p-7">
      <header className="flex items-center justify-between">
        <h2 className="font-serif text-[20px] font-semibold lg:text-[24px]">
          {view.y}년 {view.m + 1}월
        </h2>
        <div className="flex gap-2">
          <button type="button" onClick={prev} aria-label="이전 달" className={navBtn}>
            <CaretLeft size={16} aria-hidden />
          </button>
          <button type="button" onClick={next} aria-label="다음 달" className={navBtn}>
            <CaretRight size={16} aria-hidden />
          </button>
        </div>
      </header>

      <div className="mt-5 grid grid-cols-7 gap-1 lg:gap-1.5">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`pb-1 text-center text-[11px] lg:text-[12px] ${
              i === 0 ? "text-gold/70" : "text-muted"
            }`}
          >
            {w}
          </div>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} aria-hidden />;
          const date = ymd(view.y, view.m, day);
          const isToday = date === todayIso;
          const isFuture = date > todayIso;
          const hasReading = readingDates.has(date);
          const hasJournal = journalDates.has(date);
          const marked = hasReading || hasJournal;

          if (isFuture) {
            return (
              <div key={date} className={`${cellBase} text-muted/30`}>
                {day}
              </div>
            );
          }

          return (
            <Link
              key={date}
              href={`/my/journal/${date}`}
              aria-label={`${view.m + 1}월 ${day}일${marked ? " 기록 있음" : ""}`}
              className={`${cellBase} border active:scale-[0.96] ${
                isToday
                  ? "border-gold bg-[rgba(201,162,75,0.08)]"
                  : marked
                    ? "border-line-gold bg-ink-2 hover:border-gold"
                    : "border-transparent hover:border-line"
              }`}
            >
              <span
                className={
                  isToday
                    ? "font-semibold text-gold-soft"
                    : marked
                      ? "text-cream"
                      : "text-body"
                }
              >
                {day}
              </span>
              {marked ? (
                <span className="absolute bottom-1.5 flex gap-[3px]">
                  {hasReading ? (
                    <span className="h-1 w-1 rounded-full bg-gold" aria-hidden />
                  ) : null}
                  {hasJournal ? (
                    <span
                      className="h-1 w-1 rounded-full bg-gold-soft/50"
                      aria-hidden
                    />
                  ) : null}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      <footer className="mt-5 flex items-center gap-4 border-t border-line pt-3.5 text-[12px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden /> 리딩
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-gold-soft/50" aria-hidden /> 일기
        </span>
      </footer>
    </section>
  );
}
