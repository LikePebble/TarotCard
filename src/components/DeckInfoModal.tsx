"use client";

import Image from "next/image";
import { useEffect } from "react";
import { X } from "@phosphor-icons/react";
import type { Deck } from "@/data/decks";

/** 덱 상품 정보 모달. 첫 이미지는 10:17(800×1360) 규격, 나머지는 아래로 이어 스크롤. */
export function DeckInfoModal({
  deck,
  onClose,
}: {
  deck: Deck;
  onClose: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const images = deck.info.productImages ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 lg:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${deck.nameKo} 덱 정보`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88dvh] w-full max-w-[440px] overflow-y-auto rounded-t-2xl border border-line bg-ink-1 lg:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-ink-1 px-5 py-3.5">
          <p className="font-display text-[17px] font-semibold">{deck.nameKo}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex min-h-11 min-w-11 items-center justify-center text-muted hover:text-cream"
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
                    alt={i === 0 ? `${deck.nameKo} 상품 이미지` : ""}
                    fill
                    sizes="440px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex w-full items-center justify-center rounded-xl bg-ink-2 text-[13px] text-muted"
              style={{ aspectRatio: "10 / 17" }}
            >
              이미지 준비 중
            </div>
          )}
          <div className="mt-5 space-y-3 font-serif text-[14.5px] text-body">
            {deck.info.description.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-[13px] text-muted">가격</span>
            <span className="font-display text-[17px] text-gold-soft">
              {deck.info.price !== undefined
                ? `${deck.info.price.toLocaleString()}원`
                : deck.id === "classic"
                  ? "무료"
                  : "출시 예정"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
