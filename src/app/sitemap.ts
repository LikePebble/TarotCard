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
 *
 * `lastModified`를 싣는 이유: 87쪽 중 54쪽이 "발견됨 – 현재 색인이 생성되지 않음"
 * 상태였다. 그중 다수가 이번에 역방향 해석이 붙어 실제로 바뀌었으므로, 바뀐
 * 시점을 알려 다시 보러 오게 한다. 배포 시각을 쓰는 이유는 정적 데이터에
 * 개별 수정 시각이 없기 때문이고, 카드 본문이 바뀌는 때가 곧 배포하는 때다.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const activeDecks = decks.filter((deck) => deck.active);
  const lastModified = new Date();

  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1, lastModified },
    { url: `${SITE_URL}/reading`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/collection`, changeFrequency: "monthly", priority: 0.8 },
    // 카드 상세 78쪽으로 가는 유일한 내부 링크 허브. 우선순위를 덱 목록보다
    // 높게 둔다 — 크롤러가 여기부터 들어와야 아래 78쪽에 닿는다.
    {
      url: `${SITE_URL}/card-meanings`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
      lastModified,
    },
    ...activeDecks.map((deck) => ({
      url: `${SITE_URL}/collection/${deck.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...cards.map((card) => ({
      url: `${SITE_URL}/collection/classic/${card.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      lastModified,
    })),
    // 약관·방침은 유입을 노리는 문서가 아니지만, 색인돼 있어야 신뢰 신호가 되고
    // 개정 이력을 공개적으로 확인할 수 있다. 우선순위는 가장 낮게 둔다.
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
