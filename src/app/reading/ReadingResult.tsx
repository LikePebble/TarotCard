"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { CaretDown } from "@phosphor-icons/react";
import { CardArtViewer } from "@/components/CardArtViewer";
import { type Card } from "@/data/cards";
import { focusLabelOf, focusParagraphOf } from "@/data/focus";
import { koCards } from "@/data/ko";
import { koPositions } from "@/data/ko-positions";
import { reversedCards } from "@/data/reversed";
import { reversedFocusParagraphOf } from "@/data/reversed-focus";
import { reversedPositions } from "@/data/reversed-positions";
import type { Orientation } from "@/lib/store";
import { ResultActions } from "./ResultActions";

const POSITIONS = ["과거", "현재", "미래"] as const;
const POSITION_KEYS = ["past", "present", "future"] as const;

// 카드별 역방향 해석문이 없을 때의 최후 폴백. 78장 모두 reversed.ts에 있으므로
// 평소에는 쓰이지 않는다 — 새 카드가 추가됐는데 해석문이 아직 없을 때를 위한 그물.
const REVERSED_FALLBACK =
  "역방향으로 나온 카드는 본래 의미의 기운이 약해지거나 안으로 향해 있음을 뜻합니다. 위 해석을 바탕으로, 그 흐름이 지연되거나 억눌린 상태라는 관점에서 읽어 보세요.";

/** 역방향 해석문 문단들. 정방향 해석과 같이 빈 줄로 나뉜다. */
function reversedParagraphs(card: Card): string[] {
  const ko = reversedCards[card.slug]?.ko;
  return (ko && ko.length > 0 ? ko : REVERSED_FALLBACK).split("\n\n");
}

function nameKoOf(card: Card): string {
  return koCards[card.slug]?.nameKo ?? card.nameEn;
}

function descriptionOf(card: Card): string[] {
  const ko = koCards[card.slug]?.description;
  return (ko && ko.length > 0 ? ko : card.en.description).split("\n\n");
}

/**
 * 역방향일 때 정방향 본문·테마(·포지션 문장)를 접어 담는 토글.
 * 정방향 텍스트는 "결실이 무르익는다"처럼 결과를 단언하는 경우가 많아,
 * 역방향 해석 옆에 그대로 펼쳐두면 정반대 톤이 한 화면에서 부딪힌다(78장 중
 * 절반 이상이 그렇다). 역방향을 주연으로 올리고 정방향은 여기 접어, 궁금한
 * 사람만 "본래의 의미"로 펼쳐 보게 한다. 기본은 접힘.
 */
function UprightDetails({ children }: { children: ReactNode }) {
  return (
    <details className="group mt-5 border-t border-line pt-3 lg:max-w-[520px]">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1.5 text-[12.5px] text-muted hover:text-cream lg:text-[13.5px]">
        카드 본래의 의미
        <CaretDown
          size={13}
          weight="bold"
          className="transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="mt-1">{children}</div>
    </details>
  );
}

/** 아트가 왜 뒤집혔는지 알리는 소형 배지. 카드명 옆에 붙는다. */
function ReversedBadge() {
  return (
    <span className="ml-2 inline-block rounded-full border border-gold px-2 py-[3px] align-middle text-[11px] font-medium leading-none text-gold lg:text-[12px]">
      역방향
    </span>
  );
}

