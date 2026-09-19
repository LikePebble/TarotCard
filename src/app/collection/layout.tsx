import type { Metadata } from "next";
import { headers } from "next/headers";
import { localeFromHeaders } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const english = localeFromHeaders(await headers()) === "en";
  const title = english
    ? "Tarot Card Collection — 78 Cards & Decks | Arca Tarot"
    : "타로 카드 78장 컬렉션과 덱 | 아르카 타로";
  const description = english
    ? "Browse the 78-card tarot collection, choose a deck, and open each card's upright and reversed meaning."
    : "타로 카드 78장 컬렉션과 덱을 둘러보고, 카드별 정방향·역방향 의미와 해석을 확인해 보세요.";

  return {
    title: { absolute: title },
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default function CollectionLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
