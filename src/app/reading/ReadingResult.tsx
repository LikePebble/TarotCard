"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { CardArt } from "@/components/CardArt";
import { CardArtViewer } from "@/components/CardArtViewer";
import { type Card } from "@/data/cards";
import { focusLabelOf, focusParagraphOf } from "@/data/focus";
import { koCards } from "@/data/ko";
import { koPositions } from "@/data/ko-positions";
import { ResultActions } from "./ResultActions";

const POSITIONS = ["과거", "현재", "미래"] as const;
const POSITION_KEYS = ["past", "present", "future"] as const;

// 스와이프를 "탭"과 구분하는 임계값(px). 10을 넘으면 뷰어가 열리지 않도록
// 다음 click을 억제하고, 50을 넘으면 실제로 포지션을 전환한다.
const CLICK_SUPPRESS_PX = 10;
const SWIPE_PX = 50;

function nameKoOf(card: Card): string {
  return koCards[card.slug]?.nameKo ?? card.nameEn;
}

function descriptionOf(card: Card): string[] {
  const ko = koCards[card.slug]?.description;
  return (ko && ko.length > 0 ? ko : card.en.description).split("\n\n");
}

/**
 * 오늘의 카드 결과. 갓 뽑은 리빌(draw)과 재열람(/reading/[id])이 공유한다.
 * collectionCount가 주어지면 "컬렉션에 추가되었습니다" 배너를 보여준다(신규 리빌).
 * localDate가 있으면 그날 일기 링크를 액션에 포함한다.
 */
