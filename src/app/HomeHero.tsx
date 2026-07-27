"use client";

import Image from "next/image";

export function HomeHero() {
  return (
    <div className="mt-4 flex flex-1 items-center justify-center px-4 lg:mt-0 lg:min-h-[650px] lg:flex-none">
      <div className="home-hero-frame relative aspect-[3/4] w-full max-w-[340px] md:max-w-[384px] lg:max-w-[460px]">
        <div className="home-hero-media absolute inset-0 overflow-hidden">
          <Image
            src="/hero/concept_candles.jpg"
            alt="달빛과 촛불이 비추는 타로 카드"
            fill
            sizes="(min-width: 1024px) 460px, (min-width: 768px) 384px, 340px"
            className="object-cover object-center"
            priority
          />
          <div
            className="home-hero-candle-glow home-hero-candle-glow-near pointer-events-none absolute inset-0"
            aria-hidden
          />
          <div
            className="home-hero-candle-glow home-hero-candle-glow-far pointer-events-none absolute inset-0"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-0/45 via-transparent to-ink-0/20"
            aria-hidden
          />
          <div
            className="home-hero-edge-feather pointer-events-none absolute inset-0"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
