"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { DesktopNav, MobileTopBar } from "@/components/SiteNav";
import { cardBySlug } from "@/data/cards";
import { koCards } from "@/data/ko";
import { setEntry, useJournal } from "@/lib/journal";
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

export default function JournalDayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = use(params);
  const { store } = useArcanaStore();
  const { store: journal, refresh } = useJournal();

  const [body, setBody] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (journal && !loaded) {
      setBody(journal[date]?.body ?? "");
      setLoaded(true);
    }
  }, [journal, loaded, date]);

  const readings = (store?.readings ?? []).filter((r) => r.localDate === date);

  const save = () => {
    setEntry(date, body);
    refresh();
    setSaved(true);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <DesktopNav active="my" />
      <MobileTopBar />
      <nav className="flex h-12 flex-none items-center px-5 lg:hidden">
        <Link
          href="/my/journal"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted hover:text-cream"
        >
          <CaretLeft size={16} aria-hidden />
          일별 기록
        </Link>
      </nav>
      <main className="mx-auto w-full max-w-[680px] flex-1 px-5 pb-10 pt-1 lg:px-12 lg:pb-[88px] lg:pt-6">
        <h1 className="font-serif text-[24px] font-semibold lg:text-[32px]">
          {formatKoDate(date)}
        </h1>

        {readings.length > 0 ? (
          <div className="mt-5 flex flex-col gap-2.5">
            {readings.map((r) => (
              <Link
                key={r.id}
                href={`/reading/${r.id}`}
                className="flex items-center justify-between rounded-2xl border border-line bg-ink-1 px-5 py-4 hover:border-line-gold lg:rounded-[14px]"
              >
                <span className="text-[13.5px] lg:text-[15px]">
                  {readingSummary(r)}
                </span>
                <CaretRight size={16} className="text-muted" aria-hidden />
              </Link>
            ))}
          </div>
        ) : null}

        <div className="mt-6 lg:mt-8">
          <label
            htmlFor="journal-body"
            className="text-[13px] text-gold-soft lg:text-[14px]"
          >
            그날의 일기
          </label>
          <textarea
            id="journal-body"
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setSaved(false);
            }}
            placeholder="오늘 마음에 남은 것을 적어 보세요."
            rows={8}
            className="mt-2 w-full resize-y rounded-2xl border border-line bg-ink-1 p-4 text-[15px] leading-[1.7] text-body outline-none focus:border-line-gold lg:rounded-[14px]"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={!loaded}
              className="btn btn-gold"
            >
              저장
            </button>
            {saved ? (
              <span className="text-[13px] text-muted">저장되었습니다</span>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
