import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import { CardArtViewer } from "@/components/CardArtViewer";
import { CollectHistory } from "@/components/CollectHistory";
import { CollectedCardNav } from "@/components/CollectedCardNav";
import { DesktopNav } from "@/components/SiteNav";
import { LoreSections } from "@/components/LoreSections";
import { cardBySlug, cards, romanNumeral } from "@/data/cards";
import { decks } from "@/data/decks";
import { koCards } from "@/data/ko";

const SUIT_KO = {
  cups: "컵",
  wands: "완드",
  swords: "소드",
  pentacles: "펜타클",
} as const;

/** 덱 × 카드 = 3 × 78 = 234장. 전부 빌드 타임 산출이라 런타임 비용은 없다. */
export function generateStaticParams() {
  return decks
    .filter((deck) => deck.active)
    .flatMap((deck) =>
      cards.map((card) => ({ deckId: deck.id, slug: card.slug })),
    );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ deckId: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const card = cardBySlug.get(slug);
  if (!card) return { title: "에그타로트" };
  const nameKo = koCards[card.slug]?.nameKo ?? card.nameEn;
  return {
    title: `${nameKo} ${card.nameEn} | 에그타로트`,
    description: `${nameKo} 카드의 해석과 수집 이력을 확인하세요.`,
  };
}

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ deckId: string; slug: string }>;
}) {
  const { deckId, slug } = await params;
  const deck = decks.find((d) => d.id === deckId && d.active);
  const card = cardBySlug.get(slug);
  if (!deck || !card) notFound();

  const ko = koCards[card.slug];
  const nameKo = ko?.nameKo ?? card.nameEn;
  const description =
    ko?.description && ko.description.length > 0
      ? ko.description
      : card.en.description;
  const paragraphs = description.split("\n\n");
  const enParagraphs = card.en.description.split("\n\n");

  const arcanaLabel =
    card.arcana === "major"
      ? `메이저 아르카나 ${romanNumeral(card.number)}`
      : `마이너 아르카나 · ${SUIT_KO[card.suit as keyof typeof SUIT_KO]}`;

  const backHref = `/collection/${deck.id}`;

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <DesktopNav active="collection" />
      <nav className="flex h-14 flex-none items-center px-5 lg:hidden">
        <Link
          href={backHref}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted hover:text-cream"
        >
          <CaretLeft size={16} aria-hidden />
          {deck.nameKo}
        </Link>
      </nav>
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 pb-10 pt-1 lg:px-[72px] lg:pb-[88px] lg:pt-14">
        <Link
          href={backHref}
          className="hidden items-center gap-1.5 text-sm text-muted hover:text-cream lg:inline-flex"
        >
          <CaretLeft size={16} aria-hidden />
          {deck.nameKo}
        </Link>
        <div className="lg:mt-10 lg:grid lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-[72px]">
          <div className="flex justify-center lg:block">
            <CardArtViewer card={card} deckOverride={deck.id} />
          </div>
          <div>
            <p className="mt-6 text-center text-[13px] text-muted lg:mt-0 lg:text-left lg:text-[14px]">
              {arcanaLabel}
            </p>
            <h1 className="mt-0.5 mb-[18px] text-center font-display text-[30px] font-semibold lg:mb-6 lg:text-left lg:text-[46px]">
              {nameKo}
              <span className="mt-1 block text-base font-normal text-muted lg:text-[22px]">
                {card.nameEn}
              </span>
            </h1>
            <div className="space-y-3 font-serif text-[15px] text-body lg:max-w-[560px] lg:text-base">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
            <details className="mt-3.5 lg:mt-5">
              <summary className="inline-block min-h-11 cursor-pointer pt-2.5 text-[13.5px] text-muted underline underline-offset-4 hover:text-cream">
                영어 원문 보기
              </summary>
              <div className="mt-2 space-y-3 font-serif text-[14px] text-body lg:max-w-[560px]">
                {enParagraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
            </details>
            <LoreSections slug={card.slug} deckId={deck.id} />
            <CollectHistory slug={card.slug} deckId={deck.id} />
            <CollectedCardNav deckId={deck.id} slug={card.slug} />
          </div>
        </div>
      </main>
    </div>
  );
}
