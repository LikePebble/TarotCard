import type { Metadata } from "next";
import Link from "next/link";
import { DesktopNav } from "@/components/SiteNav";
import { cards } from "@/data/cards";
import { cardGroups, cardIndexLabel } from "@/lib/card-index";

/*
 * 카드 의미 색인.
 *
 * 사이트 어디에도 카드 상세로 가는 링크가 없었다. 도감은 아직 만나지 않은
 * 카드를 링크로 만들지 않기 때문이다(수집을 지키려는 옳은 결정). 그 결과
 * 78쪽이 전부 고아 페이지가 되어 구글이 URL만 알고 크롤링은 하지 않았다.
 *
 * 이 화면은 도감과 다르다. 도감은 "내가 무엇을 모았는가", 여기는 "이 카드가
 * 무슨 뜻인가"다. 카드 상세는 원래부터 공개돼 있고 sitemap에도 있으므로
 * 새로 여는 것은 없고, 없던 길만 낸다.
 *
 * 서버 컴포넌트다. 클라이언트에서 그리면 크롤러가 링크를 보지 못해 이 화면을
 * 만든 이유가 사라진다.
 */

const SITE_URL = "https://arca.realm.ai.kr";
const TITLE = "타로 카드 78장 의미 — 정방향·역방향 해석 | 아르카";
const DESCRIPTION =
  "타로 카드 78장의 한국어 해석을 카드별로 정리했습니다. 메이저 아르카나 22장과 완드·컵·소드·펜타클 각 14장의 정방향·역방향 의미를 카드 이름으로 찾아보세요.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/card-meanings` },
  openGraph: {
    type: "website",
    siteName: "아르카 타로",
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/card-meanings`,
  },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

export default function CardsIndexPage() {
  const groups = cardGroups();

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <DesktopNav active="collection" />
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 pb-16 pt-6 lg:px-[72px] lg:pb-[88px] lg:pt-14">
        <h1 className="font-display text-[28px] font-semibold lg:text-[40px]">
          타로 카드 78장의 의미
        </h1>
        <p className="mt-2.5 max-w-[64ch] font-serif text-[15px] leading-[1.85] text-body lg:text-base">
          카드 이름을 누르면 그 카드의 한국어 해석을 볼 수 있습니다. 정방향과
          역방향을 함께 담았고, 해석은 A.E. Waite의 『The Pictorial Key to the
          Tarot』(1911)와 S.L. Mathers의 『The Tarot』(1888)에서 뜻만 가져와 새로
          썼습니다. 겁주는 예언 대신, 지금 무엇을 살펴보면 좋을지를 말하는 쪽으로
          쓰였습니다.
        </p>

        <nav aria-label="카드 무리 바로가기" className="mt-6 flex flex-wrap gap-2">
          {groups.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="rounded-full border border-line px-3.5 py-1.5 text-[13px] text-muted transition-colors hover:border-line-gold hover:text-cream lg:text-[14px]"
            >
              {group.title.replace(/\s*\(.*\)$/, "")}
              <span className="ml-1.5 text-[11.5px] text-muted">
                {group.cards.length}
              </span>
            </a>
          ))}
        </nav>

        {groups.map((group) => (
          <section key={group.id} id={group.id} className="mt-10 scroll-mt-6 lg:mt-14">
            <h2 className="font-display text-[20px] font-semibold text-gold-soft lg:text-[24px]">
              {group.title}
            </h2>
            <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-[1.8] text-muted lg:text-[14.5px]">
              {group.blurb}
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3 lg:grid-cols-4">
              {group.cards.map((card) => {
                const label = cardIndexLabel(card);
                return (
                  <li key={card.slug}>
                    <Link
                      href={`/collection/classic/${card.slug}`}
                      className="flex min-h-11 items-baseline gap-2 py-1 text-[14px] text-body transition-colors hover:text-gold-soft lg:text-[15px]"
                    >
                      <span className="w-7 shrink-0 text-right text-[12px] text-muted tabular-nums lg:text-[13px]">
                        {label.ordinal}
                      </span>
                      <span>
                        {label.ko}
                        <span className="ml-1.5 text-[12px] text-muted lg:text-[13px]">
                          {label.en}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <p className="mt-14 border-t border-line pt-6 text-[13.5px] text-muted lg:text-[14px]">
          카드를 직접 뽑아 보고 싶으시면{" "}
          <Link href="/reading" className="text-gold-soft underline underline-offset-4">
            오늘의 리딩
          </Link>
          에서 시작하실 수 있습니다. 만난 카드는{" "}
          <Link href="/collection" className="text-gold-soft underline underline-offset-4">
            컬렉션
          </Link>
          에 차곡차곡 모입니다.
        </p>

        {/*
          ItemList 구조화 데이터. 목록 페이지가 무엇을 담고 있는지 명시해 두면
          크롤러가 78개 링크를 한 묶음으로 이해한다.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "타로 카드 78장의 의미",
              numberOfItems: cards.length,
              itemListElement: groups
                .flatMap((g) => g.cards)
                .map((card, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name: cardIndexLabel(card).ko,
                  url: `${SITE_URL}/collection/classic/${card.slug}`,
                })),
            }),
          }}
        />
      </main>
    </div>
  );
}
