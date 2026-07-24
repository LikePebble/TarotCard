"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { CaretLeft } from "@phosphor-icons/react";
import { CardArt } from "@/components/CardArt";
import { CardBack } from "@/components/CardBack";
import { DesktopNav } from "@/components/SiteNav";
import { cards, type Card } from "@/data/cards";
import { focusLabelOf } from "@/data/focus";
import { pickOrientations, secureRand } from "@/lib/orientation";
import {
  blockingReading,
  getPendingFocus,
  getPendingSpread,
  loadStore,
  recordReading,
  useSelectedDeck,
  type ReadingRecord,
  type SpreadType,
} from "@/lib/store";
import { OneCardResult, ThreeCardResult } from "../ReadingResult";

const POSITIONS = ["과거", "현재", "미래"] as const;
const FAN_SIZE = 7;

/*
 * Choreography timelines. Every phase transition is setTimeout-driven; CSS
 * and Motion animations are decoration on top of timer-driven state (rAF
 * pauses in background tabs, so nothing may depend on a completion callback).
 *
 * Both spreads share one shuffle: the fan stays spread while the cards
 * cross-shuffle in place (is-shuffling), then settle for picking.
 * One-card (오늘의 카드): lift-and-glow charge with the flash baked into the
 * flash-pop keyframes. Three-card (과거 · 현재 · 미래): per-pick charge + flash
 * + slot flight + landing burst, then sequential flips.
 */
/*
 * 셔플 타이머는 CSS 애니메이션(shuf-cycle 1.15s × var(--shuf-cycles), 카드별
 * 지연 85ms × 최대 6)이 전부 끝난 뒤에 걸려야 한다. 실행 중인 애니메이션이 있는
 * 속성은 is-shuffling을 떼도 CSS 전이가 발화하지 않아 부채꼴로 한 프레임에
 * 튄다(관찰로 확인). 끝난 뒤에 떼면 기본 rotate/translate 전이가 스택 →
 * 부채꼴을 부드럽게 잇는다. 아래 값 = 지연 510ms + 사이클 합 + 여유 ~90ms.
 */
const SHUFFLE_MS = 2900; // 2사이클: 510 + 2300 + 여유
const SHUFFLE_REPEAT_MS = 1750; // 다시 뽑기: 1사이클(510 + 1150) + 여유 (both spreads)

/* One-card path (Fable timings) */
const ONE_CHARGE_MS = 800; // gold light gathers on the chosen card
const ONE_FLIP_MS = 700;
const ONE_SETTLE_MS = 500; // pause on the revealed face before the panel
const ONE_REVEAL_MS = ONE_CHARGE_MS + ONE_FLIP_MS + ONE_SETTLE_MS; // 2000
const ONE_WATCHDOG_MS = ONE_CHARGE_MS + ONE_FLIP_MS + ONE_SETTLE_MS + 700;

/* Three-card path */
const CHARGE_MS = 700; // glow buildup after tapping a card
const FLASH_MS = 130; // bright flash at the peak
const THREE_FLIP_STAGGER_S = 0.55; // delay between sequential slot flips
const THREE_FLIP_MS = 650;
const THREE_REVEAL_MS = 2300; // flipping -> revealed (last flip ends ~1750ms)

type Phase = "shuffling" | "picking" | "flipping" | "revealed";

function shuffle(list: Card[]): Card[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

/**
 * Three-card path glow layers. Only transform and opacity are animated;
 * gradients and mask are static. Unmounts as soon as the charge ends.
 */
function GachaGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <div className="glow-rays" />
      <div className="glow-radial" />
      <div className="glow-ring" />
    </div>
  );
}

