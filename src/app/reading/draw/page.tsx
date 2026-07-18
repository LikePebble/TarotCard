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
 * Choreography timings. Every phase transition is timer-driven; the CSS and
 * Motion animations are decoration on top. rAF pauses in background tabs, so
 * nothing in the flow may depend on an animation actually playing.
 */
const SHUFFLE_MS = 2400;
const CHARGE_MS = 800; // gold light gathers on the chosen card
const FLIP_MS = 700;
const SETTLE_MS = 500; // pause on the revealed face before the panel
const MINI_CHARGE_MS = 380; // three-card: quick pulse before the slot flight
const ONE_WATCHDOG_MS = CHARGE_MS + FLIP_MS + SETTLE_MS + 700;
const THREE_WATCHDOG_MS = MINI_CHARGE_MS + 450 + 1800 + 600 + 800;

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
  const [chosenFanId, setChosenFanId] = useState<number | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const recordedRef = useRef(false);
  const watchdogRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = !!reducedMotion;
  }, [reducedMotion]);

  const later = useCallback((ms: number, fn: () => void) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  }, []);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  const setup = useCallback(() => {
    clearTimers();
    setDeck(shuffle(cards));
    setFan(Array.from({ length: FAN_SIZE }, (_, i) => i));
    setPickedFanIds([]);
    setFlippingFanId(null);
    setChosenFanId(null);
    setCount(null);
    recordedRef.current = false;
    if (watchdogRef.current !== null) {
      window.clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
    if (reducedRef.current) {
      setPhase("picking");
      return;
    }
    setPhase("shuffling");
    later(SHUFFLE_MS, () =>
      setPhase((p) => (p === "shuffling" ? "picking" : p)),
    );
  }, [clearTimers, later]);

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
  // when the tab is backgrounded, so onAnimationComplete may never fire.
  // The watchdog forces the reveal after the animation's expected duration.
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
    setPhase("picking");
  };

  const need = spread === "one" ? 1 : 3;
  const picked = deck.slice(0, pickedFanIds.length);

  const pick = (fanId: number) => {
    if (
      phase !== "picking" ||
      chosenFanId !== null ||
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
      // Gacha buildup: light gathers on the card, then flash, then flip.
      setChosenFanId(fanId);
      armRevealWatchdog([slug], spread, focus, ONE_WATCHDOG_MS);
      later(CHARGE_MS, () => {
        setFlippingFanId(fanId);
        setPhase("flipping");
      });
      return;
    }
    if (reducedMotion) {
      const nextPicked = [...pickedFanIds, fanId];
      setPickedFanIds(nextPicked);
      setFan((current) => current.filter((id) => id !== fanId));
      if (nextPicked.length === 3) {
        record(deck.slice(0, 3).map((c) => c.slug), spread, focus);
        setPhase("revealed");
      }
      return;
    }
    // Quick pulse on the tapped card, then it flies to its slot.
    setChosenFanId(fanId);
    later(MINI_CHARGE_MS, () => {
      setChosenFanId(null);
      const nextPicked = [...pickedFanIds, fanId];
      setPickedFanIds(nextPicked);
      setFan((current) => current.filter((id) => id !== fanId));
      if (nextPicked.length === 3) {
        const slugs = deck.slice(0, 3).map((c) => c.slug);
        armRevealWatchdog(slugs, spread, focus, THREE_WATCHDOG_MS);
        later(450, () => {
          record(slugs, spread, focus);
          setPhase("flipping");
        });
      }
    });
  };

  const onOneCardFlipDone = () => {
    if (spread !== "one" || phase !== "flipping") return;
    record([deck[0].slug], spread, focus);
    window.setTimeout(() => setPhase("revealed"), 500);
  };

  const onThreeCardFlipDone = () => {
    if (spread !== "three" || phase !== "flipping") return;
    window.setTimeout(() => setPhase("revealed"), 600);
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
                    (spread === "one" && chosenFanId !== null)
                  ? "카드를 공개합니다"
                  : spread === "three" && pickedFanIds.length > 0
                    ? "한 장 더 고르세요"
                    : "마음이 가는 카드를 고르세요"}
            </h1>

            {spread === "three" ? (
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
                            <span
                              aria-hidden
                              key={`land-${card.slug}`}
                              className="gacha-bloom"
                              style={
                                {
                                  "--bloom-delay": "0.3s",
                                } as React.CSSProperties
                              }
                            />
                          ) : null}
                          {!reducedMotion && phase === "flipping" ? (
                            <span
                              aria-hidden
                              key={`flip-${card.slug}`}
                              className="gacha-bloom"
                              style={
                                {
                                  "--bloom-delay": `${i * 0.55}s`,
                                } as React.CSSProperties
                              }
                            />
                          ) : null}
                          <motion.div
                            className="relative h-full w-full [transform-style:preserve-3d]"
                            animate={{
                              rotateY: phase === "flipping" ? 180 : 0,
                            }}
                            transition={{
                              duration: reducedMotion ? 0 : 0.7,
                              delay: reducedMotion ? 0 : i * 0.55,
                            }}
                            onAnimationComplete={
                              i === 2 ? onThreeCardFlipDone : undefined
                            }
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
              className={`draw-fan mt-2.5 flex-1 overflow-hidden ${
                spread === "three" ? "min-h-[300px]" : "min-h-[380px]"
              } lg:h-[430px] lg:min-h-0 lg:flex-none lg:overflow-visible ${
                phase === "shuffling" ? "is-shuffling" : ""
              }`}
            >
              {fan.map((fanId, i) => {
                const offset = i - (fan.length - 1) / 2;
                const lifted = offset === 0 && phase !== "shuffling";
                const isFlipping = flippingFanId === fanId;
                const isChosen = chosenFanId === fanId;
                const dimmed =
                  spread === "one" &&
                  (chosenFanId !== null || phase === "flipping") &&
                  !isChosen &&
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
                    disabled={phase !== "picking" || chosenFanId !== null}
                    aria-label={`덮인 카드 ${i + 1}`}
                    className={`fan-card aspect-[2/3.4] ${
                      spread === "three" ? "w-[100px]" : "w-28"
                    } lg:w-[170px] ${lifted ? "lifted" : ""} ${
                      isChosen && spread === "one" ? "charging" : ""
                    } ${dimmed ? "dimmed" : ""}`}
                    style={
                      {
                        "--fan-i": offset,
                        "--shuf-i": i,
                        "--shuf-dir": i % 2 === 0 ? 1 : -1,
                      } as React.CSSProperties
                    }
                  >
                    {!reducedMotion && (isChosen || isFlipping) ? (
                      <span aria-hidden>
                        {spread === "one" ? (
                          <span className="gacha-rays" />
                        ) : null}
                        <span
                          className={`gacha-aura ${
                            spread === "three" ? "fast" : ""
                          }`}
                        />
                        {spread === "one" ? (
                          <span className="gacha-flash" />
                        ) : null}
                      </span>
                    ) : null}
                    <div className="h-full w-full [perspective:700px]">
                      <motion.div
                        className="relative h-full w-full [transform-style:preserve-3d]"
                        animate={{ rotateY: isFlipping ? 180 : 0 }}
                        transition={{ duration: 0.7 }}
                        onAnimationComplete={
                          isFlipping ? onOneCardFlipDone : undefined
                        }
                      >
                        <CardBack
                          className={`absolute inset-0 [backface-visibility:hidden] ${
                            lifted ? "border-gold" : ""
                          }`}
                        />
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
                  </motion.button>
                );
              })}
            </div>
            <p className="px-6 text-[13px] text-muted lg:hidden">
              {phase === "shuffling"
                ? "화면을 누르면 건너뜁니다"
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
