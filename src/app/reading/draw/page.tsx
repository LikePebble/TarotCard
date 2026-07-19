"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { CaretLeft } from "@phosphor-icons/react";
import { CardBack } from "@/components/CardBack";
import { DesktopNav } from "@/components/SiteNav";
import { cards, type Card } from "@/data/cards";
import { koCards } from "@/data/ko";
import {
  collectedCount,
  getPendingFocus,
  getPendingSpread,
  recordReading,
  type SpreadType,
} from "@/lib/store";

const POSITIONS = ["과거", "현재", "미래"] as const;
const FAN_SIZE = 7;

/*
 * Choreography timelines. Every phase transition is setTimeout-driven; CSS
 * and Motion animations are decoration on top of timer-driven state (rAF
 * pauses in background tabs, so nothing may depend on a completion callback).
 *
 * One-card (오늘의 카드): stack cross-shuffle on the fan itself, then
 * lift-and-glow charge with the flash baked into the flash-pop keyframes.
 * Three-card (과거 · 현재 · 미래): shuffle-stage overlay with stagger deal,
 * per-pick charge + flash + slot flight + landing burst, sequential flips.
 */
const SHUFFLE_MS = 2400;
const SHUFFLE_REPEAT_MS = 1300; // three-card only: shorter after 다시 뽑기

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

/** Which shuffle-stack cards run which loop animation (three-card stage). */
const SHUFFLE_CARD_CLASSES = [
  "shuf-static-a",
  "shuf-loop-left",
  "shuf-static-b",
  "shuf-loop-right",
  "shuf-static-a",
  "shuf-loop-left-late",
  "shuf-static-c",
];

type Phase = "shuffling" | "picking" | "flipping" | "revealed";

