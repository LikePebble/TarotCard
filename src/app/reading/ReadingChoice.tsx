"use client";

import { useRouter } from "next/navigation";
import { CardBack } from "@/components/CardBack";
import { setPendingSpread, type SpreadType } from "@/lib/store";

export function ReadingChoice() {
  const router = useRouter();

  const choose = (spread: SpreadType) => {
    setPendingSpread(spread);
    router.push("/reading/focus");
  };

  const panel =
    "flex w-full flex-col items-start gap-[18px] rounded-2xl border border-line bg-ink-1 p-6 text-left hover:border-line-gold lg:min-h-[330px] lg:justify-between lg:rounded-[14px] lg:p-10";

  return (
    <div className="mt-[18px] flex flex-col gap-[18px] lg:mt-12 lg:grid lg:grid-cols-[1.25fr_1fr] lg:gap-5">
      <button
        type="button"
        onClick={() => choose("one")}
        aria-label="오늘의 카드"
        className={panel}
      >
        <div>
          <h2 className="font-serif text-[21px] font-semibold lg:text-[27px]">
            오늘의 카드
          </h2>
          <p className="mt-1 text-[13.5px] text-muted lg:max-w-[300px] lg:text-[15px]">
            한 장의 카드로 오늘 하루의 흐름을 봅니다.
          </p>
        </div>
        <div className="flex gap-1.5 lg:mt-7 lg:gap-2.5">
          <CardBack className="aspect-[2/3.4] w-[52px] lg:w-24" />
        </div>
      </button>
      <button
        type="button"
        onClick={() => choose("three")}
        aria-label="과거 · 현재 · 미래"
        className={panel}
      >
        <div>
          <h2 className="whitespace-nowrap font-serif text-[21px] font-semibold lg:text-[27px]">
            과거 · 현재 · 미래
          </h2>
          <p className="mt-1 text-[13.5px] text-muted lg:max-w-[300px] lg:text-[15px]">
            세 장의 카드로 지나온 길과 다가올 길을 읽습니다.
          </p>
        </div>
        <div className="flex gap-1.5 lg:mt-7 lg:gap-2.5">
          <CardBack className="aspect-[2/3.4] w-11 lg:w-[74px]" />
          <CardBack className="aspect-[2/3.4] w-11 lg:w-[74px]" />
          <CardBack className="aspect-[2/3.4] w-11 lg:w-[74px]" />
        </div>
      </button>
    </div>
  );
}
