"use client";

import { Fragment, useRef, useState } from "react";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import { CardArt } from "@/components/CardArt";
import { cardBySlug } from "@/data/cards";
import { koCards } from "@/data/ko";
import {
  activeReadingIndex,
  orderedDayReadings,
  readingTabLabels,
  readingTypeLabel,
} from "@/lib/day-readings";
import type { ReadingRecord } from "@/lib/store";

/**
 * 그날의 리딩을 탭으로 전환해 일기 화면 안에서 훑는다. 자세히 보려면 카드를
 * 눌러 /reading/{id}로 들어간다. 탭 상태는 로컬 state로만 둔다 — 일기 화면의
 * 탭 위치까지 주소에 남길 이유가 없다.
 */
export function DayReadingTabs({ readings }: { readings: ReadingRecord[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const ordered = orderedDayReadings(readings);
  const index = activeReadingIndex(ordered.readings, selectedId);
  const active = ordered.readings[index];
  if (!active) return null;

  // 탭 하나짜리 탭바는 군더더기다 — 리딩이 2개 이상일 때만 탭을 둔다.
  const tabbed = ordered.readings.length > 1;
  const labels = readingTabLabels(ordered.readings);
  const panelId = "journal-reading-panel";

  const moveTab = (next: number) => {
    const i = (next + ordered.readings.length) % ordered.readings.length;
    setSelectedId(ordered.readings[i].id);
    tabRefs.current[i]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      moveTab(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      moveTab(index - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      moveTab(0);
    } else if (e.key === "End") {
      e.preventDefault();
      moveTab(ordered.readings.length - 1);
    }
  };

  return (
    <div className="mt-6">
      {tabbed ? (
        <div
          role="tablist"
          aria-label="이날의 리딩"
          onKeyDown={onKeyDown}
          className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0"
        >
          {ordered.readings.map((r, i) => (
            <Fragment key={r.id}>
              {/* 그룹 경계. bg-line은 칩 테두리와 같은 색이라 경계로 읽히지 않는다 —
                  금선을 쓰고 위아래를 들여 칩 테두리와 구분되게 한다. */}
              {i === ordered.oneCardCount && i > 0 ? (
                <span
                  aria-hidden
                  className="mx-1.5 my-2 w-px flex-none self-stretch bg-line-gold"
                />
              ) : null}
              <button
                type="button"
                role="tab"
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                id={`journal-reading-tab-${r.id}`}
                aria-selected={i === index}
                aria-controls={panelId}
                tabIndex={i === index ? 0 : -1}
                onClick={() => setSelectedId(r.id)}
                className={`inline-flex min-h-11 flex-none items-center justify-center whitespace-nowrap rounded-full border px-4 text-[13px] transition-colors lg:text-[14px] ${
                  i === index
                    ? "border-gold bg-ink-2 font-medium text-gold-soft"
                    : "border-line text-muted hover:text-cream"
                }`}
              >
                {labels[i]}
              </button>
            </Fragment>
          ))}
        </div>
      ) : null}

      {/* 패널 안이 링크 하나라 tabIndex는 두지 않는다(탭 스톱만 늘어난다). */}
      <div
        role={tabbed ? "tabpanel" : undefined}
        id={tabbed ? panelId : undefined}
        aria-labelledby={tabbed ? `journal-reading-tab-${active.id}` : undefined}
        className={tabbed ? "mt-2.5" : undefined}
      >
        <Link
          href={`/reading/${active.id}`}
          className="flex items-center gap-4 rounded-2xl border border-line bg-ink-1 p-4 transition-colors hover:border-line-gold lg:rounded-[14px]"
        >
          <span className="flex flex-none gap-1.5">
            {active.cards.map((slug) => {
              const card = cardBySlug.get(slug);
              if (!card) return null;
              return (
                <span
                  key={slug}
                  className="relative aspect-[2/3.4] w-9 overflow-hidden rounded-md bg-ink-2 lg:w-11"
                >
                  <CardArt card={card} deckId={active.deckId} sizes="44px" />
                </span>
              );
            })}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12px] text-gold-soft lg:text-[13px]">
              {readingTypeLabel(active.spread)}
            </span>
            <span className="mt-0.5 block truncate text-[13.5px] text-body lg:text-[15px]">
              {active.cards
                .map((slug) => koCards[slug]?.nameKo ?? slug)
                .join(" · ")}
            </span>
          </span>
          <CaretRight size={16} className="flex-none text-muted" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