function shuffle(list: Card[]): Card[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function nameKoOf(card: Card): string {
  return koCards[card.slug]?.nameKo ?? card.nameEn;
}

function descriptionOf(card: Card): string[] {
  const ko = koCards[card.slug]?.description;
  return (ko && ko.length > 0 ? ko : card.en.description).split("\n\n");
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
  const [dealt, setDealt] = useState(true);
  const [count, setCount] = useState<number | null>(null);
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

  const beginPicking = useCallback(
    (s: SpreadType) => {
      setPhase((p) => (p === "shuffling" ? "picking" : p));
      if (s === "three") {
        later(40, () => setDealt(true));
      } else {
        setDealt(true);
      }
    },
    [later],
  );

  const setup = useCallback(() => {
    // Spread comes from sessionStorage (source of truth) because setup can
    // run in the same tick that seeds the spread state.
    const s = getPendingSpread() ?? "one";
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
    setCount(null);
    recordedRef.current = false;
    if (reducedRef.current) {
      setPhase("picking");
      setDealt(true);
      return;
    }
    setPhase("shuffling");
    // One-card shuffles the fan itself (is-shuffling class); the cards stay
    // mounted, so no deal-in state is needed. Three-card hides the fan behind
    // the shuffle stage and deals it out afterwards.
    setDealt(s === "one");
    const ms =
      s === "three" && hasShuffledRef.current ? SHUFFLE_REPEAT_MS : SHUFFLE_MS;
    hasShuffledRef.current = true;
    later(ms, () => beginPicking(s));
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
    setSpread(pendingSpread);
    setFocus(pendingFocus);
    setup();
    setReady(true);
  }, [router, setup]);

  const record = useCallback(
    (slugs: string[], s: SpreadType, f: string) => {
      if (recordedRef.current) return;
      recordedRef.current = true;
      const store = recordReading(s, f, slugs);
      setCount(collectedCount(store));
    },
    [],
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
    beginPicking(spread);
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
        setFlippingFanId(fanId);
        setPhase("flipping");
      });
      later(ONE_REVEAL_MS, () => {
        record([slug], spread, focus);
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
            <p className="px-6 text-[13px] text-muted lg:text-[14px]">
              {spreadLabel}{" "}
              <b className="font-medium text-gold">{focus}</b>
            </p>
            <h1 className="mt-1.5 px-6 font-serif text-[27px] font-semibold leading-[1.35] lg:text-[40px]">
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
                            <CardBack className="absolute inset-0 [backface-visibility:hidden]" />
                            <div className="absolute inset-0 overflow-hidden rounded-xl bg-ink-2 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                              <Image
                                src={card.image}
                                alt={`${nameKoOf(card)} ${card.nameEn}`}
                                fill
                                sizes="110px"
                                className="object-cover"
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

            <div
              className={`draw-fan ${
                spread === "three"
                  ? "fan-three mt-4 h-[250px] flex-none overflow-hidden lg:h-[430px] lg:overflow-visible"
                  : "mt-2.5 min-h-[380px] flex-1 overflow-hidden lg:h-[430px] lg:min-h-0 lg:flex-none lg:overflow-visible"
              } ${
                spread === "one" && phase === "shuffling" ? "is-shuffling" : ""
              }`}
            >
              {spread === "three" && phase === "shuffling" ? (
                <button
                  type="button"
                  onClick={skipShuffle}
                  aria-label="카드 섞기 건너뛰기"
                  className="shuffle-stage"
                >
                  {SHUFFLE_CARD_CLASSES.map((cls, i) => (
                    <CardBack
                      key={i}
                      className={`shuffle-card ${cls} aspect-[2/3.4] w-28 lg:w-[170px]`}
                    />
                  ))}
                </button>
              ) : (
                fan.map((fanId, i) => {
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
                      } ${dimmedOne ? "dimmed" : ""} ${!dealt ? "stacked" : ""}`}
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
                          <CardBack className="absolute inset-0 [backface-visibility:hidden]" />
                          <div className="absolute inset-0 overflow-hidden rounded-xl bg-ink-2 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                            {isFlipping && deck[0] ? (
                              <Image
                                src={deck[0].image}
                                alt={`${nameKoOf(deck[0])} ${deck[0].nameEn}`}
                                fill
                                sizes="170px"
                                className="object-cover"
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
                })
              )}
            </div>
            <p className="px-6 text-[13px] text-muted lg:hidden">
              {phase === "shuffling"
                ? spread === "one"
                  ? "화면을 누르면 건너뜁니다"
                  : "화면을 누르면 바로 펼칩니다"
                : spread === "three"
                  ? "고른 카드는 슬롯으로 이동합니다"
                  : "카드를 눌러 뒤집습니다"}
            </p>
          </main>
        ) : spread === "one" ? (
          <OneCardResult
            card={deck[0]}
            focus={focus}
            count={count}
            reducedMotion={!!reducedMotion}
            onRetry={setup}
          />
        ) : (
          <ThreeCardResult
            picked={deck.slice(0, 3)}
            focus={focus}
            count={count}
            reducedMotion={!!reducedMotion}
            onRetry={setup}
          />
        )}
    </div>
  );
}

function OneCardResult({
  card,
  focus,
  count,
  reducedMotion,
  onRetry,
}: {
  card: Card;
  focus: string;
  count: number | null;
  reducedMotion: boolean;
  onRetry: () => void;
}) {
  const paragraphs = descriptionOf(card);
  return (
    <motion.main
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-[1280px] flex-1 px-6 pb-8 pt-1 lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-[72px] lg:px-[72px] lg:py-20"
    >
      <div className="flex justify-center lg:justify-end">
        <div className="relative aspect-[2/3.4] w-[200px] overflow-hidden rounded-xl bg-ink-2 shadow-[0_24px_60px_rgba(8,5,0,0.65)] lg:w-full lg:max-w-[360px] lg:rounded-[14px]">
          <Image
            src={card.image}
            alt={`${nameKoOf(card)} ${card.nameEn}`}
            fill
            sizes="(min-width: 1024px) 360px, 200px"
            className="object-cover"
            priority
          />
        </div>
      </div>
      <div>
        <p className="mt-[22px] text-center text-[13px] text-muted lg:mt-0 lg:text-left lg:text-[14px]">
          오늘의 카드 · <b className="font-medium text-gold">{focus}</b>
        </p>
        <h1 className="mt-1 text-center font-serif text-[30px] font-semibold lg:text-left lg:text-[44px]">
          {nameKoOf(card)}{" "}
          <span className="ml-1 text-base font-normal text-muted lg:text-[22px]">
            {card.nameEn}
          </span>
        </h1>
        <div className="mt-4 space-y-3 text-[15px] text-body lg:mt-6 lg:max-w-[520px] lg:text-base">
          {paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-5 flex items-baseline justify-between rounded-[14px] border border-line-gold px-[18px] py-3.5 text-[13.5px] lg:mt-8 lg:inline-flex lg:gap-3.5 lg:text-[14.5px]">
          <span>컬렉션에 추가되었습니다</span>
          <b className="font-serif text-[15px] font-semibold text-gold-soft">
            {count ?? "-"} / 78
          </b>
        </div>
        <div className="mt-5 flex flex-col gap-2.5 lg:mt-8 lg:flex-row lg:gap-3.5">
          <Link
            href={`/collection/${card.slug}`}
            className="btn btn-gold w-full lg:w-auto"
          >
            카드 자세히 보기
          </Link>
          <button
            type="button"
            onClick={onRetry}
            className="btn btn-ghost w-full lg:w-auto"
          >
            다시 뽑기
          </button>
        </div>
      </div>
    </motion.main>
  );
}

function ThreeCardResult({
  picked,
  focus,
  count,
  reducedMotion,
  onRetry,
}: {
  picked: Card[];
  focus: string;
  count: number | null;
  reducedMotion: boolean;
  onRetry: () => void;
}) {
  return (
    <motion.main
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-[760px] flex-1 px-6 pb-8 pt-1 lg:pb-24 lg:pt-14"
    >
      <p className="text-center text-[13px] text-muted lg:text-[14px]">
        과거 · 현재 · 미래 <b className="font-medium text-gold">{focus}</b>
      </p>
      <div className="mt-4 flex justify-center gap-2.5">
        {picked.map((card) => (
          <div
            key={card.slug}
            className="relative aspect-[2/3.4] w-[72px] overflow-hidden rounded-lg bg-ink-2 lg:w-[92px]"
          >
            <Image
              src={card.image}
              alt={`${nameKoOf(card)} ${card.nameEn}`}
              fill
              sizes="92px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
      <div className="mt-2">
        {picked.map((card, i) => (
          <section
            key={card.slug}
            className="flex items-start gap-4 border-b border-line py-[22px] last:border-b-0 lg:gap-7 lg:py-8"
          >
            <div className="relative aspect-[2/3.4] w-[88px] flex-none overflow-hidden rounded-xl bg-ink-2 lg:w-[120px]">
              <Image
                src={card.image}
                alt={`${nameKoOf(card)} ${card.nameEn}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-[12.5px] text-gold lg:text-[13.5px]">
                {POSITIONS[i]}
              </p>
              <h2 className="mt-0.5 mb-1.5 font-serif text-xl font-semibold lg:text-2xl">
                {nameKoOf(card)}{" "}
                <span className="ml-1 text-[13px] font-normal text-muted lg:text-[15px]">
                  {card.nameEn}
                </span>
              </h2>
              <div className="space-y-2.5 text-[13.5px] leading-[1.65] text-body lg:text-[15px]">
                {descriptionOf(card).map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
      <div className="mt-2 flex items-baseline justify-between rounded-[14px] border border-line-gold px-[18px] py-3.5 text-[13.5px] lg:text-[14.5px]">
        <span>3장이 컬렉션에 추가되었습니다</span>
        <b className="font-serif text-[15px] font-semibold text-gold-soft">
          {count ?? "-"} / 78
        </b>
      </div>
      <div className="mt-5 flex flex-col gap-2.5 lg:flex-row lg:justify-center lg:gap-3.5">
        <Link href="/collection" className="btn btn-gold w-full lg:w-auto">
          컬렉션 보기
        </Link>
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-ghost w-full lg:w-auto"
        >
          다시 뽑기
        </button>
      </div>
    </motion.main>
  );
}