export function OneCardResult({
  card,
  deckId,
  focus,
  collectionCount,
  reducedMotion,
  localDate,
}: {
  card: Card;
  deckId: string;
  focus: string;
  collectionCount?: number | null;
  reducedMotion: boolean;
  localDate: string | null;
}) {
  const paragraphs = descriptionOf(card);
  const themeParagraph = focusParagraphOf(focus, card.slug);
  return (
    <motion.main
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-[1280px] flex-1 px-6 pb-8 pt-1 lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-[72px] lg:px-[72px] lg:py-20"
    >
      <div className="flex justify-center lg:justify-end">
        <CardArtViewer
          card={card}
          deckOverride={deckId}
          triggerClassName="relative block aspect-[2/3.4] w-[248px] cursor-zoom-in overflow-hidden rounded-xl bg-ink-2 shadow-[0_24px_60px_rgba(8,5,0,0.65)] lg:w-full lg:max-w-[400px] lg:rounded-[14px]"
          sizes="(min-width: 1024px) 400px, 248px"
        />
      </div>
      <div>
        <p className="mt-[22px] text-center text-[13px] text-muted lg:mt-0 lg:text-left lg:text-[14px]">
          오늘의 카드 ·{" "}
          <b className="font-medium text-gold">{focusLabelOf(focus)}</b>
        </p>
        <h1 className="mt-1 text-center font-display text-[30px] font-semibold lg:text-left lg:text-[44px]">
          {nameKoOf(card)}{" "}
          <span className="ml-1 text-base font-normal text-muted lg:text-[22px]">
            {card.nameEn}
          </span>
        </h1>
        <div className="mt-4 space-y-3 font-serif text-[15px] text-body lg:mt-6 lg:max-w-[520px] lg:text-base">
          {paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
        {themeParagraph ? (
          <div className="mt-5 border-t border-line pt-4 lg:max-w-[520px]">
            <p className="text-[12.5px] text-gold lg:text-[13.5px]">
              {focusLabelOf(focus)}
            </p>
            <p className="mt-1.5 font-serif text-[15px] text-body lg:text-base">
              {themeParagraph}
            </p>
          </div>
        ) : null}
        {collectionCount !== undefined ? (
          <div className="mt-5 flex items-baseline justify-between rounded-[14px] border border-line-gold px-[18px] py-3.5 text-[13.5px] lg:mt-8 lg:inline-flex lg:gap-3.5 lg:text-[14.5px]">
            <span>컬렉션에 추가되었습니다</span>
            <b className="font-display text-[15px] font-semibold text-gold-soft">
              {collectionCount ?? "-"} / 78
            </b>
          </div>
        ) : null}
        <div className="mt-5 flex flex-col gap-2.5 lg:mt-8 lg:flex-row lg:gap-3.5">
          <ResultActions deckId={deckId} slug={card.slug} localDate={localDate} />
        </div>
      </div>
    </motion.main>
  );
}

// 해석 전환 진입 애니메이션. direction(+1: 다음, -1: 이전)에 따라 들어오는
// 방향이 갈린다.
//
// 계획서(Task 2e)는 AnimatePresence mode="wait"로 나가는 해석과 들어오는
// 해석을 함께 슬라이드시키라고 했다. 이 화면에 붙였을 때 exit가 끝나지
// 않아 새 해석이 이전 내용에 가려지거나(mode="wait") 이전 해석들이 DOM에
// 쌓였다(mode 없음).
//
// **원인은 라이브러리가 아니다.** motion 12.42.2 + React 19.2를 격리 재현에
// 올려 sync/wait/popLayout × StrictMode 12가지를 돌린 결과 onExitComplete가
// 매번 정상 발화하고 노드도 언마운트됐다. 원인은 이 화면 쪽 통합에 있고
// 아직 특정하지 못했다 — 다시 시도할 사람은 라이브러리 버전을 의심하는
// 데서 시작하지 말 것.
//
// 지금은 AnimatePresence 없이 key={index}로 교체하고 들어오는 쪽만
// 슬라이드시킨다. 나가는 슬라이드는 포기한 상태다.
function panelInitial(direction: number) {
  return { opacity: 0, x: direction > 0 ? 24 : -24 };
}

/**
 * 과거·현재·미래 결과. 갓 뽑은 리빌(draw)과 재열람(/reading/[id])이 공유한다.
 * 한 번에 한 포지션만 보여준다 — 탭 · 작은 카드 줄 · 큰 카드 스와이프
 * 세 경로가 모두 같은 선택 인덱스를 움직인다.
 */
export function ThreeCardResult({
  picked,
  deckId,
  focus,
  collectionCount,
  reducedMotion,
  localDate,
}: {
  picked: Card[];
  deckId: string;
  focus: string;
  collectionCount?: number | null;
  reducedMotion: boolean;
  localDate: string | null;
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // 양 끝에서 순환하지 않는다 — 시간 축이므로 미래→과거로 감기면 방향
  // 감각이 깨진다.
  const goTo = (next: number) => {
    if (next < 0 || next > 2 || next === index) return;
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  };

  const onTabsKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(index - 1);
    }
  };

  // 스와이프 vs 전체화면 뷰어 탭 판정. framer의 drag는 click을 막아 주지
  // 않으므로 포인터 이벤트로 직접 판정한다.
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickRef = useRef(false);

  const onCardPointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const onCardPointerUp = (e: React.PointerEvent) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    // 가로 이동이 세로보다 클 때만 스와이프로 본다 — 세로 스크롤을 막지 않는다.
    if (Math.abs(dx) <= Math.abs(dy)) return;
    if (Math.abs(dx) > CLICK_SUPPRESS_PX) {
      suppressClickRef.current = true;
    }
    if (Math.abs(dx) >= SWIPE_PX) {
      goTo(dx < 0 ? index + 1 : index - 1);
    }
  };

  // 억제 플래그가 서 있으면 뷰어를 여는 click을 캡처 단계에서 끊는다.
  const onCardClickCapture = (e: React.MouseEvent) => {
    if (suppressClickRef.current) {
      e.stopPropagation();
      e.preventDefault();
      suppressClickRef.current = false;
    }
  };

  const selected = picked[index];
  const positionSentence = koPositions[selected.slug]?.[POSITION_KEYS[index]];
  const themeParagraph = focusParagraphOf(focus, selected.slug);

  return (
    <motion.main
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-[760px] flex-1 px-6 pb-8 pt-1 lg:pb-24 lg:pt-14"
    >
      <p className="text-center text-[13px] text-muted lg:text-[14px]">
        과거 · 현재 · 미래{" "}
        <b className="font-medium text-gold">{focusLabelOf(focus)}</b>
      </p>

      {/* 탭 */}
      <div
        role="tablist"
        aria-label="포지션 선택"
        onKeyDown={onTabsKeyDown}
        className="mx-auto mt-5 flex max-w-[340px] justify-center gap-2 lg:mt-7"
      >
        {POSITIONS.map((label, i) => (
          <button
            key={label}
            type="button"
            role="tab"
            id={`three-card-tab-${i}`}
            aria-selected={i === index}
            aria-controls="three-card-panel"
            tabIndex={i === index ? 0 : -1}
            onClick={() => goTo(i)}
            className={`flex-1 rounded-full border px-3 py-1.5 text-[13px] transition-colors lg:text-[14px] ${
              i === index
                ? "border-gold text-gold"
                : "border-line text-muted hover:text-cream"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 큰 카드: 눌러서 전체화면, 옆으로 끌어서 포지션 전환 */}
      <div className="mt-5 flex justify-center lg:mt-7">
        <div
          className="relative"
          onPointerDown={onCardPointerDown}
          onPointerUp={onCardPointerUp}
          onClickCapture={onCardClickCapture}
        >
          <CardArtViewer
            card={selected}
            deckOverride={deckId}
            triggerClassName="relative block aspect-[2/3.4] w-[248px] cursor-zoom-in overflow-hidden rounded-xl bg-ink-2 shadow-[0_24px_60px_rgba(8,5,0,0.65)] lg:w-[340px] lg:rounded-[14px]"
            sizes="(min-width: 1024px) 340px, 248px"
            priority={index === 0}
          />
        </div>
      </div>

      {/* 작은 카드 줄: 세 장을 순서 그대로 전부 둔다(선택된 것도 빼지 않음) —
          두 장만 남기면 선택할 때마다 줄이 재배치돼 과거→미래 축이 깨진다. */}
      <div className="mx-auto mt-4 flex max-w-[340px] justify-center gap-3 lg:mt-6 lg:gap-4">
        {picked.map((card, i) => (
          <button
            key={card.slug}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`${POSITIONS[i]} 카드로 이동`}
            className="flex flex-col items-center gap-1.5"
          >
            <span
              className={`block aspect-[2/3.4] w-16 overflow-hidden rounded-lg border-2 lg:w-[88px] ${
                i === index ? "border-gold" : "border-transparent"
              }`}
            >
              <CardArt
                card={card}
                deckId={deckId}
                sizes="(min-width: 1024px) 88px, 64px"
              />
            </span>
            <span
              className={`text-[11px] lg:text-[12px] ${
                i === index ? "text-gold" : "text-muted"
              }`}
            >
              {POSITIONS[i]}
            </span>
          </button>
        ))}
      </div>

      {/* 해석: 선택된 포지션의 문장·설명·포커스 해석만 보여준다 */}
      <div
        role="tabpanel"
        id="three-card-panel"
        aria-labelledby={`three-card-tab-${index}`}
        className="mt-8 overflow-hidden lg:mt-12"
      >
        <motion.div
          key={index}
          initial={reducedMotion ? false : panelInitial(direction)}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.28 }}
        >
          <p className="text-[12.5px] tracking-[0.04em] text-gold lg:text-[13.5px]">
            {POSITIONS[index]}
          </p>
          <h2 className="mt-1 font-display text-[22px] font-semibold leading-tight lg:text-[26px]">
            {nameKoOf(selected)}
            <span className="mt-0.5 block text-[13px] font-normal text-muted lg:text-[15px]">
              {selected.nameEn}
            </span>
          </h2>
          {positionSentence ? (
            <p className="mt-3 text-[15px] leading-[1.6] text-cream lg:text-[17px]">
              {positionSentence}
            </p>
          ) : null}
          <div className="mt-3 space-y-2.5 font-serif text-[14.5px] leading-[1.7] text-body lg:text-[15.5px]">
            {descriptionOf(selected).map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
          {themeParagraph ? (
            <div className="mt-3.5 border-t border-line pt-3">
              <p className="text-[12.5px] text-gold lg:text-[13.5px]">
                {focusLabelOf(focus)}
              </p>
              <p className="mt-1 font-serif text-[14px] leading-[1.7] text-body lg:text-[15px]">
                {themeParagraph}
              </p>
            </div>
          ) : null}
        </motion.div>
      </div>
      {collectionCount !== undefined ? (
        <div className="mt-6 flex items-baseline justify-between rounded-[14px] border border-line-gold px-[18px] py-3.5 text-[13.5px] lg:text-[14.5px]">
          <span>3장이 컬렉션에 추가되었습니다</span>
          <b className="font-display text-[15px] font-semibold text-gold-soft">
            {collectionCount ?? "-"} / 78
          </b>
        </div>
      ) : null}
      <div className="mt-5 flex flex-col gap-2.5 lg:flex-row lg:justify-center lg:gap-3.5">
        <ResultActions deckId={deckId} slug={selected.slug} localDate={localDate} />
      </div>
    </motion.main>
  );
}
