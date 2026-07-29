"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { CaretLeft, CaretRight, Notebook } from "@phosphor-icons/react";
import { DesktopNav, MobileTopBar } from "@/components/SiteNav";
import { TabBar } from "@/components/TabBar";
import { cardBySlug } from "@/data/cards";
import { koCards } from "@/data/ko";
import { useJournal, writtenDates } from "@/lib/journal";
import { localDateOf } from "@/lib/period";
import { useArcanaStore, type ReadingRecord } from "@/lib/store";
import { CalendarMonth } from "./CalendarMonth";

function formatKoDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

function readingSummary(r: ReadingRecord): string {
  const type = r.spread === "one" ? "오늘의 카드" : "과거·현재·미래";
  const names = r.cards
    .map((slug) => koCards[slug]?.nameKo ?? cardBySlug.get(slug)?.nameEn ?? slug)
    .join(" · ");
  return `${type} — ${names}`;
}

export default function JournalPage() {
  const reducedMotion = useReducedMotion();
  const { store } = useArcanaStore();
  const { store: journal } = useJournal();
  const [todayIso] = useState(() => localDateOf(new Date()));

  const loading = store === null || journal === null;

  const byDate = new Map<string, ReadingRecord[]>();
  for (const r of store?.readings ?? []) {
    const list = byDate.get(r.localDate) ?? [];
    list.push(r);
    byDate.set(r.localDate, list);
  }
  const readingDates = new Set(byDate.keys());
  // 지운 날(톰스톤)은 달력에도 최근 목록에도 나오지 않는다.
  const journalDates = new Set(journal ? writtenDates(journal) : []);
  const recent = Array.from(new Set([...readingDates, ...journalDates]))
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 6);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden lg:h-auto lg:min-h-[100dvh] lg:overflow-visible">
      <DesktopNav active="my" />
      <MobileTopBar />
      <nav className="flex h-12 flex-none items-center px-5 lg:hidden">
        <Link
          href="/my"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted hover:text-cream"
        >
          <CaretLeft size={16} aria-hidden />
          MY
        </Link>
      </nav>

      <motion.main
        initial={reducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto w-full min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-1 lg:max-w-[760px] lg:overflow-visible lg:px-12 lg:pb-[88px] lg:pt-6"
      >
        <h1 className="font-display text-[27px] font-semibold lg:text-[36px]">
          일별 기록
        </h1>
        <p className="mt-1 text-[13px] text-muted lg:text-[14px]">
          매일의 카드와 마음을 달력에 모아 둡니다.
        </p>

        {loading ? (
          <div
            className="mt-6 h-[420px] animate-pulse rounded-2xl border border-line bg-ink-1 motion-reduce:animate-none lg:rounded-[18px]"
            aria-hidden
          />
        ) : (
          <div className="mt-6">
            <CalendarMonth
              readingDates={readingDates}
              journalDates={journalDates}
              todayIso={todayIso}
            />

            {recent.length === 0 ? (
              <div className="mt-6 flex flex-col items-center rounded-2xl border border-line bg-ink-1 px-6 py-10 text-center lg:rounded-[18px]">
                <Notebook size={28} className="text-gold-soft" aria-hidden />
                <p className="mt-3 font-display text-lg font-semibold lg:text-[21px]">
                  아직 기록이 없습니다
                </p>
                <p className="mt-1 max-w-[320px] text-[13.5px] text-muted lg:text-[15px]">
                  리딩을 하면 그날이 달력에 표시되고, 어느 날이든 눌러 일기를 남길 수 있습니다.
                </p>
                <Link href="/reading" className="btn btn-gold mt-5">
                  리딩 시작하기
                </Link>
              </div>
            ) : (
              <section className="mt-7">
                <h2 className="text-[13px] font-medium text-gold-soft lg:text-[14px]">
                  최근 기록
                </h2>
                <div className="mt-2.5 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-ink-1 lg:rounded-[14px]">
                  {recent.map((date) => {
                    const readings = byDate.get(date) ?? [];
                    const note = journal?.[date]?.body;
                    return (
                      <Link
                        key={date}
                        href={`/my/journal/${date}`}
                        className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-ink-2"
                      >
                        <span className="min-w-0">
                          <span className="font-display text-[15px] font-semibold lg:text-[16px]">
                            {formatKoDate(date)}
                          </span>
                          <span className="mt-0.5 block truncate text-[12.5px] text-muted lg:text-[13.5px]">
                            {readings.length > 0
                              ? readingSummary(readings[0])
                              : note}
                          </span>
                        </span>
                        <CaretRight
                          size={16}
                          className="flex-none text-muted"
                          aria-hidden
                        />
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </motion.main>
      <TabBar />
    </div>
  );
}
