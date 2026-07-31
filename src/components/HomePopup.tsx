"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { dismissPopup, isDismissed, usePopup, type PopupRecord } from "@/lib/popup";
import { localDateOf } from "@/lib/period";
import { fetchHomePopup } from "@/lib/popup-remote";

export function HomePopup() {
  const reducedMotion = useReducedMotion();
  const { store } = usePopup();
  const [popup, setPopup] = useState<PopupRecord | null>(null);
  const [todayIso, setTodayIso] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setTodayIso(localDateOf(new Date()));
    void fetchHomePopup().then(setPopup);
  }, []);

  const visible = popup !== null && store !== null && todayIso !== null && !isDismissed(store, popup.id, todayIso);

  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPopup(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [visible]);

  if (!visible || !popup || !todayIso) return null;
  const close = () => setPopup(null);
  const dismiss = (mode: "forever" | "today") => {
    dismissPopup(popup.id, mode, todayIso);
    setPopup(null);
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={popup.imageAlt}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative max-h-[90vh] w-full max-w-[520px] rounded-2xl border border-line-gold bg-ink-1 p-3 shadow-2xl"
      >
        <button ref={closeRef} type="button" onClick={close} aria-label="팝업 닫기" className="absolute right-2 top-2 z-10 rounded-full px-2 py-1 text-lg text-muted hover:text-cream">×</button>
        {/* Supabase URL is runtime-only, so avoid build-time next/image remotePatterns. */}
        {popup.linkUrl ? (
          <a href={popup.linkUrl} target="_blank" rel="noopener noreferrer">
            <img src={popup.imageUrl} alt={popup.imageAlt} className="mx-auto max-h-[70vh] w-auto object-contain" />
          </a>
        ) : (
          <img src={popup.imageUrl} alt={popup.imageAlt} className="mx-auto max-h-[70vh] w-auto object-contain" />
        )}
        {/* .btn(높이 52px·좌우 패딩 30px)을 쓰면 두 개가 좁은 폭에서 넘친다.
            .btn은 white-space: nowrap이라 넘칠 때 접히지 않고 삐져나온다.
            여기서는 얇은 텍스트 버튼으로 두되 터치 영역만 44px로 확보한다. */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2">
          <button
            type="button"
            onClick={() => dismiss("today")}
            className="min-h-11 px-2 text-[12.5px] text-muted underline underline-offset-2 transition-colors hover:text-cream"
          >
            오늘 하루 보지 않기
          </button>
          <button
            type="button"
            onClick={() => dismiss("forever")}
            className="min-h-11 px-2 text-[12.5px] text-muted underline underline-offset-2 transition-colors hover:text-cream"
          >
            다시 보지 않기
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
