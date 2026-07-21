"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "@phosphor-icons/react";
import { DeckAwareArt } from "@/components/DeckAwareArt";
import type { Card } from "@/data/cards";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
const DOUBLE_TAP_MS = 300;

type Point = { x: number; y: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * 상세 페이지의 카드 아트를 감싸, 탭하면 전체화면 뷰어를 연다.
 * 앱이 브라우저 핀치 줌(userScalable:false)을 막고 있으므로,
 * 뷰어 안에서 포인터 이벤트로 더블탭/핀치 줌·드래그 팬을 직접 구현한다.
 */
export function CardArtViewer({
  card,
  deckOverride,
}: {
  card: Card;
  deckOverride?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 오버레이 열림 동안 body 스크롤 잠금.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="카드 크게 보기"
        className="relative mt-1 block aspect-[2/3.4] w-[216px] cursor-zoom-in overflow-hidden rounded-xl bg-ink-2 shadow-[0_24px_60px_rgba(8,5,0,0.65)] lg:mt-0 lg:w-full lg:rounded-[14px] lg:shadow-[0_30px_80px_rgba(8,5,0,0.65)]"
      >
        <DeckAwareArt
          card={card}
          sizes="(min-width: 1024px) 380px, 216px"
          priority
          deckOverride={deckOverride}
        />
      </button>
      {mounted && open
        ? createPortal(
            <ViewerOverlay
              card={card}
              deckOverride={deckOverride}
              onClose={() => setOpen(false)}
            />,
            document.body,
          )
        : null}
    </>
  );
}

function ViewerOverlay({
  card,
  deckOverride,
  onClose,
}: {
  card: Card;
  deckOverride?: string;
  onClose: () => void;
}) {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  // 렌더 밖에서 제스처 상태를 추적하기 위한 ref.
  const stageRef = useRef<HTMLDivElement>(null);
  const pointers = useRef<Map<number, Point>>(new Map());
  const gesture = useRef<{
    startDist: number;
    startScale: number;
    startTx: number;
    startTy: number;
    startCenter: Point;
    panPointer: number | null;
    panStart: Point;
    panStartTx: number;
    panStartTy: number;
  }>({
    startDist: 0,
    startScale: 1,
    startTx: 0,
    startTy: 0,
    startCenter: { x: 0, y: 0 },
    panPointer: null,
    panStart: { x: 0, y: 0 },
    panStartTx: 0,
    panStartTy: 0,
  });
  const lastTap = useRef<{ time: number; x: number; y: number }>({
    time: 0,
    x: 0,
    y: 0,
  });

  const reset = useCallback(() => {
    setScale(1);
    setTx(0);
    setTy(0);
  }, []);

  // Escape로 닫기.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const centerOf = () => {
    const pts = [...pointers.current.values()];
    if (pts.length === 0) return { x: 0, y: 0 };
    const sum = pts.reduce((a, p) => ({ x: a.x + p.x, y: a.y + p.y }), {
      x: 0,
      y: 0,
    });
    return { x: sum.x / pts.length, y: sum.y / pts.length };
  };

  // 특정 화면 좌표를 기준으로 배율을 바꾸며, 그 점이 제자리에 있도록 팬을 보정.
  // 현재 scale/tx/ty를 클로저에서 읽어 한 번에 계산·적용한다(업데이터 안에서
  // 다른 setState를 부르면 StrictMode 이중 실행 때 부작용이 두 번 걸린다).
  const zoomTo = (nextScale: number, focusX: number, focusY: number) => {
    const clamped = clamp(nextScale, MIN_SCALE, MAX_SCALE);
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) {
      setScale(clamped);
      return;
    }
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const originX = (focusX - cx - tx) / scale;
    const originY = (focusY - cy - ty) / scale;
    setScale(clamped);
    setTx(focusX - cx - originX * clamped);
    setTy(focusY - cy - originY * clamped);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const count = pointers.current.size;

    if (count === 2) {
      // 핀치 시작: 기준 거리/배율/중심 기록.
      const pts = [...pointers.current.values()];
      const g = gesture.current;
      g.startDist = distance(pts[0], pts[1]);
      g.startScale = scale;
      g.startTx = tx;
      g.startTy = ty;
      g.startCenter = centerOf();
      g.panPointer = null;
    } else if (count === 1) {
      // 한 손가락: 팬 준비 + 더블탭 판정.
      const now = Date.now();
      const last = lastTap.current;
      const isDouble =
        now - last.time < DOUBLE_TAP_MS &&
        Math.abs(e.clientX - last.x) < 30 &&
        Math.abs(e.clientY - last.y) < 30;
      if (isDouble) {
        lastTap.current = { time: 0, x: 0, y: 0 };
        if (scale > 1.01) {
          reset();
        } else {
          zoomTo(DOUBLE_TAP_SCALE, e.clientX, e.clientY);
        }
      } else {
        lastTap.current = { time: now, x: e.clientX, y: e.clientY };
      }
      const g = gesture.current;
      g.panPointer = e.pointerId;
      g.panStart = { x: e.clientX, y: e.clientY };
      g.panStartTx = tx;
      g.panStartTy = ty;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const count = pointers.current.size;
    const g = gesture.current;

    if (count >= 2) {
      const pts = [...pointers.current.values()];
      const dist = distance(pts[0], pts[1]);
      if (g.startDist > 0) {
        const next = clamp(
          (g.startScale * dist) / g.startDist,
          MIN_SCALE,
          MAX_SCALE,
        );
        setScale(next);
      }
    } else if (count === 1 && g.panPointer === e.pointerId && scale > 1.01) {
      // 확대 상태에서만 한 손가락 팬.
      setTx(g.panStartTx + (e.clientX - g.panStart.x));
      setTy(g.panStartTy + (e.clientY - g.panStart.y));
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (pointers.current.size < 2) {
      g.startDist = 0;
      // 배율이 1로 돌아오면 팬도 초기화.
      if (scale <= 1.01) {
        setTx(0);
        setTy(0);
      }
    }
    if (pointers.current.size === 0) {
      g.panPointer = null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-0/95"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-cream backdrop-blur transition-colors hover:bg-white/20"
      >
        <X size={22} aria-hidden />
      </button>
      <div
        ref={stageRef}
        className="touch-none relative h-[88vh] w-[min(90vw,calc(88vh*0.588))] max-w-[90vw] select-none overflow-hidden rounded-xl [touch-action:none]"
        style={{ touchAction: "none" }}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
      >
        <div
          className="h-full w-full origin-center"
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            cursor: scale > 1.01 ? "grab" : "zoom-in",
          }}
        >
          <DeckAwareArt
            card={card}
            sizes="90vw"
            priority
            deckOverride={deckOverride}
          />
        </div>
      </div>
    </div>
  );
}
