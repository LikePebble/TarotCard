"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FlowHeader } from "@/components/FlowHeader";
import { DesktopNav } from "@/components/SiteNav";
import { focusOptionsFor } from "@/data/focus";
import {
  getPendingSpread,
  setPendingFocus,
  type SpreadType,
} from "@/lib/store";

export default function FocusPage() {
  const router = useRouter();
  const [spread, setSpread] = useState<SpreadType | null>(null);

  useEffect(() => {
    const pending = getPendingSpread();
    if (!pending) {
      router.replace("/reading");
      return;
    }
    setSpread(pending);
  }, [router]);

  const choose = (focus: string) => {
    setPendingFocus(focus);
    router.push("/reading/draw");
  };

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <DesktopNav active="reading" />
      <FlowHeader backHref="/reading" backLabel="리딩" step="2 / 3" />
      <main className="mx-auto w-full max-w-[860px] px-6 pb-8 pt-3 lg:px-12 lg:pb-24 lg:pt-[88px]">
        <p className="min-h-[21px] text-[13px] text-muted lg:mb-3.5 lg:text-[14px]">
          {spread === "three" ? (
            <>
              <b className="font-medium text-gold">과거 · 현재 · 미래</b> 카드를
              뽑습니다
            </>
          ) : spread === "one" ? (
            <>
              <b className="font-medium text-gold">오늘의 카드</b>를 뽑습니다
            </>
          ) : null}
        </p>
        <h1 className="mt-1 font-display text-[27px] font-semibold leading-[1.35] lg:mt-0 lg:text-[40px] lg:leading-[1.3]">
          무엇이 궁금한가요
        </h1>
        <div className="mt-[22px] border-t border-line lg:mt-10">
          {(spread ? focusOptionsFor(spread) : []).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => choose(option.id)}
              aria-label={option.label}
              className="group flex w-full items-baseline justify-between border-b border-line px-1 py-[22px] text-left lg:px-2 lg:py-[30px]"
            >
              <span className="font-display text-[21px] font-medium group-hover:text-gold-soft lg:text-[26px]">
                {option.label}
              </span>
              <span className="text-[13px] text-muted lg:text-[14.5px]">
                {option.desc}
              </span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
