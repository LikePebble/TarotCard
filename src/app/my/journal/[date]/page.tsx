"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { CardArt } from "@/components/CardArt";
import { DesktopNav, MobileTopBar } from "@/components/SiteNav";
import { cardBySlug } from "@/data/cards";
import { koCards } from "@/data/ko";
import { setEntry, useJournal } from "@/lib/journal";
import { localDateOf } from "@/lib/period";
import { useArcanaStore, type ReadingRecord } from "@/lib/store";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function addDays(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return localDateOf(new Date(y, m - 1, d + delta));
}
function weekdayOf(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return WEEKDAYS[new Date(y, m - 1, d).getDay()];
}
function readingTypeLabel(r: ReadingRecord): string {
  return r.spread === "one" ? "오늘의 카드" : "과거 · 현재 · 미래";
}

export default function JournalDayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = use(params);
  const { store } = useArcanaStore();
  const { store: journal } = useJournal();

  // todayIso는 클라이언트에서만 계산한다(SSR과 타임존이 달라 하이드레이션 불일치가 나지 않게).
  const [todayIso, setTodayIso] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const loadedDate = useRef<string | null>(null);

  useEffect(() => {
    setTodayIso(localDateOf(new Date()));
  }, []);

  // 날짜(param)가 바뀌면 그 날짜의 일기를 다시 불러온다. App Router는 param만
  // 바뀔 때 리마운트하지 않으므로, 날짜 기준으로만 본문을 리로드한다(저장 후
  // journal 갱신에는 반응하지 않아 "저장되었습니다"가 유지된다).
  useEffect(() => {
    if (!journal) return;
    if (loadedDate.current !== date) {
      loadedDate.current = date;
      setBody(journal[date]?.body ?? "");
      setSaved(false);
    }
    setLoaded(true);
  }, [journal, date]);

  const readings = (store?.readings ?? []).filter((r) => r.localDate === date);
  const isToday = date === todayIso;
  const canGoNext = todayIso !== null && date < todayIso;
  const savedAt = journal?.[date]?.updatedAt;

  const save = () => {
    setEntry(date, body);
    setSaved(true);
  };

  const dayNav =
    "flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-line-gold hover:text-cream active:scale-95";

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

      <motion.main
        key={date}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto w-full max-w-[680px] flex-1 px-5 pb-10 pt-1 lg:px-12 lg:pb-[88px] lg:pt-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2.5">
            <h1 className="font-display text-[24px] font-semibold lg:text-[32px]">
              {Number(date.split("-")[1])}월 {Number(date.split("-")[2])}일
            </h1>
            <span className="text-[15px] text-muted lg:text-[17px]">
              {weekdayOf(date)}요일
            </span>
            {isToday ? (
              <span className="rounded-full border border-line-gold px-2 py-0.5 text-[11px] text-gold-soft">
                오늘
              </span>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Link href={`/my/journal/${addDays(date, -1)}`} aria-label="이전 날" className={dayNav}>
              <CaretLeft size={16} aria-hidden />
            </Link>
            {canGoNext ? (
              <Link href={`/my/journal/${addDays(date, 1)}`} aria-label="다음 날" className={dayNav}>
                <CaretRight size={16} aria-hidden />
              </Link>
            ) : (
              <span className={`${dayNav} opacity-30`} aria-hidden>
                <CaretRight size={16} />
              </span>
            )}
          </div>
        </div>

        {readings.length > 0 ? (
          <div className="mt-6 flex flex-col gap-2.5">
            {readings.map((r) => (
              <Link
                key={r.id}
                href={`/reading/${r.id}`}
                className="flex items-center gap-4 rounded-2xl border border-line bg-ink-1 p-4 transition-colors hover:border-line-gold lg:rounded-[14px]"
              >
                <span className="flex flex-none gap-1.5">
                  {r.cards.map((slug) => {
                    const card = cardBySlug.get(slug);
                    if (!card) return null;
                    return (
                      <span
                        key={slug}
                        className="relative aspect-[2/3.4] w-9 overflow-hidden rounded-md bg-ink-2 lg:w-11"
                      >
                        <CardArt card={card} deckId={r.deckId} sizes="44px" />
                      </span>
                    );
                  })}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] text-gold-soft lg:text-[13px]">
                    {readingTypeLabel(r)}
                  </span>
                  <span className="mt-0.5 block truncate text-[13.5px] text-body lg:text-[15px]">
                    {r.cards
                      .map((slug) => koCards[slug]?.nameKo ?? slug)
                      .join(" · ")}
                  </span>
                </span>
                <CaretRight size={16} className="flex-none text-muted" aria-hidden />
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-2xl border border-dashed border-line px-5 py-6 text-center text-[13.5px] text-muted lg:rounded-[14px]">
            이날의 리딩은 없어요. 그날의 마음만 남겨도 좋아요.
          </p>
        )}

        <div className="mt-7 lg:mt-9">
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="journal-body"
              className="text-[13px] text-gold-soft lg:text-[14px]"
            >
              그날의 일기
            </label>
            {savedAt ? (
              <span className="text-[11.5px] text-muted">
                저장됨 · {savedAt.slice(0, 10)}
              </span>
            ) : null}
          </div>
          <textarea
            id="journal-body"
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setSaved(false);
            }}
            placeholder="오늘 마음에 남은 것을 적어 보세요."
            rows={8}
            className="mt-2 w-full resize-y rounded-2xl border border-line bg-ink-1 p-4 font-serif text-[15px] leading-[1.75] text-body outline-none transition-colors focus:border-line-gold lg:rounded-[14px]"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={!loaded}
              className="btn btn-gold active:scale-[0.98] disabled:opacity-50"
            >
              저장
            </button>
            {saved ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[13px] text-gold-soft"
              >
                저장되었습니다
              </motion.span>
            ) : null}
          </div>
        </div>
      </motion.main>
    </div>
  );
}
