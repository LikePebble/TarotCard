"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { X } from "@phosphor-icons/react";
import {
  dismissPopup,
  isDismissed,
  popupLinkTarget,
  usePopup,
  type PopupRecord,
} from "@/lib/popup";
import { localDateOf } from "@/lib/period";
import { fetchHomePopup } from "@/lib/popup-remote";
import { useModalBehavior } from "@/lib/use-modal-behavior";

export function HomePopup() {
  const reducedMotion = useReducedMotion();
  const { store } = usePopup();
  const [popup, setPopup] = useState<PopupRecord | null>(null);
  const [todayIso, setTodayIso] = useState<string | null>(null);

  useEffect(() => {
    setTodayIso(localDateOf(new Date()));
    void fetchHomePopup().then(setPopup);
  }, []);

  const visible = popup !== null && store !== null && todayIso !== null && !isDismissed(store, popup.id, todayIso);
  const { dialogRef, initialFocusRef } = useModalBehavior({
    active: visible,
    onClose: () => setPopup(null),
  });

  if (!visible || !popup || !todayIso) return null;
  const linkTarget = popup.linkUrl ? popupLinkTarget(popup.linkUrl) : undefined;
  const close = () => setPopup(null);
  const dismiss = (mode: "forever" | "today") => {
    dismissPopup(popup.id, mode, todayIso);
    setPopup(null);
  };

  return (
    <motion.div
      ref={dialogRef}
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
        className="flex max-h-[90dvh] w-full max-w-[520px] flex-col rounded-2xl border border-line-gold bg-ink-1 p-3 shadow-2xl"
      >
        <div className="relative min-h-0 flex-1">
          <button
            ref={initialFocusRef}
            type="button"
            onClick={close}
            aria-label="팝업 닫기"
            className="group absolute right-2 top-2 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none"
            style={{ outline: "none" }}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line-gold/60 bg-black/65 text-muted shadow-sm backdrop-blur-sm transition-colors group-hover:text-cream group-focus-visible:ring-1 group-focus-visible:ring-gold-soft">
              <X size={16} aria-hidden />
            </span>
          </button>
          {/* Supabase URL is runtime-only, so avoid build-time next/image remotePatterns. */}
          {popup.linkUrl ? (
            <a
              href={popup.linkUrl}
              target={linkTarget}
              rel={linkTarget === "_blank" ? "noopener noreferrer" : undefined}
              className="block h-full min-h-0"
            >
              <img src={popup.imageUrl} alt={popup.imageAlt} className="mx-auto h-full max-h-[70vh] w-auto object-contain" />
            </a>
          ) : (
            <img src={popup.imageUrl} alt={popup.imageAlt} className="mx-auto h-full min-h-0 max-h-[70vh] w-auto object-contain" />
          )}
        </div>
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
