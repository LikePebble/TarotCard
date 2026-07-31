"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { DayReadingTabs } from "@/components/DayReadingTabs";
import { DesktopNav, MobileTopBar } from "@/components/SiteNav";
import { entryOf, setEntry, useJournal } from "@/lib/journal";
import { localDateOf } from "@/lib/period";
import { useArcanaStore } from "@/lib/store";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function addDays(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return localDateOf(new Date(y, m - 1, d + delta));
}
function weekdayOf(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return WEEKDAYS[new Date(y, m - 1, d).getDay()];
}

export default function JournalDayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const { date } = use(params);
  const { store } = useArcanaStore();
  const { store: journal } = useJournal();

  // todayIso는 클라이언트에서만 계산한다(SSR과 타임존이 달라 하이드레이션 불일치가 나지 않게).
  const [todayIso, setTodayIso] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
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
      setBody(entryOf(journal, date)?.body ?? "");
      setSaved(false);
      setConfirmingCancel(false);
    }
    setLoaded(true);
  }, [journal, date]);

  const readings = (store?.readings ?? []).filter((r) => r.localDate === date);
  const isToday = date === todayIso;
  const canGoNext = todayIso !== null && date < todayIso;
  // 지운 날은 "저장됨" 시각을 보여주지 않는다.
  const savedAt = journal ? entryOf(journal, date)?.updatedAt : undefined;

  // 마지막으로 저장된 본문. 취소는 이 값으로 되돌린다.
  const savedBody = journal ? (entryOf(journal, date)?.body ?? "") : "";
  const dirty = loaded && body !== savedBody;

  const save = () => {
    setEntry(date, body);
    setSaved(true);
  };

  /**
   * 취소: 지금 쓴 것을 버리고 이 화면을 떠난다.
   *
   * 본문을 되돌린 뒤 나가는 것이 아니라 그냥 나간다 — 저장하지 않았으므로
   * 고친 내용은 애초에 어디에도 남지 않는다. 되돌리는 동작을 한 번 더 하면
   * 떠나는 화면이 잠깐 깜빡일 뿐이다.
   *
   * 돌아갈 곳은 브라우저 히스토리다. 이 화면은 일별 기록에서도, 리딩 결과의
   * "이날의 일기 쓰기"에서도 들어온다 — 어느 쪽으로 왔든 그리로 돌려보낸다.
   * 주소로 곧장 열어 히스토리가 없을 때만 일별 기록으로 보낸다.
   */
  const leave = () => {
    setConfirmingCancel(false);
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/my/journal");
  };

  // 쓴 것이 있을 때만 묻는다. 버릴 것이 없으면 묻는 일 자체가 군더더기다.
  const cancel = () => {
    if (dirty) {
      setConfirmingCancel(true);
      return;
    }
    leave();
  };

  const dayNav =
    "flex h-11 w-11 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-line-gold hover:text-cream active:scale-95 motion-reduce:transform-none";

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
        initial={reducedMotion ? false : { opacity: 0, y: 10 }}
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
          // 날짜가 바뀌면 탭 선택도 새 날짜 기준으로 다시 잡히도록 key를 준다
          // (App Router는 param만 바뀔 때 이 페이지를 리마운트하지 않는다).
          <DayReadingTabs key={date} readings={readings} />
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
              setConfirmingCancel(false);
            }}
            placeholder="오늘 마음에 남은 것을 적어 보세요."
            rows={8}
            className="mt-2 w-full resize-y rounded-2xl border border-line bg-ink-1 p-4 font-serif text-[15px] leading-[1.75] text-body transition-colors focus-visible:border-line-gold lg:rounded-[14px]"
          />
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            {confirmingCancel ? (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap items-center gap-x-3 gap-y-2"
                role="alertdialog"
                aria-label="취소 확인"
              >
                <span className="text-[13px] text-body">
                  쓴 내용을 저장하지 않고 나갈까요?
                </span>
                <button
                  type="button"
                  onClick={leave}
                  autoFocus
                  className="min-h-11 px-1 text-[13px] font-medium text-notice underline underline-offset-4"
                >
                  버리고 나가기
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingCancel(false)}
                  className="min-h-11 px-1 text-[13px] text-muted underline underline-offset-4 transition-colors hover:text-cream"
                >
                  계속 쓰기
                </button>
              </motion.div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={save}
                  disabled={!loaded}
                  className="btn btn-gold active:scale-[0.98] disabled:opacity-50"
                >
                  저장
                </button>
                {/* 나가는 길이므로 늘 보인다 — 고친 게 있든 없든 떠날 수는 있어야
                    하고, 있는 줄 몰라 못 찾는 편이 잘못 누르는 것보다 나쁘다.
                    알약(.btn) 대신 텍스트 버튼으로 둬서 저장과 무게를 구분한다. */}
                <button
                  type="button"
                  onClick={cancel}
                  className="min-h-11 px-1 text-[13px] text-muted underline underline-offset-4 transition-colors hover:text-cream"
                >
                  취소
                </button>
                {saved ? (
                  <motion.span
                    initial={reducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[13px] text-gold-soft"
                  >
                    저장되었습니다
                  </motion.span>
                ) : null}
              </>
            )}
          </div>
        </div>
      </motion.main>
    </div>
  );
}
