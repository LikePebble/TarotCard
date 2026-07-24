"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CaretRight, Notebook, Sparkle } from "@phosphor-icons/react";
import { DesktopNav, MobileTopBar } from "@/components/SiteNav";
import { TabBar } from "@/components/TabBar";
import { useJournal } from "@/lib/journal";
import { togetherDays, useArcanaStore } from "@/lib/store";
import { AccountCard } from "./AccountCard";

export default function MyPage() {
  const { store } = useArcanaStore();
  const { store: journal } = useJournal();

  const readings = store?.readings.length ?? 0;
  const together = togetherDays(store);
  const days = journal ? Object.keys(journal).length : 0;

  const stats = [
    { label: "함께한 날", value: together, unit: "" },
    { label: "리딩", value: readings, unit: "회" },
    { label: "기록", value: days, unit: "일" },
  ];

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden lg:h-auto lg:min-h-[100dvh] lg:overflow-visible">
      <DesktopNav active="my" />
      <MobileTopBar />
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto w-full min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-2 lg:max-w-[760px] lg:overflow-visible lg:px-12 lg:pb-[88px] lg:pt-[72px]"
      >
        <h1 className="font-display text-[27px] font-semibold lg:text-[40px]">MY</h1>
        <p className="mt-1 text-[13px] text-muted lg:text-[14px]">
          당신이 만난 카드와 남긴 마음이 이곳에 쌓입니다.
        </p>

        <div className="mt-5 grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-ink-1 lg:mt-8 lg:rounded-[16px]">
          {stats.map((s) => (
            <div key={s.label} className="px-4 py-5 text-center lg:py-7">
              <p className="text-[12px] text-muted lg:text-[13px]">{s.label}</p>
              <p className="mt-1 font-display text-[26px] font-semibold text-gold-soft lg:text-[34px]">
                {s.value}
                <span className="ml-1 text-[13px] font-normal text-muted">
                  {s.unit}
                </span>
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2.5 lg:mt-6">
          <Link
            href="/my/journal"
            className="flex items-center justify-between rounded-2xl border border-line bg-ink-1 p-5 transition-colors hover:border-line-gold active:scale-[0.99] lg:rounded-[14px] lg:p-6"
          >
            <span className="flex items-center gap-3.5">
              <Notebook size={22} className="text-gold-soft" aria-hidden />
              <span>
                <span className="block font-display text-[17px] font-semibold lg:text-[19px]">
                  일별 기록
                </span>
                <span className="text-[13px] text-muted lg:text-[14px]">
                  {days > 0
                    ? `달력에서 ${days}일의 기록과 일기를 봅니다`
                    : "달력에서 리딩과 그날의 일기를 봅니다"}
                </span>
              </span>
            </span>
            <CaretRight size={18} className="text-muted" aria-hidden />
          </Link>

          <div className="rounded-2xl border border-line bg-ink-1 p-5 opacity-60 lg:rounded-[14px] lg:p-6">
            <span className="flex items-center gap-3.5">
              <Sparkle size={22} className="text-muted" aria-hidden />
              <span>
                <span className="block font-display text-[17px] font-semibold lg:text-[19px]">
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
      </motion.main>
      <TabBar />
    </div>
  );
}
