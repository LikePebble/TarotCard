import type { Metadata } from "next";
import { headers } from "next/headers";
import { localeFromHeaders } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const english = localeFromHeaders(await headers()) === "en";
  const title = english
    ? "Free Tarot Reading — Daily Card & Three-Card Spread | Arca Tarot"
    : "무료 타로 리딩 | 오늘의 카드·과거 현재 미래 | 아르카 타로";
  const description = english
    ? "Draw a free daily tarot card or a three-card past, present, and future spread, then read upright and reversed meanings."
    : "무료로 오늘의 타로 카드 한 장 또는 과거·현재·미래 3장을 뽑고 정방향·역방향 해석을 읽어보세요.";

  return {
    title: { absolute: title },
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default function ReadingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