/** 오늘의 카드 결과. 갓 뽑은 리빌(draw)과 재열람(/reading/[id])이 공유한다. */
export function OneCardResult({
  card,
  deckId,
  focus,
  orientations,
  reducedMotion,
  localDate,
}: {
  card: Card;
  deckId: string;
  focus: string;
  orientations?: Orientation[];
  reducedMotion: boolean;
  localDate: string | null;
}) {
  const paragraphs = descriptionOf(card);
  const themeParagraph = focusParagraphOf(focus, card.slug);
  // 레거시·마이그레이션 기록에는 orientations가 없거나 짧을 수 있다 — 정방향으로 본다.
  const orientation: Orientation = orientations?.[0] ?? "upright";
  const reversed = orientation === "reversed";
  const reversedTheme = reversed
    ? reversedFocusParagraphOf(focus, card.slug)
    : null;

  // 정방향 본문 + 테마. 정방향 카드면 그대로 보이고, 역방향이면 토글에 접힌다.
  const uprightContent = (
    <>
      <div className="space-y-3 font-serif text-[15px] text-body lg:max-w-[520px] lg:text-base">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>
      {/* 테마 라벨은 머리말이 담당한다. 여기는 테마별 해석문이 있을 때만. */}
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
    </>
  );

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
          orientation={orientation}
          triggerClassName="relative block aspect-[2/3.4] w-[248px] cursor-zoom-in overflow-hidden rounded-xl bg-ink-2 shadow-[0_24px_60px_rgba(8,5,0,0.65)] lg:w-full lg:max-w-[400px] lg:rounded-[14px]"
          sizes="(min-width: 1024px) 400px, 248px"
        />
      </div>
      <div>
        {/* 테마는 리딩 유형 바로 아래 자기 줄에 둔다. */}
        <p className="mt-[22px] text-center text-[13px] text-muted lg:mt-0 lg:text-left lg:text-[14px]">
          오늘의 카드
          <b className="mt-0.5 block font-medium text-gold">
            {focusLabelOf(focus)}
          </b>
        </p>
        <h1 className="mt-1 text-center font-display text-[30px] font-semibold lg:text-left lg:text-[44px]">
          {nameKoOf(card)}{" "}
          <span className="ml-1 text-base font-normal text-muted lg:text-[22px]">
            {card.nameEn}
          </span>
          {reversed ? <ReversedBadge /> : null}
        </h1>
        {/* 역방향이면 역방향 해석을 주연으로 올리고 정방향은 토글에 접는다.
            정방향이면 정방향 본문이 그대로 주연이다. */}
        <div className="mt-4 lg:mt-6">
          {reversed ? (
            <>
              <div className="space-y-3 font-serif text-[15px] text-body lg:max-w-[520px] lg:text-base">
                {reversedParagraphs(card).map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
              {/* 역방향 전용 테마 해석 — 정방향의 테마 블록과 같은 자리. */}
              {reversedTheme ? (
                <div className="mt-5 border-t border-line pt-4 lg:max-w-[520px]">
                  <p className="text-[12.5px] text-gold lg:text-[13.5px]">
                    {focusLabelOf(focus)}
                  </p>
                  <p className="mt-1.5 font-serif text-[15px] text-body lg:text-base">
                    {reversedTheme}
                  </p>
                </div>
              ) : null}
              <UprightDetails>{uprightContent}</UprightDetails>
            </>
          ) : (
            uprightContent
          )}
        </div>
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
 * 한 번에 한 포지션만 보여준다 — 전환 경로는 탭(←/→ 키 포함) 하나다.
 */
export function ThreeCardResult({
  picked,
  deckId,
  focus,
  orientations,
  reducedMotion,
  localDate,
}: {
  picked: Card[];
  deckId: string;
  focus: string;
  orientations?: Orientation[];
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

  // roving tabindex: 선택이 바뀌면 이전 탭은 tabIndex -1이 되므로 포커스도
  // 같이 옮겨야 한다. 안 그러면 스크린리더가 읽는 위치와 열린 패널이 어긋난다.
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const moveTab = (next: number) => {
    if (next < 0 || next > 2) return;
    goTo(next);
    tabRefs.current[next]?.focus();
  };

  const onTabsKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      moveTab(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      moveTab(index - 1);
    }
  };

  const selected = picked[index];
  // 레거시·마이그레이션 기록에는 orientations가 없거나 짧을 수 있다 — 정방향으로 본다.
  const orientation: Orientation = orientations?.[index] ?? "upright";
  const reversed = orientation === "reversed";
  const positionSentence = koPositions[selected.slug]?.[POSITION_KEYS[index]];
  const themeParagraph = focusParagraphOf(focus, selected.slug);
  const reversedPositionSentence = reversed
    ? reversedPositions[selected.slug]?.[POSITION_KEYS[index]]
    : null;
  const reversedTheme = reversed
    ? reversedFocusParagraphOf(focus, selected.slug)
    : null;

  // 3카드 위계: 포지션 문단(시점 어법)이 주연, 테마는 "지금 건네는 말"로 프레임,
  // 무시점 정본은 접힘으로 내린다. 근거: docs/research/2026-07-25-position-based-interpretation.md
  const uprightContent = (
    <>
      {positionSentence ? (
        <p className="text-[15px] leading-[1.7] text-cream lg:text-[17px]">
          {positionSentence}
        </p>
      ) : null}
      {themeParagraph ? (
        <div className="mt-3.5 border-t border-line pt-3">
          <p className="text-[12.5px] text-gold lg:text-[13.5px]">
            이 카드가 지금 {focusLabelOf(focus)}에 건네는 말
          </p>
          <p className="mt-1 font-serif text-[14px] leading-[1.7] text-body lg:text-[15px]">
            {themeParagraph}
          </p>
        </div>
      ) : null}
      <details className="mt-2.5">
        <summary className="inline-block min-h-11 cursor-pointer pt-1.5 text-[13.5px] text-muted underline underline-offset-4 hover:text-cream">
          카드 자체의 의미 보기
        </summary>
        <div className="mt-1 space-y-2.5 font-serif text-[14.5px] leading-[1.7] text-body lg:text-[15.5px]">
          {descriptionOf(selected).map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
      </details>
    </>
  );

  return (
    <motion.main
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-[760px] flex-1 px-6 pb-8 pt-1 lg:pb-24 lg:pt-14"
    >
      {/* 테마는 리딩 유형 바로 아래 자기 줄에 둔다. */}
      <p className="text-center text-[13px] text-muted lg:text-[14px]">
        과거 · 현재 · 미래
        <b className="mt-0.5 block font-medium text-gold">
          {focusLabelOf(focus)}
        </b>
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
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
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

      {/* 큰 카드: 눌러서 전체화면 */}
      <div className="mt-5 flex justify-center lg:mt-7">
        <CardArtViewer
          card={selected}
          deckOverride={deckId}
          orientation={orientation}
          triggerClassName="relative block aspect-[2/3.4] w-[248px] cursor-zoom-in overflow-hidden rounded-xl bg-ink-2 shadow-[0_24px_60px_rgba(8,5,0,0.65)] lg:w-[340px] lg:rounded-[14px]"
          sizes="(min-width: 1024px) 340px, 248px"
          priority={index === 0}
        />
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
            {reversed ? <ReversedBadge /> : null}
            <span className="mt-0.5 block text-[13px] font-normal text-muted lg:text-[15px]">
              {selected.nameEn}
            </span>
          </h2>
          {/* 역방향이면 역방향 해석을 주연으로, 정방향은 토글에 접는다. */}
          <div className="mt-3">
{reversed ? (
              <>
                {reversedPositionSentence ? (
                  <p className="text-[15px] leading-[1.7] text-cream lg:text-[17px]">
                    {reversedPositionSentence}
                  </p>
                ) : null}
                {reversedTheme ? (
                  <div className="mt-3.5 border-t border-line pt-3">
                    <p className="text-[12.5px] text-gold lg:text-[13.5px]">
                      이 카드가 지금 {focusLabelOf(focus)}에 건네는 말
                    </p>
                    <p className="mt-1 font-serif text-[14px] leading-[1.7] text-body lg:text-[15px]">
                      {reversedTheme}
                    </p>
                  </div>
                ) : null}
                <details className="mt-2.5">
                  <summary className="inline-block min-h-11 cursor-pointer pt-1.5 text-[13.5px] text-muted underline underline-offset-4 hover:text-cream">
                    카드 자체의 의미 보기
                  </summary>
                  <div className="mt-1 space-y-2.5 font-serif text-[14.5px] leading-[1.7] text-body lg:text-[15.5px]">
                    {reversedParagraphs(selected).map((p) => (
                      <p key={p.slice(0, 24)}>{p}</p>
                    ))}
                  </div>
                </details>
                <UprightDetails>{uprightContent}</UprightDetails>
              </>
            ) : (
              uprightContent
            )}
          </div>
        </motion.div>
      </div>
      <div className="mt-5 flex flex-col gap-2.5 lg:flex-row lg:justify-center lg:gap-3.5">
        <ResultActions deckId={deckId} slug={selected.slug} localDate={localDate} />
      </div>
    </motion.main>
  );
}
