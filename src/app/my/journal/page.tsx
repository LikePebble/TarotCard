"use client";

import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { DesktopNav, MobileTopBar } from "@/components/SiteNav";
import { TabBar } from "@/components/TabBar";
import { cardBySlug } from "@/data/cards";
import { koCards } from "@/data/ko";
import { useJournal } from "@/lib/journal";
import { useArcanaStore, type ReadingRecord } from "@/lib/store";

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
  const { store } = useArcanaStore();
  const { store: journal } = useJournal();

  // 리딩 날짜 + 일기 날짜의 합집합을 최신순으로.
  const byDate = new Map<string, ReadingRecord[]>();
  for (const r of store?.readings ?? []) {
    const list = byDate.get(r.localDate) ?? [];
    list.push(r);
    byDate.set(r.localDate, list);
  }
  const dates = Array.from(
    new Set([...byDate.keys(), ...Object.keys(journal ?? {})]),
  ).sort((a, b) => b.localeCompare(a));

  const loading = store === null || journal === null;

  return (
    <div className="flex min-h-[100dvh] flex-col">
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
      <main className="mx-auto w-full max-w-[760px] flex-1 px-5 pb-8 pt-1 lg:px-12 lg:pb-[88px] lg:pt-6">
        <h1 className="font-serif text-[27px] font-semibold lg:text-[36px]">
          일별 기록
        </h1>

        {!loading && dates.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-line bg-ink-1 p-6 lg:p-8">
            <p className="font-serif text-lg font-semibold lg:text-[21px]">
              아직 기록이 없습니다
            </p>
            <p className="mt-1 text-[13.5px] text-muted lg:text-[15px]">
              리딩을 하면 그날의 기록이 이곳에 쌓이고, 일기를 남길 수 있습니다.
            </p>
            <Link href="/reading" className="btn btn-gold mt-4">
              리딩 시작하기
            </Link>
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-2.5 lg:mt-8">
          {dates.map((date) => {
            const readings = byDate.get(date) ?? [];
            const note = journal?.[date]?.body;
            return (
              <Link
                key={date}
                href={`/my/journal/${date}`}
                className="rounded-2xl border border-line bg-ink-1 p-5 hover:border-line-gold lg:rounded-[14px] lg:p-6"
              >
                <div className="flex items-center justify-between">
                  <p className="font-serif text-[16px] font-semibold lg:text-[18px]">
                    {formatKoDate(date)}
                  </p>
                  <CaretRight size={16} className="text-muted" aria-hidden />
                </div>
                {readings.map((r) => (
                  <p
                    key={r.id}
                    className="mt-1.5 text-[13px] text-muted lg:text-[14px]"
                  >
                    {readingSummary(r)}
                  </p>
                ))}
                {note ? (
                  <p className="mt-2 line-clamp-2 border-t border-line pt-2 text-[13px] text-body lg:text-[14px]">
                    {note}
                  </p>
                ) : null}
              </Link>
            );
          })}
        </div>
      </main>
      <TabBar />
    </div>
  );
}
