"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { entryOf, setEntry, useJournal } from "@/lib/journal";

/**
 * 리딩 결과 아래에서 그날 일기를 **바로** 받는 입력란.
 *
 * 왜 별도 화면으로 보내지 않는가: 리딩 34건에 일기 2건이었다. 결과를 본 순간이
 * 쓸 말이 가장 많은 순간인데, 그때 화면을 옮기게 하면 대부분 옮기지 않는다.
 * 링크(`JournalLink`)는 "이미 쓴 글을 보러 가는" 용도로 남기고, 처음 한 줄은
 * 여기서 받는다.
 *
 * 이미 쓴 날에는 입력란을 펴지 않는다. 결과를 다시 열 때마다 빈 칸이 따라오면
 * 재열람이 숙제처럼 느껴진다 — 그때는 쓴 글을 보여 주고 고치러 갈 길만 준다.
 */
export function JournalQuickNote({ localDate }: { localDate: string }) {
  const { store: journal } = useJournal();
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement | null>(null);

  // 저장 뒤 journal이 갱신되며 이 컴포넌트가 "이미 쓴 날" 가지로 넘어간다.
  // 그 전환이 곧 확인 신호라 별도 토스트를 두지 않는다.
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2400);
    return () => clearTimeout(t);
  }, [saved]);

  // 로드 전에는 아무것도 그리지 않는다. 빈 입력란이 먼저 떴다가 "이미 쓴 글"로
  // 바뀌면 방금 쓰려던 사람의 손을 끊는다(JournalLink와 같은 규칙).
  if (journal === null) return null;

  const existing = entryOf(journal, localDate);

  if (existing) {
    return (
      <section className="mt-5 rounded-2xl border border-line bg-ink-1 p-5 lg:rounded-[14px]">
        <h2 className="font-display text-[15px] font-semibold lg:text-[16px]">
          이날의 일기
        </h2>
        <p className="mt-2 whitespace-pre-wrap font-serif text-[14.5px] leading-[1.8] text-body lg:text-[15px]">
          {existing.body}
        </p>
        <Link
          href={`/my/journal/${localDate}`}
          className="mt-3 inline-flex min-h-11 items-center text-[13.5px] text-muted underline underline-offset-4 hover:text-cream"
        >
          이어서 고치기
        </Link>
      </section>
    );
  }

  const save = () => {
    if (draft.trim() === "") return;
    setEntry(localDate, draft);
    setSaved(true);
  };

  return (
    <section className="mt-5 rounded-2xl border border-line bg-ink-1 p-5 lg:rounded-[14px]">
      <h2 className="font-display text-[15px] font-semibold lg:text-[16px]">
        오늘 떠오른 것을 한 줄 남겨 보세요
      </h2>
      <p className="mt-1 text-[12.5px] text-muted lg:text-[13px]">
        나중에 이 카드를 다시 만났을 때, 오늘 무엇을 생각했는지 함께 보입니다.
      </p>
      <textarea
        ref={areaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={3}
        placeholder="한 줄이어도 좋습니다"
        aria-label="이날의 일기"
        className="mt-3 w-full resize-y rounded-xl border border-line bg-ink-0 p-3.5 font-serif text-[14.5px] leading-[1.8] text-body outline-none placeholder:text-muted focus-visible:border-line-gold lg:text-[15px]"
      />
      <div className="mt-2.5 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={draft.trim() === ""}
          className="btn btn-ghost disabled:cursor-not-allowed disabled:opacity-40"
        >
          저장하기
        </button>
        <span aria-live="polite" className="text-[12.5px] text-muted">
          {saved ? "저장되었습니다" : ""}
        </span>
      </div>
    </section>
  );
}
