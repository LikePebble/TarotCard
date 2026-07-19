"use client";

import Link from "next/link";
import { CaretRight, Notebook, Sparkle } from "@phosphor-icons/react";
import { DesktopNav, MobileTopBar } from "@/components/SiteNav";
import { TabBar } from "@/components/TabBar";
import { AccountCard } from "./AccountCard";
import { useJournal } from "@/lib/journal";
import { collectedCount, useArcanaStore, useSelectedDeck } from "@/lib/store";

export default function MyPage() {
  const { store } = useArcanaStore();
  const { store: journal } = useJournal();
  const { deckId } = useSelectedDeck();

  const readings = store?.readings.length ?? 0;
  const collected = store ? collectedCount(store, deckId) : 0;
  const days = journal ? Object.keys(journal).length : 0;

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <DesktopNav active="my" />
      <MobileTopBar />
      <main className="mx-auto w-full max-w-[760px] flex-1 px-5 pb-8 pt-2 lg:px-12 lg:pb-[88px] lg:pt-[72px]">
        <h1 className="font-serif text-[27px] font-semibold lg:text-[40px]">MY</h1>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:mt-8 lg:gap-5">
          <div className="rounded-2xl border border-line bg-ink-1 p-5 lg:rounded-[14px] lg:p-7">
            <p className="text-[12.5px] text-muted lg:text-[13px]">수집</p>
            <p className="mt-1 font-serif text-2xl font-semibold text-gold-soft lg:text-[32px]">
              {collected} <span className="text-sm font-normal text-muted">/ 78</span>
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-ink-1 p-5 lg:rounded-[14px] lg:p-7">
            <p className="text-[12.5px] text-muted lg:text-[13px]">리딩</p>
            <p className="mt-1 font-serif text-2xl font-semibold text-gold-soft lg:text-[32px]">
              {readings}
              <span className="ml-1 text-sm font-normal text-muted">회</span>
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2.5 lg:mt-6">
          <Link
            href="/my/journal"
            className="flex items-center justify-between rounded-2xl border border-line bg-ink-1 p-5 hover:border-line-gold lg:rounded-[14px] lg:p-6"
          >
            <span className="flex items-center gap-3.5">
              <Notebook size={22} className="text-gold-soft" aria-hidden />
              <span>
                <span className="block font-serif text-[17px] font-semibold lg:text-[19px]">
                  일별 기록
                </span>
                <span className="text-[13px] text-muted lg:text-[14px]">
                  {days > 0 ? `${days}일의 기록과 일기` : "리딩과 그날의 일기를 모아 봅니다"}
                </span>
              </span>
            </span>
            <CaretRight size={18} className="text-muted" aria-hidden />
          </Link>

          <div className="rounded-2xl border border-line bg-ink-1 p-5 opacity-60 lg:rounded-[14px] lg:p-6">
            <span className="flex items-center gap-3.5">
              <Sparkle size={22} className="text-muted" aria-hidden />
              <span>
                <span className="block font-serif text-[17px] font-semibold lg:text-[19px]">
                  사주 프로필
                </span>
                <span className="text-[13px] text-muted lg:text-[14px]">
                  생년월일시를 반영한 개인화 · 준비 중
                </span>
              </span>
            </span>
          </div>

          <AccountCard />
        </div>
      </main>
      <TabBar />
    </div>
  );
}
