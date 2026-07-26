"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { CheckCircle, X } from "@phosphor-icons/react";
import type { Deck } from "@/data/decks";

/** 덱 상품 정보 모달. 첫 이미지는 10:17(800×1360) 규격, 나머지는 아래로 이어 스크롤. */
export function DeckInfoModal({
  deck,
  onClose,
}: {
  deck: Deck;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
      if (e.key === "Tab") {
        e.preventDefault();
        closeRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, []);

  const images = deck.info.productImages ?? [];
  const titleId = `deck-info-${deck.id}-title`;
  const showPrice = deck.info.price !== undefined || deck.id === "classic";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 lg:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88dvh] w-full max-w-[440px] overflow-y-auto rounded-t-2xl border border-line bg-ink-1 lg:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-ink-1 px-5 py-3.5">
          <h2
            id={titleId}
            className="font-display text-[17px] font-semibold"
          >
            {deck.nameKo}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted hover:text-cream focus-visible:ring-2 focus-visible:ring-gold-soft"
          >
            <X size={20} aria-hidden />
          </button>
        </div>
        <div className="p-5">
          {images.length > 0 ? (
            <div className="space-y-3">
              {images.map((src, i) => (
                <div
                  key={src}
                  className="relative w-full overflow-hidden rounded-xl bg-ink-2"
                  style={{ aspectRatio: "10 / 17" }}
                >
                  <Image
                    src={src}
                    alt={i === 0 ? `${deck.nameKo} 덱 커버` : ""}
                    fill
                    sizes="440px"
                    className="object-cover"
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>
          ) : null}
          {deck.info.eyebrow ? (
            <p className="mt-6 text-[11px] font-semibold tracking-[0.18em] text-gold-soft">
              {deck.info.eyebrow}
            </p>
          ) : null}
          {deck.info.headline ? (
            <h3 className="mt-2 font-display text-[23px] font-semibold leading-[1.4] text-cream">
              {deck.info.headline}
            </h3>
          ) : null}
          <div
            className={`space-y-3 font-serif text-[14.5px] leading-relaxed text-body ${
              deck.info.headline ? "mt-4" : "mt-5"
            }`}
          >
            {deck.info.description.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          {deck.info.highlights?.length ? (
            <ul className="mt-5 space-y-2.5 rounded-xl border border-line bg-ink-2/70 p-4 text-[13.5px] text-body">
              {deck.info.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2.5">
                  <CheckCircle
                    size={16}
                    className="mt-0.5 flex-none text-gold-soft"
                    aria-hidden
                  />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {showPrice ? (
            <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
              <span className="text-[13px] text-muted">가격</span>
              <span className="font-display text-[17px] text-gold-soft">
                {deck.info.price !== undefined
                  ? `${deck.info.price.toLocaleString()}원`
                  : "무료"}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