export default function DrawPage() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { deckId } = useSelectedDeck();
  const [ready, setReady] = useState(false);
  const [spread, setSpread] = useState<SpreadType>("one");
  const [focus, setFocus] = useState("");
  const [deck, setDeck] = useState<Card[]>([]);
  const [fan, setFan] = useState<number[]>([]);
  const [pickedFanIds, setPickedFanIds] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>("picking");
  const [flippingFanId, setFlippingFanId] = useState<number | null>(null);
  const [chargingFanId, setChargingFanId] = useState<number | null>(null);
  const [flashing, setFlashing] = useState(false);
  // 셔플 사이클 수. CSS(--shuf-cycles)와 타이머가 같은 값을 봐야 끊김이 없다.
  const [shuffleCycles, setShuffleCycles] = useState(2);
  const [readingRecord, setReadingRecord] = useState<ReadingRecord | null>(null);
  const recordedRef = useRef(false);
  const watchdogRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const hasShuffledRef = useRef(false);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = !!reducedMotion;
  }, [reducedMotion]);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  /** setTimeout with automatic cleanup on reset/unmount. */
  const later = useCallback((ms: number, fn: () => void) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  }, []);

  const beginPicking = useCallback(() => {
    // 두 스프레드 모두 셔플 내내 부채꼴이 펼쳐진 채이므로 별도 deal-in 없이
    // 셔플 애니메이션만 걷어내고 바로 고르기 단계로 넘어간다.
    setPhase((p) => (p === "shuffling" ? "picking" : p));
  }, []);

  const setup = useCallback(() => {
    clearTimers();
    if (watchdogRef.current !== null) {
      window.clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
    setDeck(shuffle(cards));
    setFan(Array.from({ length: FAN_SIZE }, (_, i) => i));
    setPickedFanIds([]);
    setFlippingFanId(null);
    setChargingFanId(null);
    setFlashing(false);
    setReadingRecord(null);
    recordedRef.current = false;
    if (reducedRef.current) {
      setPhase("picking");
      return;
    }
    setPhase("shuffling");
    // 통일된 셔플: 오늘의 카드·3카드 모두 부채꼴을 펼친 채 카드 자체가 섞인다
    // (is-shuffling). 별도 셔플 스테이지 오버레이 없이 같은 연출로 이어진다.
    const repeat = hasShuffledRef.current;
    setShuffleCycles(repeat ? 1 : 2);
    hasShuffledRef.current = true;
    later(repeat ? SHUFFLE_REPEAT_MS : SHUFFLE_MS, () => beginPicking());
  }, [beginPicking, clearTimers, later]);

  useEffect(
    () => () => {
      for (const id of timersRef.current) window.clearTimeout(id);
      if (watchdogRef.current !== null) window.clearTimeout(watchdogRef.current);
    },
    [],
  );

  useEffect(() => {
    const pendingSpread = getPendingSpread();
    const pendingFocus = getPendingFocus();
    if (!pendingSpread || !pendingFocus) {
      router.replace("/reading");
      return;
    }
    // 이미 이번 주기에 뽑았으면(뒤로가기·직접 진입 등) 재기록을 막고 결과로 보낸다.
    const blocked = blockingReading(loadStore(), pendingSpread, new Date());
    if (blocked) {
      router.replace(`/reading/${blocked.id}`);
      return;
    }
    setSpread(pendingSpread);
    setFocus(pendingFocus);
    setup();
    setReady(true);
  }, [router, setup]);

  const record = useCallback(
    (slugs: string[], s: SpreadType, f: string) => {
      if (recordedRef.current) return;
      recordedRef.current = true;
      const result = recordReading({
        spread: s,
        category: f,
        deckId,
        cards: slugs,
        // 방향은 기록 시점에 뽑는다. uid()와 같은 이유로 보안 난수를 쓴다.
        orientations: pickOrientations(slugs.length, secureRand),
      });
      setReadingRecord(result.record);
    },
    [deckId],
  );

  // Flow state must never depend solely on animation completion: rAF pauses
  // when the tab is backgrounded, so animation callbacks may never fire.
  // The watchdog forces the reveal after the choreography's expected duration.
  const armRevealWatchdog = useCallback(
    (slugs: string[], s: SpreadType, f: string, ms: number) => {
      if (watchdogRef.current !== null) window.clearTimeout(watchdogRef.current);
      watchdogRef.current = window.setTimeout(() => {
        watchdogRef.current = null;
        record(slugs, s, f);
        setPhase((p) => (p === "flipping" ? "revealed" : p));
      }, ms);
    },
    [record],
  );

  const skipShuffle = () => {
    if (phase !== "shuffling") return;
    clearTimers();
    beginPicking();
  };

  const need = spread === "one" ? 1 : 3;
  const picked = deck.slice(0, pickedFanIds.length);

  const pick = (fanId: number) => {
    if (
      phase !== "picking" ||
      chargingFanId !== null ||
      pickedFanIds.length >= need
    ) {
      return;
    }
    if (spread === "one") {
      const slug = deck[0].slug;
      setPickedFanIds([fanId]);
      if (reducedMotion) {
        record([slug], spread, focus);
        setPhase("revealed");
        return;
      }
      // Fable timeline: charge (lift + glow, flash baked into the keyframes)
      // -> flip -> settle -> reveal. Timer-driven; watchdog as backstop.
      setChargingFanId(fanId);
      armRevealWatchdog([slug], spread, focus, ONE_WATCHDOG_MS);
      later(ONE_CHARGE_MS, () => {
        // 뒤집기 전에 기록한다 — 방향이 여기서 정해지므로, 늦게 부르면 역방향
        // 카드가 정방향으로 뒤집힌 뒤 결과 화면에서 튄다. 3장 경로도 같은 순서다.
        record([slug], spread, focus);
        setFlippingFanId(fanId);
        setPhase("flipping");
      });
      later(ONE_REVEAL_MS, () => {
        setPhase((p) => (p === "flipping" ? "revealed" : p));
      });
      return;
    }
    const nextPicked = [...pickedFanIds, fanId];
    if (reducedMotion) {
      setPickedFanIds(nextPicked);
      setFan((current) => current.filter((id) => id !== fanId));
      if (nextPicked.length === 3) {
        record(
          deck.slice(0, 3).map((c) => c.slug),
          spread,
          focus,
        );
        setPhase("revealed");
      }
      return;
    }
    // Timeline per pick: charge glow -> flash -> fly to slot. After the third
    // pick: pause -> sequential flips -> reveal. Timer-driven throughout.
    setChargingFanId(fanId);
    later(CHARGE_MS, () => setFlashing(true));
    later(CHARGE_MS + FLASH_MS, () => {
      setFlashing(false);
      setChargingFanId(null);
      setPickedFanIds(nextPicked);
      setFan((current) => current.filter((id) => id !== fanId));
      if (nextPicked.length === 3) {
        const slugs = deck.slice(0, 3).map((c) => c.slug);
        later(450, () => {
          record(slugs, spread, focus);
          setPhase("flipping");
          later(THREE_REVEAL_MS, () =>
            setPhase((p) => (p === "flipping" ? "revealed" : p)),
          );
          armRevealWatchdog(slugs, spread, focus, THREE_REVEAL_MS + 800);
        });
      }
    });
  };

  if (!ready) {
    return <div className="min-h-[100dvh]" />;
  }

  const spreadLabel = spread === "one" ? "오늘의 카드" : "과거 · 현재 · 미래";

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <DesktopNav active="reading" />
      {phase === "revealed" ? (
        <nav className="flex h-14 flex-none items-center px-5 lg:hidden">
          <Link
            href="/reading"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted hover:text-cream"
          >
            <CaretLeft size={16} aria-hidden />
            리딩
          </Link>
        </nav>
      ) : (
        <nav className="flex h-14 flex-none items-center justify-between px-5 lg:hidden">
          <Link
            href="/reading/focus"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted hover:text-cream"
          >
            <CaretLeft size={16} aria-hidden />
            질문
          </Link>
          <span className="text-[13px] text-muted">3 / 3</span>
        </nav>
      )}

      {phase !== "revealed" ? (
          <main
            className="flex flex-1 flex-col pb-6 pt-3 text-center lg:pt-14"
            onPointerDown={skipShuffle}
          >
            {/* 테마는 리딩 유형 아래 자기 줄에 둔다 — 한 줄에 이어 붙이면
                유형과 테마가 한 덩어리로 읽힌다. */}
            <p className="px-6 text-[13px] text-muted lg:text-[14px]">
              {spreadLabel}
              <b className="mt-0.5 block font-medium text-gold">
                {focusLabelOf(focus)}
              </b>
            </p>
            <h1 className="mt-1.5 px-6 font-display text-[27px] font-semibold leading-[1.35] lg:text-[40px]">
              {phase === "shuffling"
                ? "카드를 섞고 있습니다"
                : phase === "flipping" ||
                    (spread === "one" && chargingFanId !== null)
                  ? "카드를 공개합니다"
                  : spread === "three" && pickedFanIds.length > 0
                    ? "한 장 더 고르세요"
                    : "마음이 가는 카드를 고르세요"}
            </h1>

            {spread === "three" && phase !== "shuffling" ? (
              <div className="mt-[22px] flex justify-center gap-3.5 px-6">
                {POSITIONS.map((position, i) => {
                  const card = picked[i];
                  return (
                    <div key={position} className="w-[86px] lg:w-[110px]">
                      {card ? (
                        <motion.div
                          layoutId={
                            reducedMotion
                              ? undefined
                              : `fan-card-${pickedFanIds[i]}`
                          }
                          className="relative aspect-[2/3.4] [perspective:700px]"
                        >
                          {!reducedMotion ? (
                            <div
                              aria-hidden
                              className="glow-burst"
                              style={
                                { "--burst-delay": "280ms" } as React.CSSProperties
                              }
                            />
                          ) : null}
                          {phase === "flipping" && !reducedMotion ? (
                            <div
                              aria-hidden
                              className="glow-burst"
                              style={
                                {
                                  "--burst-delay": `${i * THREE_FLIP_STAGGER_S}s`,
                                } as React.CSSProperties
                              }
                            />
                          ) : null}
                          <motion.div
                            className="relative z-[1] h-full w-full [transform-style:preserve-3d]"
                            animate={{
                              rotateY: phase === "flipping" ? 180 : 0,
                            }}
                            transition={{
                              duration: reducedMotion
                                ? 0
                                : THREE_FLIP_MS / 1000,
                              delay: reducedMotion
                                ? 0
                                : i * THREE_FLIP_STAGGER_S,
                            }}
                          >
                            <CardBack
                              deckId={deckId}
                              sizes="110px"
                              className="absolute inset-0 [backface-visibility:hidden]"
                            />
                            <div className="absolute inset-0 overflow-hidden rounded-xl bg-ink-2 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                              <CardArt
                                card={card}
                                deckId={deckId}
                                sizes="110px"
                                orientation={
                                  readingRecord?.orientations[i] ?? "upright"
                                }
                              />
                            </div>
                          </motion.div>
                        </motion.div>
                      ) : (
                        <div className="aspect-[2/3.4] rounded-xl border border-dashed border-[rgba(201,162,75,0.4)]" />
                      )}
                      <p
                        className={`mt-2 text-center text-xs ${
                          card ? "text-gold-soft" : "text-muted"
                        }`}
                      >
                        {position}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* 두 스프레드 모두 같은 하단 고정 레이아웃 — 셔플 중(슬롯 줄 없음)에도
                더미가 1장과 같은 자리에 있고, 고정 높이 + overflow-hidden 박스가
                차지 리프트를 위로 잘라내던 문제가 없어진다. 3장은 슬롯 줄이
                공간을 쓰므로 모바일 최소 높이와 데스크톱 높이만 낮춘다
                (430이면 슬롯 줄에 밀려 카드가 폴드 아래로 내려간다). */}
            <div
              className={`draw-fan ${
                spread === "three"
                  ? "fan-three mt-2.5 min-h-[300px] flex-1 overflow-hidden lg:h-[350px] lg:min-h-0 lg:flex-none lg:overflow-visible"
                  : "mt-2.5 min-h-[380px] flex-1 overflow-hidden lg:h-[430px] lg:min-h-0 lg:flex-none lg:overflow-visible"
              } ${phase === "shuffling" ? "is-shuffling" : ""}`}
              style={{ "--shuf-cycles": shuffleCycles } as React.CSSProperties}
            >
              {fan.map((fanId, i) => {
                  const offset = i - (fan.length - 1) / 2;
                  const isFlipping = flippingFanId === fanId;
                  const isCharging = chargingFanId === fanId;
                  const dimmedOne =
                    spread === "one" &&
                    (chargingFanId !== null || phase === "flipping") &&
                    !isCharging &&
                    !isFlipping;
                  return (
                    <motion.button
                      key={fanId}
                      type="button"
                      layoutId={
                        spread === "three" && !reducedMotion
                          ? `fan-card-${fanId}`
                          : undefined
                      }
                      onClick={() => pick(fanId)}
                      disabled={phase !== "picking" || chargingFanId !== null}
                      aria-label={`덮인 카드 ${i + 1}`}
                      animate={
                        spread === "three"
                          ? {
                              opacity:
                                chargingFanId !== null && !isCharging
                                  ? 0.35
                                  : 1,
                            }
                          : undefined
                      }
                      className={`fan-card aspect-[2/3.4] ${
                        spread === "three" ? "w-[100px]" : "w-28"
                      } lg:w-[170px] ${
                        spread === "one" && (isCharging || isFlipping)
                          ? "charging-lift"
                          : ""
                      } ${
                        spread === "three" && isCharging ? "charging" : ""
                      } ${dimmedOne ? "dimmed" : ""}`}
                      style={
                        {
                          "--fan-i": offset,
                          "--deal-delay": `${Math.abs(offset) * 55}ms`,
                          "--shuf-i": i,
                          "--shuf-dir": i % 2 === 0 ? 1 : -1,
                        } as React.CSSProperties
                      }
                    >
                      {spread === "one" &&
                      !reducedMotion &&
                      (isCharging || isFlipping) ? (
                        <span aria-hidden>
                          <span className="gacha-rays" />
                          <span className="gacha-aura" />
                          <span className="gacha-flash" />
                        </span>
                      ) : null}
                      {spread === "three" && !reducedMotion && isCharging ? (
                        <GachaGlow />
                      ) : null}
                      <div className="relative z-[1] h-full w-full [perspective:700px]">
                        <motion.div
                          className="relative h-full w-full [transform-style:preserve-3d]"
                          animate={{ rotateY: isFlipping ? 180 : 0 }}
                          transition={{ duration: ONE_FLIP_MS / 1000 }}
                        >
                          <CardBack
                            deckId={deckId}
                            sizes="170px"
                            className="absolute inset-0 [backface-visibility:hidden]"
                          />
                          <div className="absolute inset-0 overflow-hidden rounded-xl bg-ink-2 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                            {isFlipping && deck[0] ? (
                              <CardArt
                                card={deck[0]}
                                deckId={deckId}
                                sizes="170px"
                                orientation={
                                  readingRecord?.orientations[0] ?? "upright"
                                }
                              />
                            ) : null}
                          </div>
                        </motion.div>
                      </div>
                      {spread === "three" && isCharging && flashing ? (
                        <div aria-hidden className="glow-flash" />
                      ) : null}
                    </motion.button>
                  );
                })}
            </div>
            <p className="px-6 text-[13px] text-muted lg:hidden">
              {phase === "shuffling"
                ? "화면을 누르면 바로 펼칩니다"
                : spread === "three"
                  ? "고른 카드는 슬롯으로 이동합니다"
                  : "카드를 눌러 뒤집습니다"}
            </p>
          </main>
        ) : spread === "one" ? (
          <OneCardResult
            card={deck[0]}
            deckId={deckId}
            focus={focus}
            orientations={readingRecord?.orientations}
            reducedMotion={!!reducedMotion}
            localDate={readingRecord?.localDate ?? null}
          />
        ) : (
          <ThreeCardResult
            picked={deck.slice(0, 3)}
            deckId={deckId}
            focus={focus}
            orientations={readingRecord?.orientations}
            reducedMotion={!!reducedMotion}
            localDate={readingRecord?.localDate ?? null}
          />
        )}
    </div>
  );
}
