import { cards } from "@/data/cards";

export const dynamic = "force-dynamic";

/**
 * Legacy API compatibility: GET /cards/onecard returns one random card.
 * 매 요청 무작위 카드를 돌려주는 것이 의도이므로 force-dynamic은 유지한다.
 * 검색엔진 색인만 막는다.
 */
export function GET() {
  const card = cards[Math.floor(Math.random() * cards.length)];
  return Response.json(
    {
      name: card.nameEn,
      description: card.en.description,
      image: card.image,
    },
    { headers: { "X-Robots-Tag": "noindex" } },
  );
}
