import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import { CardArtViewer } from "@/components/CardArtViewer";
import { CollectHistory } from "@/components/CollectHistory";
import { CollectedCardNav } from "@/components/CollectedCardNav";
import { MarkCollectionCardSeen } from "@/components/MarkCollectionCardSeen";
import { DesktopNav } from "@/components/SiteNav";
import { LoreSections } from "@/components/LoreSections";
import { cardBySlug, cards, romanNumeral } from "@/data/cards";
import { deckArtSrc, decks } from "@/data/decks";
import { koCards } from "@/data/ko";
import { reversedCards } from "@/data/reversed";
import { cardMetaDescription, cardMetaTitle } from "@/lib/card-meta";
import { validReadingId } from "@/lib/card-detail-nav";
import { catalogFilterOf, filterForCard } from "@/lib/catalog-filter";

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

const SITE_URL = "https://arca.realm.ai.kr";
// 루트 layout의 openGraph.siteName과 같은 값이어야 한다. 여기만 "아르카"로 두면
// 같은 사이트가 공유 카드마다 다른 이름으로 보인다.
const SITE_NAME = "아르카 타로";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ deckId: string; slug: string }>;
}): Promise<Metadata> {
  const { deckId, slug } = await params;
  const card = cardBySlug.get(slug);
  const deck = decks.find((d) => d.id === deckId && d.active);
  // title은 absolute로 둔다. 루트 layout에 title.template이 생기더라도
  // 여기서 만든 완성형 제목 뒤에 접미사가 한 번 더 붙지 않게 하려는 것이다.
  if (!card || !deck) return { title: { absolute: "아르카 | Arca" } };
  const nameKo = koCards[card.slug]?.nameKo ?? card.nameEn;
  const description = cardMetaDescription(
    nameKo,
    card.nameEn,
    koCards[card.slug]?.description || card.en.description,
  );
  // 3개 덱은 아트만 다르고 해석 본문이 같다. 클래식을 정본으로 삼아
  // 프리미엄 덱 156장과 ?filter=/?readingId= 변종을 한 URL로 모은다.
  const canonical = `${SITE_URL}/collection/classic/${card.slug}`;
  const title = cardMetaTitle(nameKo, card.nameEn, deck.nameKo);
  const image = {
    url: `${SITE_URL}${deckArtSrc(deck.id, card)}`,
    alt: `${deck.nameKo} ${nameKo} ${card.nameEn} 카드 아트`,
  };

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      title,
      description,
      url: canonical,
      images: [image],
    },
    // twitter를 빼면 루트 layout의 트위터 태그를 그대로 상속한다. og는 이 카드인데
    // 트위터 카드만 홈 제목·홈 이미지로 뜨는 어긋남이 생기므로 여기서 덮어쓴다.
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function CardDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ deckId: string; slug: string }>;
  searchParams: Promise<{ readingId?: string | string[]; filter?: string | string[] }>;
}) {
  const [{ deckId, slug }, query] = await Promise.all([params, searchParams]);
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
  /*
   * 역방향 해석. 리딩 결과 화면에만 있어서 검색 엔진이 볼 수 없던 글이다.
   * 새로 쓰는 것이 아니라 이미 원전 감사를 통과한 정본을 그대로 꺼내 온다.
   */
  const reversed = reversedCards[card.slug];
  const reversedParagraphs = reversed ? reversed.ko.split("\n\n") : [];
  const reversedEnParagraphs = reversed ? reversed.en.split("\n\n") : [];

  const arcanaLabel =
    card.arcana === "major"
      ? `메이저 아르카나 ${romanNumeral(card.number)}`
      : `마이너 아르카나 · ${SUIT_KO[card.suit as keyof typeof SUIT_KO]}`;

  const readingId = validReadingId(query.readingId);
  const filter = catalogFilterOf(query.filter) ?? filterForCard(card);
  const backHref = readingId
    ? `/reading/${encodeURIComponent(readingId)}`
    : `/collection/${deck.id}?filter=${filter}`;
  const backLabel = readingId ? "리딩으로 돌아가기" : deck.nameKo;

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <DesktopNav active="collection" />
      <nav className="flex h-14 flex-none items-center px-5 lg:hidden">
        <Link
          href={backHref}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted hover:text-cream"
        >
          <CaretLeft size={16} aria-hidden />
          {backLabel}
        </Link>
      </nav>
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 pb-10 pt-1 lg:px-[72px] lg:pb-[88px] lg:pt-14">
        <MarkCollectionCardSeen deckId={deck.id} slug={card.slug} />
        <Link
          href={backHref}
          className="hidden items-center gap-1.5 text-sm text-muted hover:text-cream lg:inline-flex"
        >
          <CaretLeft size={16} aria-hidden />
          {backLabel}
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
            {reversed ? (
              <section className="mt-7 border-t border-line pt-6 lg:mt-9 lg:pt-7">
                <h2 className="font-display text-[19px] font-semibold text-gold-soft lg:text-[22px]">
                  역방향으로 나왔다면
                </h2>
                <p className="mt-1 text-[12.5px] text-muted lg:text-[13px]">
                  역방향은 정방향의 반대가 아니라, 같은 힘이 지연되거나 안으로
                  향하거나 과한 상태입니다.
                </p>
                <div className="mt-3 space-y-3 font-serif text-[15px] text-body lg:max-w-[560px] lg:text-base">
                  {reversedParagraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                  ))}
                </div>
                <details className="mt-3.5 lg:mt-5">
                  <summary className="inline-block min-h-11 cursor-pointer pt-2.5 text-[13.5px] text-muted underline underline-offset-4 hover:text-cream">
                    영어 원문 보기
                  </summary>
                  <div className="mt-2 space-y-3 font-serif text-[14px] text-body lg:max-w-[560px]">
                    {reversedEnParagraphs.map((paragraph) => (
                      <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                    ))}
                  </div>
                </details>
              </section>
            ) : null}
            <LoreSections slug={card.slug} deckId={deck.id} />
            <CollectHistory slug={card.slug} deckId={deck.id} />
            <CollectedCardNav
              deckId={deck.id}
              slug={card.slug}
              readingId={readingId}
              filter={filter}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
