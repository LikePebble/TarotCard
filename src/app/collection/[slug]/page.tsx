import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { CollectHistory } from "@/components/CollectHistory";
import { DeckAwareArt } from "@/components/DeckAwareArt";
import { DesktopNav } from "@/components/SiteNav";
import { cardBySlug, cards, romanNumeral } from "@/data/cards";
import { koCards } from "@/data/ko";

const SUIT_KO = {
  cups: "컵",
  wands: "완드",
  swords: "소드",
  pentacles: "펜타클",
} as const;

export function generateStaticParams() {
  return cards.map((card) => ({ slug: card.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const card = cardBySlug.get(slug);
  if (!card) return { title: "아르카나" };
  const nameKo = koCards[card.slug]?.nameKo ?? card.nameEn;
  return {
    title: `${nameKo} ${card.nameEn} | 아르카나`,
    description: `${nameKo} 카드의 해석과 수집 이력을 확인하세요.`,
  };
}

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const card = cardBySlug.get(slug);
  if (!card) notFound();

  const ko = koCards[card.slug];
  const nameKo = ko?.nameKo ?? card.nameEn;
  const description =
    ko?.description && ko.description.length > 0
      ? ko.description
      : card.en.description;
  const paragraphs = description.split("\n\n");
  const enParagraphs = card.en.description.split("\n\n");

  const index = cards.indexOf(card);
  const prev = cards[(index + cards.length - 1) % cards.length];
  const next = cards[(index + 1) % cards.length];
  const prevNameKo = koCards[prev.slug]?.nameKo ?? prev.nameEn;
  const nextNameKo = koCards[next.slug]?.nameKo ?? next.nameEn;

  const arcanaLabel =
    card.arcana === "major"
      ? `메이저 아르카나 ${romanNumeral(card.number)}`
      : `마이너 아르카나 · ${SUIT_KO[card.suit as keyof typeof SUIT_KO]}`;

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <DesktopNav active="collection" />
      <nav className="flex h-14 flex-none items-center px-5 lg:hidden">
        <Link
          href="/collection"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted hover:text-cream"
        >
          <CaretLeft size={16} aria-hidden />
          컬렉션
        </Link>
      </nav>
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 pb-10 pt-1 lg:px-[72px] lg:pb-[88px] lg:pt-14">
        <Link
          href="/collection"
          className="hidden items-center gap-1.5 text-sm text-muted hover:text-cream lg:inline-flex"
        >
          <CaretLeft size={16} aria-hidden />
          컬렉션
        </Link>
        <div className="lg:mt-10 lg:grid lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-[72px]">
          <div className="flex justify-center lg:block">
            <div className="relative mt-1 aspect-[2/3.4] w-[216px] overflow-hidden rounded-xl bg-ink-2 shadow-[0_24px_60px_rgba(8,5,0,0.65)] lg:mt-0 lg:w-full lg:rounded-[14px] lg:shadow-[0_30px_80px_rgba(8,5,0,0.65)]">
              <DeckAwareArt
                card={card}
                sizes="(min-width: 1024px) 380px, 216px"
                priority
                showText
              />
            </div>
          </div>
          <div>
            <p className="mt-6 text-center text-[13px] text-muted lg:mt-0 lg:text-left lg:text-[14px]">
              {arcanaLabel}
            </p>
            <h1 className="mt-0.5 mb-[18px] text-center font-serif text-[30px] font-semibold lg:mb-6 lg:text-left lg:text-[46px]">
              {nameKo}{" "}
              <span className="ml-1 text-base font-normal text-muted lg:text-[22px]">
                {card.nameEn}
              </span>
            </h1>
            <div className="space-y-3 text-[15px] text-body lg:max-w-[560px] lg:text-base">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
            <details className="mt-3.5 lg:mt-5">
              <summary className="inline-block min-h-11 cursor-pointer pt-2.5 text-[13.5px] text-muted underline underline-offset-4 hover:text-cream">
                영어 원문 보기
              </summary>
              <div className="mt-2 space-y-3 text-[14px] text-body lg:max-w-[560px]">
                {enParagraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
            </details>
            <CollectHistory slug={card.slug} />
            <div className="mt-7 flex justify-between border-t border-line pt-5 lg:mt-14 lg:pt-7">
              <Link
                href={`/collection/${prev.slug}`}
                className="inline-flex min-h-11 items-center gap-1.5 text-[13.5px] text-muted hover:text-gold-soft lg:text-[15px]"
              >
                <CaretLeft size={14} aria-hidden />
                {prevNameKo} {prev.nameEn}
              </Link>
              <Link
                href={`/collection/${next.slug}`}
                className="inline-flex min-h-11 items-center gap-1.5 text-[13.5px] text-muted hover:text-gold-soft lg:text-[15px]"
              >
                {nextNameKo} {next.nameEn}
                <CaretRight size={14} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
