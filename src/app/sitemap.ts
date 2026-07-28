import type { MetadataRoute } from "next";
import { cards } from "@/data/cards";
import { decks } from "@/data/decks";

const SITE_URL = "https://arca.realm.ai.kr";

/**
 * 카드 상세는 클래식 78장만 싣는다. 프리미엄 덱의 156장은 본문이 같아
 * `/collection/classic/{slug}`로 canonical을 몰아 두었으므로, 여기에 함께
 * 넣으면 "색인해 달라"와 "정본은 저쪽"이라는 상반된 신호가 된다.
 *
 * 덱·카드 목록은 카드 상세의 generateStaticParams와 같은 소스를 쓴다.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const activeDecks = decks.filter((deck) => deck.active);

  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/reading`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/collection`, changeFrequency: "monthly", priority: 0.8 },
    ...activeDecks.map((deck) => ({
      url: `${SITE_URL}/collection/${deck.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...cards.map((card) => ({
      url: `${SITE_URL}/collection/classic/${card.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    // 약관·방침은 유입을 노리는 문서가 아니지만, 색인돼 있어야 신뢰 신호가 되고
    // 개정 이력을 공개적으로 확인할 수 있다. 우선순위는 가장 낮게 둔다.
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
