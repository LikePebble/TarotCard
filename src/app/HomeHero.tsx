"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * 홈 대표 이미지 풀. 화면을 새로 열 때마다 이 중 하나가 무작위로 뜬다.
 * 이미지를 추가하면 그만큼 풀이 커진다 — 각 장은 자체 프레임까지 완결된
 * 세로 카드형(2:3.4)이라 앱은 둥근 모서리로 얹기만 한다.
 */
const HERO_IMAGES = ["/hero/hero-01.webp"];

export function HomeHero() {
  // 무작위 선택은 클라이언트에서만 한다 — 서버에서 고르면 하이드레이션이
  // 어긋나고 정적 캐시에 한 장이 굳어 버린다. 마운트 전에는 자리표시자만.
  const [index, setIndex] = useState<number | null>(null);
  useEffect(() => {
    setIndex(Math.floor(Math.random() * HERO_IMAGES.length));
  }, []);

  return (
    <div className="mt-4 flex flex-1 items-center justify-center lg:mt-0 lg:h-[480px] lg:flex-none">
      <div className="relative aspect-[2/3.4] w-full max-w-[200px] overflow-hidden rounded-xl bg-ink-2 shadow-[0_24px_60px_rgba(8,5,0,0.65)] lg:max-w-[256px] lg:rounded-[14px]">
        {index !== null ? (
          <Image
            src={HERO_IMAGES[index]}
            alt="오늘의 타로"
            fill
            sizes="(min-width: 1024px) 256px, 200px"
            // 애니메이션 webp는 next/image가 재인코딩하면 정지 프레임이 된다.
            // 손수 고른 소형 자산이라 최적화를 끄고 원본 그대로 내보낸다.
            unoptimized
            className="object-cover"
            priority
          />
        ) : null}
      </div>
    </div>
  );
}
