import type { Metadata } from "next";
import { headers } from "next/headers";
import { deckInfo, deckName, decks } from "@/data/decks";
import { localeFromHeaders } from "@/lib/locale";

const SITE_URL = "https://arca.realm.ai.kr";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ deckId: string }>;
}): Promise<Metadata> {
  const [{ deckId }, requestHeaders] = await Promise.all([params, headers()]);
  const locale = localeFromHeaders(requestHeaders);
  const english = locale === "en";
  const deck = decks.find((candidate) => candidate.id === deckId && candidate.active);
  if (!deck) return {};

  const name = deckName(deck, locale);
  const info = deckInfo(deck, locale);
  const title = english
    ? `${name} — 78-Card Tarot Deck | Arca Tarot`
    : `${name} 타로 덱 78장 | 아르카 타로`;
  const description =
    info.description[0] ??
    (english
      ? `Explore all 78 cards in the ${name} tarot deck.`
      : `${name}의 타로 카드 78장을 둘러보고 수집해 보세요.`);
  const canonical = `${SITE_URL}/collection/${deck.id}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
    },
    twitter: { title, description },
  };
}

export default function DeckLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
